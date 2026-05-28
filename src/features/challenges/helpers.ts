import { eventBus } from "../../events";
import * as repository from "./repository";
import { ChallengeRewardSchema } from "./schemas";
import type {
  Challenge,
  ChallengeCompletionResult,
  ChallengeDetail,
  ChallengeReward,
  DailyChallengeContext,
  DailyChallengeTriggerType,
  UserChallenge,
} from "./schemas";

export const CONFIG = {
  FREE_REROLLS_PER_DAY: 1,
  PAID_REROLL_COST: 10,
  MAX_REROLLS_PER_DAY: 10,
  DAILY_CHALLENGE_EXPIRY_HOURS: 24,
} as const;

export const rewardBundleFor = (challenge: Challenge) => ({
  xpReward: challenge.rewardAmount,
  coinReward:
    challenge.rewardAmount >= 500
      ? 250
      : challenge.rewardAmount >= 250
        ? 100
        : 50,
});

export const inferTriggerDelta = (
  challenge: Challenge,
  triggerType: DailyChallengeTriggerType,
  context: DailyChallengeContext,
): number => {
  if (challenge.category === "MINUTES" && triggerType === "SESSION_COMPLETED") {
    return context.minutesCompleted ?? 0;
  }
  if (
    challenge.category === "SESSIONS" &&
    triggerType === "SESSION_COMPLETED"
  ) {
    return context.sessionCount ?? 1;
  }
  if (challenge.category === "SOCIAL" && triggerType === "MOOD_LOGGED") {
    return context.moodLogged ? 1 : 0;
  }
  if (challenge.category === "STREAK" && triggerType === "STREAK_CHECKED") {
    return context.streakChecked ? 1 : 0;
  }
  if (
    challenge.category === "BOSS_DAMAGE" &&
    triggerType === "PURITY_RECORDED"
  ) {
    return typeof context.purity === "number" && context.purity >= 80 ? 1 : 0;
  }
  if (
    challenge.category === "ACHIEVEMENT" &&
    triggerType === "STREAK_UPDATED"
  ) {
    return typeof context.streakDays === "number" &&
      context.streakDays >= challenge.targetValue
      ? challenge.targetValue
      : 0;
  }
  return 0;
};

export const toCompletionResult = async (
  detail: ChallengeDetail,
  updatedChallenge: UserChallenge,
): Promise<ChallengeCompletionResult> => {
  const now = Date.now();
  const rewards: ChallengeReward[] = [];
  if (detail.xpReward > 0) {
    rewards.push(
      ChallengeRewardSchema.parse({
        type: "XP",
        amount: detail.xpReward,
        itemId: null,
        delivered: false,
        deliveredAt: null,
      }),
    );
  }
  if (detail.coinReward > 0) {
    rewards.push(
      ChallengeRewardSchema.parse({
        type: "COINS",
        amount: detail.coinReward,
        itemId: null,
        delivered: false,
        deliveredAt: null,
      }),
    );
  }
  await repository.updateUserChallenge(
    updatedChallenge.userId,
    updatedChallenge.challengeId,
    {
      status: "COMPLETED",
      completedAt: now,
      currentValue: Math.min(
        updatedChallenge.currentValue,
        detail.requiredCount,
      ),
    },
  );
  eventBus.publish("challenge:completed", {
    userId: updatedChallenge.userId,
    challengeId: updatedChallenge.challengeId,
    completedAt: now,
  });
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
