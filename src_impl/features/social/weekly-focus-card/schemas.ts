import { z } from 'zod';

export const FocusScoreBandLabelSchema = z.enum([
  'Legendary',
  'Elite',
  'Exceptional',
  'Strong',
  'Good',
  'Fair',
  'Building',
]);

export type FocusScoreBandLabel = z.infer<typeof FocusScoreBandLabelSchema>;

export const WeeklyFocusInsightSchema = z.enum([
  'consistency_king',
  'quality_over_quantity',
  'streak_master',
  'gradual_improver',
  'comeback_kid',
  'nothing_yet',
]);

export type WeeklyFocusInsight = z.infer<typeof WeeklyFocusInsightSchema>;

export const BestSessionSchema = z
  .object({
    date: z.string(),
    durationMinutes: z.number().int().nonnegative(),
    qualityScore: z.number().nullable(),
    mode: z.string().nullable(),
  })
  .strict();

export type BestSession = z.infer<typeof BestSessionSchema>;

export const WeeklyFocusSummarySchema = z
  .object({
    userId: z.string().uuid(),
    weekStartDate: z.string(),
    weekEndDate: z.string(),
    totalMinutes: z.number().int().nonnegative(),
    sessionsCompleted: z.number().int().nonnegative(),
    previousWeekScore: z.number().nullable(),
    currentWeekScore: z.number().nullable(),
    scoreDelta: z.number().nullable(),
    currentBand: FocusScoreBandLabelSchema.nullable(),
    bestSession: BestSessionSchema.nullable(),
    currentStreakDays: z.number().int().nonnegative(),
    insight: WeeklyFocusInsightSchema,
    isEmpty: z.boolean(),
  })
  .strict();

export type WeeklyFocusSummary = z.infer<typeof WeeklyFocusSummarySchema>;

export const WeeklyFocusSummaryInputSchema = z
  .object({
    userId: z.string().uuid(),
    weekOffset: z.number().int().min(0).max(12).default(0),
  })
  .strict();

export type WeeklyFocusSummaryInput = z.infer<typeof WeeklyFocusSummaryInputSchema>;

export const WeeklyFocusSessionSchema = z
  .object({
    completedAt: z.string().nullable(),
    durationSeconds: z.number().int().nonnegative(),
    mode: z.string().nullable(),
    qualityScore: z.number().nullable(),
  })
  .strict();

export const WeeklyFocusScoreSnapshotSchema = z
  .object({
    score: z.number().int().nonnegative(),
  })
  .strict();

export const WeeklyFocusDataSchema = z
  .object({
    currentFocusScore: WeeklyFocusScoreSnapshotSchema.nullable(),
    currentStreakDays: z.number().int().nonnegative(),
    previousFocusScore: WeeklyFocusScoreSnapshotSchema.nullable(),
    sessions: z.array(WeeklyFocusSessionSchema),
    userId: z.string().uuid(),
    weekEndDate: z.string(),
    weekStartDate: z.string(),
  })
  .strict();

export type WeeklyFocusData = z.infer<typeof WeeklyFocusDataSchema>;
export type WeeklyFocusSession = z.infer<typeof WeeklyFocusSessionSchema>;
