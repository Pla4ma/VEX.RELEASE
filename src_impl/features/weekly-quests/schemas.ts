import { z } from 'zod';

export const WeeklyQuestStepIdSchema = z.enum([
  'complete_three_sessions',
  'earn_two_a_grades',
  'deal_boss_damage',
  'complete_study_session',
  'maintain_five_day_streak',
  'use_session_item',
  'defeat_boss',
]);

export const WeeklyQuestStepSchema = z.object({
  id: WeeklyQuestStepIdSchema,
  title: z.string().min(1),
  target: z.number().int().positive(),
  progress: z.number().int().nonnegative(),
  completed: z.boolean(),
}).strict();

export const WeeklyQuestStateSchema = z.object({
  userId: z.string().min(1),
  weekKey: z.string().min(1),
  steps: z.array(WeeklyQuestStepSchema).length(7),
  completedAt: z.number().int().nullable(),
  legendaryBoostArmed: z.boolean(),
  updatedAt: z.number().int().nonnegative(),
}).strict();

export const WeeklyQuestSessionInputSchema = z.object({
  userId: z.string().min(1),
  completedAt: z.number().int().nonnegative(),
  sessionMode: z.string().nullable(),
  finalScore: z.number().min(0).max(100),
  bossDamage: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  usedSessionItem: z.boolean(),
  bossDefeated: z.boolean(),
}).strict();

export type WeeklyQuestStepId = z.infer<typeof WeeklyQuestStepIdSchema>;
export type WeeklyQuestStep = z.infer<typeof WeeklyQuestStepSchema>;
export type WeeklyQuestState = z.infer<typeof WeeklyQuestStateSchema>;
export type WeeklyQuestSessionInput = z.infer<typeof WeeklyQuestSessionInputSchema>;
