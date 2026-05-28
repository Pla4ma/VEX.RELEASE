/**
 * Core Challenge Entity Schemas
 *
 * Zod schemas for Challenge, ChallengeTemplate, and UserChallenge.
 * Each uses z.preprocess to normalise camelCase / snake_case input.
 */

import { z } from "zod";
import {
  ChallengeTypeSchema,
  ChallengeCategorySchema,
  ChallengeDifficultySchema,
  ChallengeStatusSchema,
} from "./enums";
import { asRecord, readString, readNumber, readBoolean } from "./helpers";

export const ProgressHistoryEntrySchema = z
  .object({
    timestamp: z.number().int().nonnegative(),
    value: z.number().int().nonnegative(),
    source: z.string().min(1),
    delta: z.number().int(),
  })
  .strict();

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
      .transform((value) => value ?? ""),
    iconUrl: z.string().nullable().default(null),
    targetValue: z.number().int().positive(),
    targetType: z.string().min(1),
    rewardType: z.string().min(1).default("XP"),
    rewardAmount: z.number().int().nonnegative().default(0),
    rewardItemId: z.string().nullable().default(null),
    startAt: z.number().int().nullable().default(null),
    endAt: z.number().int().nullable().default(null),
    isActive: z.boolean().default(true),
    difficulty: ChallengeDifficultySchema.default("MEDIUM"),
    xpBonus: z.number().int().nonnegative().default(0),
    createdAt: z.number().int().nonnegative().default(0),
  })
  .strict();

export const ChallengeSchema = z.preprocess((value) => {
  const row = asRecord(value);
  return {
    id: readString(row, "id") ?? "",
    seasonId: readString(row, "seasonId", "season_id") ?? "",
    type: readString(row, "type") ?? "DAILY",
    category: readString(row, "category") ?? "SESSIONS",
    title: readString(row, "title") ?? "",
    description: readString(row, "description") ?? "",
    iconUrl: readString(row, "iconUrl", "icon_url") ?? null,
    targetValue: readNumber(row, "targetValue", "target_value") ?? 1,
    targetType: readString(row, "targetType", "target_type") ?? "SESSIONS",
    rewardType: readString(row, "rewardType", "reward_type") ?? "XP",
    rewardAmount: readNumber(row, "rewardAmount", "reward_amount") ?? 0,
    rewardItemId: readString(row, "rewardItemId", "reward_item_id") ?? null,
    startAt: readNumber(row, "startAt", "start_at") ?? null,
    endAt: readNumber(row, "endAt", "end_at") ?? null,
    isActive: readBoolean(row, "isActive", "is_active") ?? true,
    difficulty: readString(row, "difficulty") ?? "MEDIUM",
    xpBonus: readNumber(row, "xpBonus", "xp_bonus") ?? 0,
    createdAt: readNumber(row, "createdAt", "created_at") ?? Date.now(),
  };
}, ChallengeShape);

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

export const ChallengeTemplateSchema = z.preprocess((value) => {
  const row = asRecord(value);
  return {
    id: readString(row, "id") ?? "",
    category: readString(row, "category") ?? "SESSIONS",
    type: readString(row, "type") ?? "DAILY",
    titleTemplate: readString(row, "titleTemplate", "title_template") ?? "",
    descriptionTemplate:
      readString(row, "descriptionTemplate", "description_template") ?? "",
    minTarget: readNumber(row, "minTarget", "min_target") ?? 1,
    maxTarget: readNumber(row, "maxTarget", "max_target") ?? 1,
    minReward: readNumber(row, "minReward", "min_reward") ?? 0,
    maxReward: readNumber(row, "maxReward", "max_reward") ?? 0,
    rewardType: readString(row, "rewardType", "reward_type") ?? "XP",
    weight: readNumber(row, "weight") ?? 1,
    minLevel: readNumber(row, "minLevel", "min_level") ?? 1,
    requiresPremium:
      readBoolean(row, "requiresPremium", "requires_premium") ?? false,
    requiresSquad:
      readBoolean(row, "requiresSquad", "requires_squad") ?? false,
  };
}, ChallengeTemplateShape);

const UserChallengeShape = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    challengeId: z.string().min(1),
    currentValue: z.number().int().nonnegative().default(0),
    status: ChallengeStatusSchema.default("ACTIVE"),
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

export const UserChallengeSchema = z.preprocess((value) => {
  const row = asRecord(value);
  return {
    id: readString(row, "id") ?? "",
    userId: readString(row, "userId", "user_id") ?? "",
    challengeId: readString(row, "challengeId", "challenge_id") ?? "",
    currentValue: readNumber(row, "currentValue", "current_value") ?? 0,
    status: readString(row, "status") ?? "ACTIVE",
    assignedAt: readNumber(row, "assignedAt", "assigned_at") ?? Date.now(),
    completedAt: readNumber(row, "completedAt", "completed_at") ?? null,
    claimedAt: readNumber(row, "claimedAt", "claimed_at") ?? null,
    expiresAt: readNumber(row, "expiresAt", "expires_at") ?? null,
    rerollCount: readNumber(row, "rerollCount", "reroll_count") ?? 0,
    rerolledFromId:
      readString(row, "rerolledFromId", "rerolled_from_id") ?? null,
    lastProgressAt:
      readNumber(row, "lastProgressAt", "last_progress_at") ?? null,
    progressHistory: Array.isArray(row.progressHistory)
      ? row.progressHistory
      : Array.isArray(row.progress_history)
        ? row.progress_history
        : [],
    createdAt: readNumber(row, "createdAt", "created_at") ?? Date.now(),
  };
}, UserChallengeShape);

export type Challenge = z.infer<typeof ChallengeSchema>;
export type ChallengeTemplate = z.infer<typeof ChallengeTemplateSchema>;
export type UserChallenge = z.infer<typeof UserChallengeSchema>;
export type ProgressHistoryEntry = z.infer<typeof ProgressHistoryEntrySchema>;
