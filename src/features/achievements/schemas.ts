import { z } from 'zod';

export const AchievementCategorySchema = z.enum([
  'SESSION',
  'STREAK',
  'BOSS',
  'SOCIAL',
  'PROGRESSION',
  'ECONOMY',
]);

export const AchievementRaritySchema = z.enum([
  'COMMON',
  'UNCOMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
]);

const ProgressHistoryEntrySchema = z.object({
  timestamp: z.number(),
  progress: z.number(),
  source: z.string(),
});

/** DB row shape from `user_achievements` table */
export const UserAchievementRowSchema = z.object({
  user_id: z.string(),
  achievement_id: z.string(),
  progress: z.number(),
  max_progress: z.number(),
  is_unlocked: z.boolean(),
  unlocked_at: z.string().nullable().optional(),
  progress_history: z.array(ProgressHistoryEntrySchema).default([]),
});
export type UserAchievementRow = z.infer<typeof UserAchievementRowSchema>;
