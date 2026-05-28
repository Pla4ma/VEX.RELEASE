import * as repository from "./repository";
import { RerollChallengeInputSchema } from "./schemas";
import type {
  ChallengeDetail,
  RerollEligibility,
  RerollResult,
  UserChallengeSummary,
} from "./schemas";
import { CONFIG } from "./helpers";

export async function getActiveChallenges(
  userId: string,
): Promise<ChallengeDetail[]> {
  return repository.fetchActiveChallengeDetails(userId);
}

export async function getCompletedChallenges(
  userId: string,
  limit = 10,
): Promise<ChallengeDetail[]> {
  return repository.fetchCompletedChallengeDetails(userId, limit);
}

export async function getUserChallengeSummaries(
  userId: string,
): Promise<UserChallengeSummary[]> {
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
    progressPercent: Math.min(
      100,
      Math.round(
        (detail.userChallenge.currentValue / detail.requiredCount) * 100,
      ),
    ),
    status: detail.userChallenge.status,
    isClaimable: detail.userChallenge.status === "COMPLETED",
    isExpired:
      detail.userChallenge.expiresAt !== null &&
      detail.userChallenge.expiresAt <= Date.now(),
    expiresInMs: detail.userChallenge.expiresAt
      ? Math.max(0, detail.userChallenge.expiresAt - Date.now())
      : null,
    rewardType: detail.coinReward > 0 ? "COINS" : "XP",
    rewardAmount: detail.coinReward > 0 ? detail.coinReward : detail.xpReward,
    canReroll: detail.userChallenge.status === "ACTIVE",
    rerollCost: CONFIG.PAID_REROLL_COST,
    freeRerollAvailable:
      detail.userChallenge.rerollCount < CONFIG.FREE_REROLLS_PER_DAY,
    rerollCount: detail.userChallenge.rerollCount,
  }));
}

export async function checkRerollEligibility(
  userId: string,
  challengeId: string,
): Promise<RerollEligibility> {
  const [userChallenge, rerollCountToday, freeRerollCountToday] =
    await Promise.all([
      repository.fetchUserChallenge(userId, challengeId),
      repository.getRerollCountToday(userId),
      repository.getFreeRerollCountToday(userId),
    ]);
  if (!userChallenge) {
    return {
      canReroll: false,
      reason: "Challenge not found",
      freeRerollAvailable: false,
      gemsRequired: CONFIG.PAID_REROLL_COST,
      currentGems: 0,
      rerollCountToday,
      maxRerollsPerDay: CONFIG.MAX_REROLLS_PER_DAY,
    };
  }
  if (rerollCountToday >= CONFIG.MAX_REROLLS_PER_DAY) {
    return {
      canReroll: false,
      reason: "Daily reroll limit reached",
      freeRerollAvailable: false,
      gemsRequired: CONFIG.PAID_REROLL_COST,
      currentGems: 0,
      rerollCountToday,
      maxRerollsPerDay: CONFIG.MAX_REROLLS_PER_DAY,
    };
  }
  return {
    canReroll: userChallenge.status === "ACTIVE",
    reason:
      userChallenge.status === "ACTIVE"
        ? null
        : `Challenge is ${userChallenge.status.toLowerCase()}`,
    freeRerollAvailable: freeRerollCountToday < CONFIG.FREE_REROLLS_PER_DAY,
    gemsRequired:
      freeRerollCountToday < CONFIG.FREE_REROLLS_PER_DAY
        ? 0
        : CONFIG.PAID_REROLL_COST,
    currentGems: 0,
    rerollCountToday,
    maxRerollsPerDay: CONFIG.MAX_REROLLS_PER_DAY,
  };
}

export async function rerollChallenge(input: {
  userId: string;
  challengeId: string;
  usePaidReroll: boolean;
  idempotencyKey?: string;
}): Promise<RerollResult> {
  const validated = RerollChallengeInputSchema.parse(input);
  const eligibility = await checkRerollEligibility(
    validated.userId,
    validated.challengeId,
  );
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
    error:
      "Reroll generation is not supported for the refreshed daily challenge pool yet",
    remainingGems: eligibility.currentGems,
    remainingFreeRerollsToday: eligibility.freeRerollAvailable ? 1 : 0,
  };
}
