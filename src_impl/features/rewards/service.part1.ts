import { eventBus } from "../../events";
import * as repository from "./repository";
import { CreateRewardInputSchema, ClaimRewardInputSchema, CalculateRewardInputSchema, type Reward, type RewardCalculation, type CreateRewardInput, type ClaimRewardInput, type CalculateRewardInput, type Deliverable } from "./schemas";


export function calculateReward(input: CalculateRewardInput): RewardCalculation {
  const validated = CalculateRewardInputSchema.parse(input);

  let finalAmount = validated.baseAmount;
  const multipliers: RewardCalculation['multipliers'] = [];
  const bonuses: RewardCalculation['bonuses'] = [];

  // Level bonus (5% per level)
  const levelBonus = validated.userLevel * 0.05;
  if (levelBonus > 0) {
    multipliers.push({
      source: 'Level Bonus',
      value: 1 + levelBonus,
      description: `+${Math.floor(levelBonus * 100)}% for level ${validated.userLevel}`,
    });
    finalAmount *= 1 + levelBonus;
  }

  // Streak bonus
  if (validated.streakDays >= 7) {
    const streakMultiplier = validated.streakDays >= 30 ? 1.5 : validated.streakDays >= 14 ? 1.25 : 1.1;
    multipliers.push({
      source: 'Streak Bonus',
      value: streakMultiplier,
      description: `${validated.streakDays} day streak`,
    });
    finalAmount *= streakMultiplier;
  }

  // Squad bonus
  if (validated.squadMultiplier > 1) {
    multipliers.push({
      source: 'Squad Bonus',
      value: validated.squadMultiplier,
      description: `Squad multiplier x${validated.squadMultiplier}`,
    });
    finalAmount *= validated.squadMultiplier;
  }

  // Boss bonus
  if (validated.bossActive) {
    bonuses.push({
      source: 'Boss Battle',
      amount: Math.floor(validated.baseAmount * 0.25),
      description: 'Active boss encounter',
    });
    finalAmount += Math.floor(validated.baseAmount * 0.25);
  }

  return {
    baseAmount: validated.baseAmount,
    multipliers,
    bonuses,
    finalAmount: Math.floor(finalAmount),
  };
}

export async function createReward(input: CreateRewardInput): Promise<Reward> {
  const validated = CreateRewardInputSchema.parse(input);

  // Check for duplicates
  if (validated.triggerId) {
    const isDuplicate = await repository.checkDuplicateReward(validated.userId, validated.triggerType, validated.triggerId);
    if (isDuplicate) {
      throw new Error('Duplicate reward: already granted for this trigger');
    }
  }

  const reward = await repository.createReward(validated.userId, validated.type, validated.amount, validated.triggerType, validated.triggerId || null, validated.expiresAt || null);

  // Record ledger entry
  await repository.recordLedgerEntry(reward.id, 'CREATED', {
    type: validated.type,
    amount: validated.amount,
    triggerType: validated.triggerType,
  });

  return reward;
}

export async function claimReward(input: ClaimRewardInput): Promise<{
  success: boolean;
  deliverables: Deliverable[];
  errors: string[];
}> {
  const validated = ClaimRewardInputSchema.parse(input);

  const reward = await repository.fetchReward(validated.rewardId);
  if (!reward) {
    throw new Error('Reward not found');
  }

  if (reward.userId !== validated.userId) {
    throw new Error('Unauthorized: reward belongs to different user');
  }

  if (reward.status !== 'PENDING') {
    throw new Error(`Cannot claim reward in ${reward.status} status`);
  }

  if (reward.expiresAt && reward.expiresAt < Date.now()) {
    await repository.markRewardExpired(validated.rewardId);
    throw new Error('Reward has expired');
  }

  // Build deliverables
  const deliverables: Deliverable[] = [];
  const errors: string[] = [];

  if (reward.amount && reward.amount > 0) {
    deliverables.push({
      type: mapRewardTypeToDeliverable(reward.type),
      amount: reward.amount,
      itemId: reward.itemId,
      delivered: false,
      deliveredAt: null,
    });
  }

  // Deliver to economy/progression systems
  for (const deliverable of deliverables) {
    try {
      await deliverReward(validated.userId, deliverable);
      deliverable.delivered = true;
      deliverable.deliveredAt = Date.now();
    } catch (error) {
      errors.push(`Failed to deliver ${deliverable.type}: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  // Mark as claimed if all deliverables succeeded
  const allDelivered = deliverables.every((d) => d.delivered);
  if (allDelivered) {
    await repository.markRewardClaimed(validated.rewardId);
    await repository.recordLedgerEntry(validated.rewardId, 'CLAIMED', {
      deliverables: deliverables.map((d) => ({ type: d.type, amount: d.amount })),
    });

    eventBus.publish('reward:claimed', {
      rewardId: validated.rewardId,
      userId: validated.userId,
      claimedAt: Date.now(),
      actualValue: reward.amount || 0,
      appliedBoosts: [],
    });
  } else if (errors.length > 0) {
    await repository.markRewardFailed(validated.rewardId);
    await repository.recordLedgerEntry(validated.rewardId, 'FAILED', { errors });
  }

  return {
    success: allDelivered,
    deliverables,
    errors,
  };
}