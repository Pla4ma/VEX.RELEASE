import { z } from 'zod';

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {});

const readString = (row: Record<string, unknown>, ...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
};

const readNumber = (row: Record<string, unknown>, ...keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Date.parse(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }
  return undefined;
};

const readBoolean = (row: Record<string, unknown>, ...keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
};
const ChallengeShape = z
  .object({
    id: z.string().min(1),
    seasonId: z.string().min(1),
    type: ChallengeTypeSchema,
    category: ChallengeCategorySchema,
    title: z.string().min(1).max(200),
    description: z
      .string()
      .nullable()
      .default(null)
      .transform((value) => value ?? ''),
    iconUrl: z.string().nullable().default(null),
    targetValue: z.number().int().positive(),
    targetType: z.string().min(1),
    rewardType: z.string().min(1).default('XP'),
    rewardAmount: z.number().int().nonnegative().default(0),
    rewardItemId: z.string().nullable().default(null),
    startAt: z.number().int().nullable().default(null),
    endAt: z.number().int().nullable().default(null),
    isActive: z.boolean().default(true),
    difficulty: ChallengeDifficultySchema.default('MEDIUM'),
    xpBonus: z.number().int().nonnegative().default(0),
    createdAt: z.number().int().nonnegative().default(0),
  })
  .strict();
const ChallengeTemplateShape = z
  .object({
    id: z.string().min(1),
    category: ChallengeCategorySchema,
    type: ChallengeTypeSchema,
    titleTemplate: z.string().min(1),
    descriptionTemplate: z.string().min(1),
    minTarget: z.number().int().positive(),
    maxTarget: z.number().int().positive(),
    minReward: z.number().int().nonnegative(),
    maxReward: z.number().int().nonnegative(),
    rewardType: z.string().min(1),
    weight: z.number().positive(),
    minLevel: z.number().int().nonnegative().default(1),
    requiresPremium: z.boolean().default(false),
    requiresSquad: z.boolean().default(false),
  })
  .strict();
const UserChallengeShape = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    challengeId: z.string().min(1),
    currentValue: z.number().int().nonnegative().default(0),
    status: ChallengeStatusSchema.default('ACTIVE'),
    assignedAt: z.number().int().nonnegative().default(0),
    completedAt: z.number().int().nullable().default(null),
    claimedAt: z.number().int().nullable().default(null),
    expiresAt: z.number().int().nullable().default(null),
    rerollCount: z.number().int().nonnegative().default(0),
    rerolledFromId: z.string().nullable().default(null),
    lastProgressAt: z.number().int().nullable().default(null),
    progressHistory: z.array(ProgressHistoryEntrySchema).default([]),
    createdAt: z.number().int().nonnegative().default(0),
  })
  .strict();
export * from "./schemas.types";
export * from "./schemas.part1";
export * from "./schemas.part2";
