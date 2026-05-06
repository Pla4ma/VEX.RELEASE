import * as Sentry from "@sentry/react-native";
import { eventBus } from "../../events";
import { getRewardService } from "../../rewards/RewardService";
import * as repository from "./repository";
import { AssignChallengeInputSchema, ClaimChallengeRewardInputSchema, ChallengeProgressCheckResultSchema, ChallengeRewardSchema, DailyChallengeContextSchema, RerollChallengeInputSchema, type AssignChallengeInput, type Challenge, type ChallengeCompletionResult, type ChallengeDetail, type ChallengeProgressCheckResult, type ChallengeReward, type DailyChallengeContext, type DailyChallengeTriggerType, type RerollEligibility, type RerollResult, type UpdateChallengeProgressInput, UpdateChallengeProgressInputSchema, type UserChallenge, type UserChallengeSummary } from "./schemas";

const CONFIG = {
  FREE_REROLLS_PER_DAY: 1,
  PAID_REROLL_COST: 10,
  MAX_REROLLS_PER_DAY: 10,
  DAILY_CHALLENGE_EXPIRY_HOURS: 24,
} as const;

export class ChallengeError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ChallengeError";
  }
}

export class ChallengeNotFoundError extends ChallengeError {
  constructor(challengeId: string) {
    super(`Challenge not found: ${challengeId}`, "CHALLENGE_NOT_FOUND", { challengeId });
  }
}

export class ChallengeNotActiveError extends ChallengeError {
  constructor(challengeId: string, status: string) {
    super(`Challenge is not active: ${challengeId}`, "CHALLENGE_NOT_ACTIVE", { challengeId, status });
  }
}

export class RerollNotAllowedError extends ChallengeError {}
export class RerollLimitExceededError extends ChallengeError {}
export class InsufficientGemsForRerollError extends ChallengeError {}

const rewardBundleFor = (challenge: Challenge) => ({
  xpReward: challenge.rewardAmount,
  coinReward: challenge.rewardAmount >= 500 ? 250 : challenge.rewardAmount >= 250 ? 100 : 50,
});

const inferTriggerDelta = (challenge: Challenge, triggerType: DailyChallengeTriggerType, context: DailyChallengeContext): number => {
  if (challenge.category === "MINUTES" && triggerType === "SESSION_COMPLETED") {
    return context.minutesCompleted ?? 0;
  }
  if (challenge.category === "SESSIONS" && triggerType === "SESSION_COMPLETED") {
    return context.sessionCount ?? 1;
  }
  if (challenge.category === "SOCIAL" && triggerType === "MOOD_LOGGED") {
    return context.moodLogged ? 1 : 0;
  }
  if (challenge.category === "STREAK" && triggerType === "STREAK_CHECKED") {
    return context.streakChecked ? 1 : 0;
  }
  if (challenge.category === "BOSS_DAMAGE" && triggerType === "PURITY_RECORDED") {
    return typeof context.purity === "number" && context.purity >= 80 ? 1 : 0;
  }
  if (challenge.category === "ACHIEVEMENT" && triggerType === "STREAK_UPDATED") {
    return typeof context.streakDays === "number" && context.streakDays >= challenge.targetValue ? challenge.targetValue : 0;
  }
  return 0;
};

const toCompletionResult = async (detail: ChallengeDetail, updatedChallenge: UserChallenge): Promise<ChallengeCompletionResult> => {
  const now = Date.now();
  const rewards: ChallengeReward[] = [];
  if (detail.xpReward > 0) {
    rewards.push(ChallengeRewardSchema.parse({ type: "XP", amount: detail.xpReward, itemId: null, delivered: false, deliveredAt: null }));
  }
  if (detail.coinReward > 0) {
    rewards.push(ChallengeRewardSchema.parse({ type: "COINS", amount: detail.coinReward, itemId: null, delivered: false, deliveredAt: null }));
  }
  await repository.updateUserChallenge(updatedChallenge.userId, updatedChallenge.challengeId, {
    status: "COMPLETED",
    completedAt: now,
    currentValue: Math.min(updatedChallenge.currentValue, detail.requiredCount),
  });
  eventBus.publish("challenge:completed", { userId: updatedChallenge.userId, challengeId: updatedChallenge.challengeId, completedAt: now });
  return {
    success: true,
    challengeId: updatedChallenge.challengeId,
    userId: updatedChallenge.userId,
    completedAt: now,
    rewards,
    xpEarned: detail.xpReward,
    seasonProgressAdvanced: false,
    newTierUnlocked: false,
    timeToComplete: Math.max(0, now - updatedChallenge.assignedAt),
    wasRerolled: updatedChallenge.rerollCount > 0,
  };
};

export async function assignChallenge(input: AssignChallengeInput): Promise<UserChallenge> {
  const validated = AssignChallengeInputSchema.parse(input);
  const challengeId = validated.challengeId;
  if (!challengeId) {
    throw new ChallengeError("A concrete challengeId is required for assignment", "CHALLENGE_ID_REQUIRED");
  }
  return repository.createUserChallenge(validated.userId, challengeId, Date.now() + CONFIG.DAILY_CHALLENGE_EXPIRY_HOURS * 60 * 60 * 1000);
}

export async function updateChallengeProgress(input: UpdateChallengeProgressInput): Promise<ChallengeCompletionResult | null> {
  const validated = UpdateChallengeProgressInputSchema.parse(input);
  const [userChallenge, challenge] = await Promise.all([repository.fetchUserChallenge(validated.userId, validated.challengeId), repository.fetchChallengeById(validated.challengeId)]);
  if (!userChallenge || !challenge) {
    throw new ChallengeNotFoundError(validated.challengeId);
  }
  if (userChallenge.status !== "ACTIVE") {
    throw new ChallengeNotActiveError(validated.challengeId, userChallenge.status);
  }
  const updated = await repository.addChallengeProgress(validated.userId, validated.challengeId, validated.delta, validated.source);
  eventBus.publish("challenge:progress", {
    userId: validated.userId,
    challengeId: validated.challengeId,
    progress: updated.currentValue,
    target: challenge.targetValue,
    percent: Math.min(100, Math.round((updated.currentValue / challenge.targetValue) * 100)),
  });
  if (updated.currentValue < challenge.targetValue) {
    return null;
  }
  return toCompletionResult({ challenge, userChallenge, ...rewardBundleFor(challenge), requiredCount: challenge.targetValue }, updated);
}

export async function checkChallengeProgress(userId: string, triggerType: DailyChallengeTriggerType, context: DailyChallengeContext): Promise<ChallengeProgressCheckResult> {
  const validatedContext = DailyChallengeContextSchema.parse(context);
  try {
    const details = await getActiveChallenges(userId);
    const updated: ChallengeDetail[] = [];
    const completed: ChallengeCompletionResult[] = [];
    for (const detail of details) {
      if (detail.userChallenge.status !== "ACTIVE") {
        continue;
      }
      const delta = inferTriggerDelta(detail.challenge, triggerType, validatedContext);
      if (delta <= 0) {
        continue;
      }
      const result = await updateChallengeProgress({
        userId,
        challengeId: detail.challenge.id,
        delta,
        source: triggerType,
        metadata: validatedContext,
      });
      updated.push(detail);
      if (result) {
        completed.push(result);
      }
    }
    return ChallengeProgressCheckResultSchema.parse({ updated, completed });
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: "challenges", action: "check-progress" } });
    throw error;
  }
}

export async function claimChallengeReward(input: { userId: string; challengeId: string }): Promise<{ success: boolean; rewards: ChallengeReward[]; error: string | null }> {
  const validated = ClaimChallengeRewardInputSchema.parse(input);
  try {
    const detail = (await getCompletedChallenges(validated.userId, 50)).find((item) => item.challenge.id === validated.challengeId);
    if (!detail) {
      return { success: false, rewards: [], error: "Challenge not completed" };
    }
    if (detail.userChallenge.status === "CLAIMED") {
      return { success: false, rewards: [], error: "Reward already claimed" };
    }
    const rewardService = getRewardService(validated.userId);
    const rewards: ChallengeReward[] = [];
    if (detail.xpReward > 0) {
      await rewardService.grantReward("XP", "CHALLENGE_COMPLETE", { baseAmount: 1 }, { exactAmount: detail.xpReward, challengeId: validated.challengeId });
      rewards.push({ type: "XP", amount: detail.xpReward, itemId: null, delivered: true, deliveredAt: Date.now() });
    }
    if (detail.coinReward > 0) {
      await rewardService.grantReward("CURRENCY", "CHALLENGE_COMPLETE", { baseAmount: 1 }, { exactAmount: detail.coinReward, challengeId: validated.challengeId, currency: "COINS" });
      rewards.push({ type: "COINS", amount: detail.coinReward, itemId: null, delivered: true, deliveredAt: Date.now() });
    }
    await repository.updateUserChallenge(validated.userId, validated.challengeId, { status: "CLAIMED", claimedAt: Date.now() });
    eventBus.publish("challenge:reward_claimed", { userId: validated.userId, challengeId: validated.challengeId, claimedAt: Date.now() });
    return { success: true, rewards, error: null };
  } catch (error) {
    Sentry.captureException(error, { tags: { feature: "challenges", action: "claim-reward" } });
    return { success: false, rewards: [], error: error instanceof Error ? error.message : "Unknown challenge reward error" };
  }
}

export async function getActiveChallenges(userId: string): Promise<ChallengeDetail[]> {
  return repository.fetchActiveChallengeDetails(userId);
}

export async function getCompletedChallenges(userId: string, limit = 10): Promise<ChallengeDetail[]> {
  return repository.fetchCompletedChallengeDetails(userId, limit);
}

export async function getUserChallengeSummaries(userId: string): Promise<UserChallengeSummary[]> {
  const details = await getActiveChallenges(userId);
  return details.map((detail) => ({
    challengeId: detail.challenge.id,
    title: detail.challenge.title,
    description: detail.challenge.description,
    category: detail.challenge.category,
    type: detail.challenge.type,
    difficulty: detail.challenge.difficulty,
    currentValue: detail.userChallenge.currentValue,
    targetValue: detail.requiredCount,
    progressPercent: Math.min(100, Math.round((detail.userChallenge.currentValue / detail.requiredCount) * 100)),
    status: detail.userChallenge.status,
    isClaimable: detail.userChallenge.status === "COMPLETED",
    isExpired: detail.userChallenge.expiresAt !== null && detail.userChallenge.expiresAt <= Date.now(),
    expiresInMs: detail.userChallenge.expiresAt ? Math.max(0, detail.userChallenge.expiresAt - Date.now()) : null,
    rewardType: detail.coinReward > 0 ? "COINS" : "XP",
    rewardAmount: detail.coinReward > 0 ? detail.coinReward : detail.xpReward,
    canReroll: detail.userChallenge.status === "ACTIVE",
    rerollCost: CONFIG.PAID_REROLL_COST,
    freeRerollAvailable: detail.userChallenge.rerollCount < CONFIG.FREE_REROLLS_PER_DAY,
    rerollCount: detail.userChallenge.rerollCount,
  }));
}

export async function checkRerollEligibility(userId: string, challengeId: string): Promise<RerollEligibility> {
  const [userChallenge, rerollCountToday, freeRerollCountToday] = await Promise.all([repository.fetchUserChallenge(userId, challengeId), repository.getRerollCountToday(userId), repository.getFreeRerollCountToday(userId)]);
  if (!userChallenge) {
    return { canReroll: false, reason: "Challenge not found", freeRerollAvailable: false, gemsRequired: CONFIG.PAID_REROLL_COST, currentGems: 0, rerollCountToday, maxRerollsPerDay: CONFIG.MAX_REROLLS_PER_DAY };
  }
  if (rerollCountToday >= CONFIG.MAX_REROLLS_PER_DAY) {
    return { canReroll: false, reason: "Daily reroll limit reached", freeRerollAvailable: false, gemsRequired: CONFIG.PAID_REROLL_COST, currentGems: 0, rerollCountToday, maxRerollsPerDay: CONFIG.MAX_REROLLS_PER_DAY };
  }
  return {
    canReroll: userChallenge.status === "ACTIVE",
    reason: userChallenge.status === "ACTIVE" ? null : `Challenge is ${userChallenge.status.toLowerCase()}`,
    freeRerollAvailable: freeRerollCountToday < CONFIG.FREE_REROLLS_PER_DAY,
    gemsRequired: freeRerollCountToday < CONFIG.FREE_REROLLS_PER_DAY ? 0 : CONFIG.PAID_REROLL_COST,
    currentGems: 0,
    rerollCountToday,
    maxRerollsPerDay: CONFIG.MAX_REROLLS_PER_DAY,
  };
}

export async function rerollChallenge(input: { userId: string; challengeId: string; usePaidReroll: boolean; idempotencyKey?: string }): Promise<RerollResult> {
  const validated = RerollChallengeInputSchema.parse(input);
  const eligibility = await checkRerollEligibility(validated.userId, validated.challengeId);
  if (!eligibility.canReroll) {
    return {
      success: false,
      oldChallengeId: validated.challengeId,
      newChallengeId: "",
      newChallenge: null,
      gemsSpent: 0,
      freeRerollUsed: false,
      error: eligibility.reason ?? "Reroll not allowed",
      remainingGems: eligibility.currentGems,
      remainingFreeRerollsToday: eligibility.freeRerollAvailable ? 1 : 0,
    };
  }
  return {
    success: false,
    oldChallengeId: validated.challengeId,
    newChallengeId: "",
    newChallenge: null,
    gemsSpent: 0,
    freeRerollUsed: false,
    error: "Reroll generation is not supported for the refreshed daily challenge pool yet",
    remainingGems: eligibility.currentGems,
    remainingFreeRerollsToday: eligibility.freeRerollAvailable ? 1 : 0,
  };
}
