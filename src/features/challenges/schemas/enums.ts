/**
 * Challenge Enum Schemas
 *
 * All Zod enum schemas for challenge domain types.
 */

import { z } from "zod";

export const ChallengeTypeSchema = z.enum(["DAILY", "WEEKLY", "EVENT"]);
export const ChallengeStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "CLAIMED",
  "EXPIRED",
  "REROLLED",
  "ABANDONED",
]);
export const ChallengeCategorySchema = z.enum([
  "SESSIONS",
  "MINUTES",
  "STREAK",
  "BOSS_DAMAGE",
  "SQUAD_ACTIVITY",
  "SHOP_PURCHASE",
  "LEVEL_UP",
  "ACHIEVEMENT",
  "SOCIAL",
]);
export const ChallengeDifficultySchema = z.enum([
  "EASY",
  "MEDIUM",
  "HARD",
  "EXPERT",
]);
export const DailyChallengeTriggerTypeSchema = z.enum([
  "SESSION_COMPLETED",
  "MOOD_LOGGED",
  "STREAK_CHECKED",
  "PURITY_RECORDED",
  "STREAK_UPDATED",
]);

export type ChallengeType = z.infer<typeof ChallengeTypeSchema>;
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;
export type ChallengeCategory = z.infer<typeof ChallengeCategorySchema>;
export type ChallengeDifficulty = z.infer<typeof ChallengeDifficultySchema>;
export type DailyChallengeTriggerType = z.infer<
  typeof DailyChallengeTriggerTypeSchema
>;
