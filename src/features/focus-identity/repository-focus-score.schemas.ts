import { z } from "zod";
import {
  FocusScoreBandLabelSchema,
  FocusScoreFactorsSchema,
  FocusScoreFactorKeySchema, // Add this
  FocusScoreHistoryPointSchema,
  MAX_FOCUS_SCORE,
  MIN_FOCUS_SCORE,
} from "./schemas";

export const MonthInputSchema = z.string().regex(/^\d{4}-\d{2}$/);

export const UpsertCurrentFocusScoreInputSchema = z
  .object({
    currentScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    previousScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    band: FocusScoreBandLabelSchema,
    factors: FocusScoreFactorsSchema,
    lastChangeReason: z.string().min(1),
    topPositiveFactor: FocusScoreFactorKeySchema.optional(), // Add this
    topNegativeFactor: FocusScoreFactorKeySchema.optional(), // Add this
  })
  .strict();

export const AppendFocusScoreHistoryEventSchema = z
  .object({
    userId: z.string().uuid(),
    timestamp: z.string().datetime(),
    score: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    delta: z.number(),
    reason: z.string().min(1),
  })
  .strict();

export const CurrentFocusScoreRowSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    current_score: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    previous_score: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    band: FocusScoreBandLabelSchema,
    factors: FocusScoreFactorsSchema,
    last_change_reason: z.string().min(1),
    top_positive_factor: FocusScoreFactorKeySchema.optional(), // Add this
    top_negative_factor: FocusScoreFactorKeySchema.optional(), // Add this
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .strict();

export const FocusScoreHistoryRowSchema = z
  .object({
    user_id: z.string().uuid(),
    occurred_at: z.string().datetime(),
    score: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    delta: z.number(),
    reason: z.string().min(1),
  })
  .strict();

export const MonthlyFocusReportInputSchema = z
  .object({
    userId: z.string().uuid(),
    month: MonthInputSchema,
    historyPoints: z.array(FocusScoreHistoryPointSchema),
    sessionsCompleted: z.number().int().nonnegative(),
    totalFocusedMinutes: z.number().int().nonnegative(),
    bestGrade: z.enum(["S", "A", "B", "C", "D"]),
  })
  .strict();

export type UpsertCurrentFocusScoreInput = z.infer<
  typeof UpsertCurrentFocusScoreInputSchema
>;
export type AppendFocusScoreHistoryEvent = z.infer<
  typeof AppendFocusScoreHistoryEventSchema
>;
export type MonthlyFocusReportInput = z.infer<
  typeof MonthlyFocusReportInputSchema
>;
