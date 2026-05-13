import * as Sentry from "@sentry/react-native";
import { eventBus } from "../../events";
import { getRewardService } from "../../rewards/RewardService";
import * as repository from "./repository";
import { AssignChallengeInputSchema, ClaimChallengeRewardInputSchema, ChallengeProgressCheckResultSchema, ChallengeRewardSchema, DailyChallengeContextSchema, RerollChallengeInputSchema, type AssignChallengeInput, type Challenge, type ChallengeCompletionResult, type ChallengeDetail, type ChallengeProgressCheckResult, type ChallengeReward, type DailyChallengeContext, type DailyChallengeTriggerType, type RerollEligibility, type RerollResult, type UpdateChallengeProgressInput, UpdateChallengeProgressInputSchema, type UserChallenge, type UserChallengeSummary } from "./schemas";


export async function rerollChallenge(input: { userId: string; challengeId: string; usePaidReroll: boolean; idempotencyKey?: string }): Promise<RerollResult> {
  const validated = RerollChallengeInputSchema.parse(input);
  const eligibility = await checkRerollEligibility(validated.userId, validated.challengeId);
  if (!eligibility.canReroll) {
    return {
      success: false,
      oldChallengeId: validated.challengeId,
      newChallengeId: '',
      newChallenge: null,
      gemsSpent: 0,
      freeRerollUsed: false,
      error: eligibility.reason ?? 'Reroll not allowed',
      remainingGems: eligibility.currentGems,
      remainingFreeRerollsToday: eligibility.freeRerollAvailable ? 1 : 0,
    };
  }
  return {
    success: false,
    oldChallengeId: validated.challengeId,
    newChallengeId: '',
    newChallenge: null,
    gemsSpent: 0,
    freeRerollUsed: false,
    error: 'Reroll generation is not supported for the refreshed daily challenge pool yet',
    remainingGems: eligibility.currentGems,
    remainingFreeRerollsToday: eligibility.freeRerollAvailable ? 1 : 0,
  };
}