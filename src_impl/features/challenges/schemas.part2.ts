import { z } from "zod";


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
    metadata: z.record(z.unknown()).optional(),
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