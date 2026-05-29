import { z } from "zod";
import { LaneSchema } from "../lane-engine/schemas";

// ── Mode-native surface identifiers ────────────────────────────────────
export const SurfaceIdSchema = z.enum([
  "home",
  "quick_contract",
  "active_session",
  "pause",
  "completion",
  "rescue",
  "day3_memory",
  "weekly_intelligence",
  "premium_trigger",
]);

export const PrimaryActionSchema = z.enum([
  "start_session",
  "resume_project",
  "review_weak_topics",
  "start_study_block",
  "start_clean_run",
  "start_project_block",
  "re_enter_project",
  "do_mini_session",
]);

// ── Home surface content ───────────────────────────────────────────────
export const ModeHomeSurfaceSchema = z
  .object({
    lane: LaneSchema,
    primaryFeeling: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    primaryAction: PrimaryActionSchema,
    primaryActionLabel: z.string().min(1),
    suggestedDurationMinutes: z.number().int().min(5).max(120),
    secondaryHint: z.string().min(1).nullable(),
    rhythmLabel: z.string().min(1).nullable(),
  })
  .strict();

// ── Quick Contract surface content ─────────────────────────────────────
export const QuickContractQuestionSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    placeholder: z.string().min(1),
  })
  .strict();

export const ModeQuickContractSchema = z
  .object({
    lane: LaneSchema,
    title: z.string().min(1),
    questions: z.array(QuickContractQuestionSchema).min(1).max(3),
    durationLabel: z.string().min(1),
    suggestedDurationMinutes: z.number().int().min(5).max(120),
    startLabel: z.string().min(1),
    showAdvancedSettings: z.boolean(),
  })
  .strict();

// ── Active session indicator ───────────────────────────────────────────
export const ModeActiveIndicatorSchema = z
  .object({
    lane: LaneSchema,
    targetLabel: z.string().min(1).nullable(),
    topLine: z.string().min(1),
    showProgressBar: z.boolean(),
    showCompanion: z.boolean(),
    allowNotes: z.boolean(),
    density: z.enum(["low", "medium", "medium_high"]),
    quiet: z.boolean(),
  })
  .strict();

// ── Completion surface content ─────────────────────────────────────────
export const ModeCompletionSurfaceSchema = z
  .object({
    lane: LaneSchema,
    headline: z.string().min(1),
    body: z.string().min(1),
    primaryActionLabel: z.string().min(1),
    secondaryHint: z.string().min(1).nullable(),
    insightLabel: z.string().min(1).nullable(),
    showRewards: z.boolean(),
    showStreak: z.boolean(),
    showXp: z.boolean(),
  })
  .strict();

// ── Rescue surface content ─────────────────────────────────────────────
export const ModeRescueSurfaceSchema = z
  .object({
    lane: LaneSchema,
    headline: z.string().min(1),
    body: z.string().min(1),
    suggestedDurationMinutes: z.number().int().min(3).max(15),
    actionLabel: z.string().min(1),
  })
  .strict();

// ── Weekly intelligence surface content ────────────────────────────────
export const ModeWeeklyIntelligenceSchema = z
  .object({
    lane: LaneSchema,
    headline: z.string().min(1),
    body: z.string().min(1),
    primaryMetric: z.string().min(1),
    primaryMetricValue: z.string().min(1),
    adjustment: z.string().min(1),
    nextSessionType: z.string().min(1).nullable(),
  })
  .strict();

// ── Inferred types ─────────────────────────────────────────────────────
export type SurfaceId = z.infer<typeof SurfaceIdSchema>;
export type PrimaryAction = z.infer<typeof PrimaryActionSchema>;
export type ModeHomeSurface = z.infer<typeof ModeHomeSurfaceSchema>;
export type QuickContractQuestion = z.infer<typeof QuickContractQuestionSchema>;
export type ModeQuickContract = z.infer<typeof ModeQuickContractSchema>;
export type ModeActiveIndicator = z.infer<typeof ModeActiveIndicatorSchema>;
export type ModeCompletionSurface = z.infer<typeof ModeCompletionSurfaceSchema>;
export type ModeRescueSurface = z.infer<typeof ModeRescueSurfaceSchema>;
export type ModeWeeklyIntelligence = z.infer<
  typeof ModeWeeklyIntelligenceSchema
>;
