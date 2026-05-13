/**
 * Boss Service
 * Business logic for boss encounters, damage, and defeat
 *
 * Dependencies:
 * - Sessions (damage applied during sessions)
 * - Progression (level gates boss unlocks)
 * - Rewards (boss defeat rewards)
 * - Squads (squad boss encounters)
 */

import { eventBus } from '../../events';
import * as repository from './repository';
import { CreateEncounterInputSchema, ApplyDamageInputSchema, CalculateDamageInputSchema, type BossDefeatResult, type CreateEncounterInput, type ApplyDamageInput, type CalculateDamageInput } from './schemas';
import { generateVariableReward } from './boss-reward-generator';

// ============================================================================
// Boss Health Scaling
// ============================================================================
// ============================================================================
// Boss Unlock Logic
// ============================================================================
// ============================================================================
// Encounter Management
// ============================================================================
// ============================================================================
// Damage Calculation and Application
// ============================================================================
// ============================================================================
// Boss Defeat Handling
// ============================================================================

async function handleBossDefeat(encounterId: string): Promise<BossDefeatResult> {
  const encounter = await repository.markEncounterDefeated(encounterId);
  const template = await repository.fetchBossTemplate(encounter.bossId);

  if (!template) {
    throw new Error(`Boss template not found: ${encounter.bossId}`);
  }

  // Get contributors
  const contributors = encounter.userId ? [encounter.userId] : []; // For squad encounters, fetch all members

  // Create rewards for each contributor
  const rewards = contributors.flatMap((userId) => {
    if (template.rewardType === 'VARIABLE_REWARD') {
      return generateVariableReward(userId);
    }
    return [{
      userId,
      type: template.rewardType,
      amount: template.rewardAmount,
      itemId: template.rewardItemId,
    }];
  });

  // Record defeat for each contributor
  for (const userId of contributors) {
    await repository.recordBossDefeat(userId, encounter.bossId, encounterId, encounter.damageDealt);
  }

  // Unlock next boss for contributors
  let nextBossId: string | null = null;
  const templates = await repository.fetchBossTemplates();
  const currentIndex = templates.findIndex((t) => t.id === encounter.bossId);
  if (currentIndex >= 0 && currentIndex < templates.length - 1) {
    nextBossId = templates[currentIndex + 1].id;
  }

  const result = {
    encounterId,
    bossId: encounter.bossId,
    defeatedAt: Date.now(),
    contributors,
    rewards,
    unlockedNextBoss: nextBossId,
  };

  eventBus.publish('boss:defeated', {
    userId: encounter.userId ?? contributors[0] ?? '',
    bossId: encounter.bossId,
    damageDealt: encounter.damageDealt,
    won: true,
    rewards: {
      xp: rewards.reduce((sum, r) => r.type === 'XP' ? sum + r.amount : sum, 0),
      coins: rewards.reduce((sum, r) => r.type === 'COINS' ? sum + r.amount : sum, 0),
      items: rewards.filter(r => (r.type === 'ITEM' || r.type === 'AESTHETIC' || r.type === 'INSIGHT') && r.itemId).map(r => r.itemId as string),
    },
    participants: contributors,
  });

  return result;
}

async function handleBossTimeout(encounterId: string): Promise<void> {
  await repository.markEncounterTimeout(encounterId);
}

// ============================================================================
// Boss Defeat Summary
// ============================================================================
// ============================================================================
// Boss Templates and Listing
// ============================================================================
export * from "./service.part1";
export * from "./service.part2";
