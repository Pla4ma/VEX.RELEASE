import * as Sentry from "@sentry/react-native";
import { eventBus } from "../../events";
import { getRewardService } from "../../rewards/RewardService";
import * as repository from "./repository";
import {
  AssignChallengeInputSchema,
  ChallengeProgressCheckResultSchema,
  ClaimChallengeRewardInputSchema,
  DailyChallengeContextSchema,
  UpdateChallengeProgressInputSchema,
  type AssignChallengeInput,
  type ChallengeCompletionResult,
  type ChallengeDetail,
  type ChallengeProgressCheckResult,
  type ChallengeReward,
  type DailyChallengeContext,
  type DailyChallengeTriggerType,
  type UpdateChallengeProgressInput,
  type UserChallenge,
} from "./schemas";
import { ChallengeError, ChallengeNotFoundError, ChallengeNotActiveError } from "./errors";
import { CONFIG, inferTriggerDelta, rewardBundleFor, toCompletionResult } from "./helpers";
import { getActiveChallenges, getCompletedChallenges } from "./queries";

export async function assignChallenge(
  input: AssignChallengeInput,
): Promise<UserChallenge> {
  const validated = AssignChallengeInputSchema.parse(input);
  const challengeId = validated.challengeId;
  if (!challengeId) {
    throw new ChallengeError(
      "A concrete challengeId is required for assignment",
      "CHALLENGE_ID_REQUIRED",
    );
  }
  return repository.createUserChallenge(
    validated.userId,
    challengeId,
    Date.now() + CONFIG.DAILY_CHALLENGE_EXPIRY_HOURS * 60 * 60 * 1000,
  );
}

export async function updateChallengeProgress(
  input: UpdateChallengeProgressInput,
): Promise<ChallengeCompletionResult | null> {
  const validated = UpdateChallengeProgressInputSchema.parse(input);
  const [userChallenge, challenge] = await Promise.all([
    repository.fetchUserChallenge(validated.userId, validated.challengeId),
    repository.fetchChallengeById(validated.challengeId),
  ]);
  if (!userChallenge || !challenge) {
    throw new ChallengeNotFoundError(validated.challengeId);
  }
  if (userChallenge.status !== "ACTIVE") {
    throw new ChallengeNotActiveError(
      validated.challengeId,
      userChallenge.status,
    );
  }
  const updated = await repository.addChallengeProgress(
    validated.userId,
    validated.challengeId,
    validated.delta,
    validated.source,
  );
  eventBus.publish("challenge:progress", {
    userId: validated.userId,
    challengeId: validated.challengeId,
    progress: updated.currentValue,
    target: challenge.targetValue,
    percent: Math.min(
      100,
      Math.round((updated.currentValue / challenge.targetValue) * 100),
    ),
  });
  if (updated.currentValue < challenge.targetValue) {
    return null;
  }
  return toCompletionResult(
    {
      challenge,
      userChallenge,
      ...rewardBundleFor(challenge),
      requiredCount: challenge.targetValue,
    },
    updated,
  );
}
export async function checkChallengeProgress(
  userId: string,
  triggerType: DailyChallengeTriggerType,
  context: DailyChallengeContext,
): Promise<ChallengeProgressCheckResult> {
  const validatedContext = DailyChallengeContextSchema.parse(context);
  try {
    const details = await getActiveChallenges(userId);
    const updated: ChallengeDetail[] = [];
    const completed: ChallengeCompletionResult[] = [];
    for (const detail of details) {
      if (detail.userChallenge.status !== "ACTIVE") {
        continue;
      }
      const delta = inferTriggerDelta(
        detail.challenge,
        triggerType,
        validatedContext,
      );
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
    Sentry.captureException(error, {
      tags: { feature: "challenges", action: "check-progress" },
    });
    throw error;
  }
}
export async function claimChallengeReward(input: {
  userId: string;
  challengeId: string;
}): Promise<{
  success: boolean;
  rewards: ChallengeReward[];
  error: string | null;
}> {
  const validated = ClaimChallengeRewardInputSchema.parse(input);
  try {
    const detail = (await getCompletedChallenges(validated.userId, 50)).find(
      (item) => item.challenge.id === validated.challengeId,
    );
    if (!detail) {
      return { success: false, rewards: [], error: "Challenge not completed" };
    }
    if (detail.userChallenge.status === "CLAIMED") {
      return { success: false, rewards: [], error: "Reward already claimed" };
    }
    const rewardService = getRewardService(validated.userId);
    const rewards: ChallengeReward[] = [];
    if (detail.xpReward > 0) {
      await rewardService.grantReward(
        "XP",
        "CHALLENGE_COMPLETE",
        { baseAmount: 1 },
        { exactAmount: detail.xpReward, challengeId: validated.challengeId },
      );
      rewards.push({
        type: "XP",
        amount: detail.xpReward,
        itemId: null,
        delivered: true,
        deliveredAt: Date.now(),
      });
    }
    if (detail.coinReward > 0) {
      rewards.push({
        type: "COINS",
        amount: detail.coinReward,
        itemId: null,
        delivered: false,
        deliveredAt: null,
      });
    }
    await repository.updateUserChallenge(
      validated.userId,
      validated.challengeId,
      { status: "CLAIMED", claimedAt: Date.now() },
    );
    eventBus.publish("challenge:reward_claimed", {
      userId: validated.userId,
      challengeId: validated.challengeId,
      claimedAt: Date.now(),
    });
    return { success: true, rewards, error: null };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "challenges", action: "claim-reward" },
    });
    return {
      success: false,
      rewards: [],
      error:
        error instanceof Error
          ? error.message
          : "Unknown challenge reward error",
    };
  }
}