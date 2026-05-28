/**
 * Challenge Response / Result Schemas
 *
 * Schemas for challenge rewards, completion results, summaries,
 * detail views, and reroll operations.
 */

import { z } from "zod";
import {
  ChallengeCategorySchema,
  ChallengeDifficultySchema,
  ChallengeStatusSchema,
  ChallengeTypeSchema,
} from "./enums";
import { ChallengeSchema, UserChallengeSchema } from "./core";

export const ChallengeRewardSchema = z
  .object({
    type: z.string().min(1),
    amount: z.number().int().nonnegative(),
    itemId: z.string().nullable(),
    delivered: z.boolean(),
    deliveredAt: z.number().int().nullable(),
  })
  .strict();

export const ChallengeCompletionResultSchema = z
  .object({
    success: z.boolean(),
    challengeId: z.string().min(1),
    userId: z.string().min(1),
    completedAt: z.number().int().nonnegative(),
    rewards: z.array(ChallengeRewardSchema),
    xpEarned: z.number().int().nonnegative(),
    seasonProgressAdvanced: z.boolean(),
    newTierUnlocked: z.boolean(),
    timeToComplete: z.number().int().nonnegative(),
    wasRerolled: z.boolean(),
  })
  .strict();

export const UserChallengeSummarySchema = z
  .object({
    challengeId: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    category: ChallengeCategorySchema,
    type: ChallengeTypeSchema,
    difficulty: ChallengeDifficultySchema,
    currentValue: z.number().int().nonnegative(),
    targetValue: z.number().int().positive(),
    progressPercent: z.number().min(0).max(100),
    status: ChallengeStatusSchema,
    isClaimable: z.boolean(),
    isExpired: z.boolean(),
    expiresInMs: z.number().nullable(),
    rewardType: z.string().min(1),
    rewardAmount: z.number().int().nonnegative(),
    canReroll: z.boolean(),
    rerollCost: z.number().int().nonnegative(),
    freeRerollAvailable: z.boolean(),
    rerollCount: z.number().int().nonnegative(),
  })
  .strict();

export const ChallengeDetailSchema = z
  .object({
    challenge: ChallengeSchema,
    userChallenge: UserChallengeSchema,
    xpReward: z.number().int().nonnegative(),
    coinReward: z.number().int().nonnegative(),
    requiredCount: z.number().int().positive(),
  })
  .strict();

export const RerollResultSchema = z
  .object({
    success: z.boolean(),
    oldChallengeId: z.string(),
    newChallengeId: z.string(),
    newChallenge: ChallengeSchema.nullable(),
    gemsSpent: z.number().int().nonnegative(),
    freeRerollUsed: z.boolean(),
    error: z.string().nullable(),
    remainingGems: z.number().int().nonnegative(),
    remainingFreeRerollsToday: z.number().int().nonnegative(),
  })
  .strict();

export const RerollEligibilitySchema = z
  .object({
    canReroll: z.boolean(),
    reason: z.string().nullable(),
    freeRerollAvailable: z.boolean(),
    gemsRequired: z.number().int().nonnegative(),
    currentGems: z.number().int().nonnegative(),
    rerollCountToday: z.number().int().nonnegative(),
    maxRerollsPerDay: z.number().int().positive(),
  })
  .strict();

export type ChallengeReward = z.infer<typeof ChallengeRewardSchema>;
export type ChallengeCompletionResult = z.infer<
  typeof ChallengeCompletionResultSchema
>;
export type UserChallengeSummary = z.infer<typeof UserChallengeSummarySchema>;
export type ChallengeDetail = z.infer<typeof ChallengeDetailSchema>;
export type RerollResult = z.infer<typeof RerollResultSchema>;
export type RerollEligibility = z.infer<typeof RerollEligibilitySchema>;
