/**
 * Challenge Input / Command Schemas
 *
 * Schemas for challenge assignment, progress updates, rerolls,
 * reward claims, generation config, and progress check results.
 */

import { z } from 'zod';
import { ChallengeTypeSchema } from './enums';
import {
  ChallengeCompletionResultSchema,
  ChallengeDetailSchema,
} from './responses';

export const AssignChallengeInputSchema = z
  .object({
    userId: z.string().min(1),
    seasonId: z.string().min(1),
    challengeType: ChallengeTypeSchema,
    challengeId: z.string().min(1).optional(),
  })
  .strict();

export const UpdateChallengeProgressInputSchema = z
  .object({
    userId: z.string().min(1),
    challengeId: z.string().min(1),
    delta: z.number().int().positive(),
    source: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const RerollChallengeInputSchema = z
  .object({
    userId: z.string().min(1),
    challengeId: z.string().min(1),
    usePaidReroll: z.boolean(),
    idempotencyKey: z.string().optional(),
  })
  .strict();

export const ClaimChallengeRewardInputSchema = z
  .object({
    userId: z.string().min(1),
    challengeId: z.string().min(1),
  })
  .strict();

export const ChallengeGenerationConfigSchema = z
  .object({
    seasonId: z.string().min(1),
    userId: z.string().min(1),
    userLevel: z.number().int().positive(),
    isPremium: z.boolean(),
    hasSquad: z.boolean(),
    challengeType: ChallengeTypeSchema,
    dailyChallengeCount: z.number().int().min(1).max(5).default(3),
    weeklyChallengeCount: z.number().int().min(1).max(5).default(3),
  })
  .strict();

export const DailyChallengeContextSchema = z
  .object({
    minutesCompleted: z.number().int().nonnegative().optional(),
    sessionCount: z.number().int().nonnegative().optional(),
    purity: z.number().min(0).max(100).optional(),
    streakDays: z.number().int().nonnegative().optional(),
    moodLogged: z.boolean().optional(),
    streakChecked: z.boolean().optional(),
  })
  .strict();

export const ChallengeProgressCheckResultSchema = z
  .object({
    updated: z.array(ChallengeDetailSchema),
    completed: z.array(ChallengeCompletionResultSchema),
  })
  .strict();

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
export type DailyChallengeContext = z.infer<typeof DailyChallengeContextSchema>;
export type ChallengeProgressCheckResult = z.infer<
  typeof ChallengeProgressCheckResultSchema
>;
