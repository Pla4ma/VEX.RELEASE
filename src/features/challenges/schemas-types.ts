export type Challenge = z.infer<typeof ChallengeSchema>;

export type ChallengeTemplate = z.infer<typeof ChallengeTemplateSchema>;

export type ChallengeType = z.infer<typeof ChallengeTypeSchema>;

export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;

export type ChallengeCategory = z.infer<typeof ChallengeCategorySchema>;

export type ChallengeDifficulty = z.infer<typeof ChallengeDifficultySchema>;

export type UserChallenge = z.infer<typeof UserChallengeSchema>;

export type UserChallengeSummary = z.infer<typeof UserChallengeSummarySchema>;

export type ProgressHistoryEntry = z.infer<typeof ProgressHistoryEntrySchema>;

export type ChallengeReward = z.infer<typeof ChallengeRewardSchema>;

export type ChallengeCompletionResult = z.infer<
  typeof ChallengeCompletionResultSchema
>;

export type ChallengeDetail = z.infer<typeof ChallengeDetailSchema>;

export type RerollResult = z.infer<typeof RerollResultSchema>;

export type RerollEligibility = z.infer<typeof RerollEligibilitySchema>;

export type AssignChallengeInput = z.infer<typeof AssignChallengeInputSchema>;

export type UpdateChallengeProgressInput = z.infer<
  typeof UpdateChallengeProgressInputSchema
>;

export type RerollChallengeInput = z.infer<typeof RerollChallengeInputSchema>;

export type ClaimChallengeRewardInput = z.infer<
  typeof ClaimChallengeRewardInputSchema
>;

export type ChallengeGenerationConfig = z.infer<
  typeof ChallengeGenerationConfigSchema
>;

export type DailyChallengeTriggerType = z.infer<
  typeof DailyChallengeTriggerTypeSchema
>;

export type DailyChallengeContext = z.infer<typeof DailyChallengeContextSchema>;

export type ChallengeProgressCheckResult = z.infer<
  typeof ChallengeProgressCheckResultSchema
>;

export type ChallengeAnalytics = {
  totalChallengesIssued: number;
