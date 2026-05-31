/**
 * Challenge Schemas — Barrel Export
 *
 * Re-exports every schema and inferred type from the split modules.
 */

export {
  ChallengeTypeSchema,
  ChallengeStatusSchema,
  ChallengeCategorySchema,
  ChallengeDifficultySchema,
  DailyChallengeTriggerTypeSchema,
  type ChallengeType,
  type ChallengeStatus,
  type ChallengeCategory,
  type ChallengeDifficulty,
  type DailyChallengeTriggerType,
} from './enums';

export {
  ProgressHistoryEntrySchema,
  ChallengeSchema,
  ChallengeTemplateSchema,
  UserChallengeSchema,
  type Challenge,
  type ChallengeTemplate,
  type UserChallenge,
  type ProgressHistoryEntry,
} from './core';

export {
  ChallengeRewardSchema,
  ChallengeCompletionResultSchema,
  UserChallengeSummarySchema,
  ChallengeDetailSchema,
  RerollResultSchema,
  RerollEligibilitySchema,
  type ChallengeReward,
  type ChallengeCompletionResult,
  type UserChallengeSummary,
  type ChallengeDetail,
  type RerollResult,
  type RerollEligibility,
} from './responses';

export {
  AssignChallengeInputSchema,
  UpdateChallengeProgressInputSchema,
  RerollChallengeInputSchema,
  ClaimChallengeRewardInputSchema,
  ChallengeGenerationConfigSchema,
  DailyChallengeContextSchema,
  ChallengeProgressCheckResultSchema,
  type AssignChallengeInput,
  type UpdateChallengeProgressInput,
  type RerollChallengeInput,
  type ClaimChallengeRewardInput,
  type ChallengeGenerationConfig,
  type DailyChallengeContext,
  type ChallengeProgressCheckResult,
} from './inputs';

export type ChallengeAnalytics = {
  totalChallengesIssued: number;
  completionRate: number;
  averageTimeToComplete: number;
  rerollRate: number;
  claimRate: number;
  categoryBreakdown: Record<
    string,
    { issued: number; completed: number; avgTime: number }
  >;
  difficultyBreakdown: Record<string, { issued: number; completed: number }>;
};
