import { z } from "zod";
import { LaneSchema } from "../lane-engine/schemas";

// ── Journey Day ────────────────────────────────────────────────────────
export const JourneyDaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

// ── Journey Phase ──────────────────────────────────────────────────────
export const JourneyPhaseSchema = z.enum([
  "onboarding",
  "return",
  "proof",
  "insight",
  "rescue",
  "lane_forming",
  "weekly_prep",
  "weekly_intelligence",
]);

// ── Emotional state ────────────────────────────────────────────────────
export const EmotionalStateSchema = z.enum([
  "curious",
  "familiar",
  "validated",
  "trusting",
  "struggling",
  "forming",
  "ready",
  "valuable",
]);

// ── Home message ───────────────────────────────────────────────────────
export const JourneyHomeMessageSchema = z
  .object({
    headline: z.string().min(1).max(120),
    subtext: z.string().min(1).max(200),
    tone: z.enum(["warm", "direct", "humble", "encouraging", "proof"]),
  })
  .strict();

// ── Session suggestion ─────────────────────────────────────────────────
export const JourneySessionSuggestionSchema = z
  .object({
    durationMinutes: z.number().int().min(5).max(60),
    type: z.enum(["STUDY", "DEEP_WORK", "SPRINT", "LIGHT_FOCUS", "RECOVERY"]),
    taskPrompt: z.string().min(1).max(200),
  })
  .strict();

// ── Completion payoff ──────────────────────────────────────────────────
export const JourneyCompletionPayoffSchema = z
  .object({
    headline: z.string().min(1).max(120),
    body: z.string().min(1).max(300),
    nextActionCta: z.string().min(1).max(120),
    nextActionRoute: z.string().min(1).max(120),
  })
  .strict();

// ── Memory / learning moment ───────────────────────────────────────────
export const JourneyMomentSchema = z
  .object({
    type: z.enum(["none", "what_vex_learned", "proof_signal", "weekly_insight"]),
    requiresSessions: z.number().int().min(0),
    canHide: z.boolean(),
  })
  .strict();

// ── Return reason ──────────────────────────────────────────────────────
export const JourneyReturnReasonSchema = z
  .object({
    day1: z.string().min(1).max(200),
    day2: z.string().min(1).max(200),
    day3: z.string().min(1).max(200),
    day4: z.string().min(1).max(200),
    day5: z.string().min(1).max(200),
    day6: z.string().min(1).max(200),
    day7: z.string().min(1).max(200),
  })
  .strict();

// ── Premium moment ─────────────────────────────────────────────────────
export const JourneyPremiumMomentSchema = z
  .object({
    day: JourneyDaySchema,
    trigger: z.enum([
      "after_weekly_insight",
      "deep_insight_tap",
      "advanced_action",
      "none",
    ]),
    copyKey: z.enum(["study", "run", "project", "clean", "none"]),
  })
  .strict();

// ── Nudge policy (per day) ─────────────────────────────────────────────
export const JourneyNudgePolicySchema = z
  .object({
    canSend: z.boolean(),
    type: z
      .enum([
        "none",
        "gentle_return",
        "proof_nudge",
        "memory_nudge",
        "rescue",
        "weekly_insight",
      ])
      .nullable(),
    condition: z.string().min(1).max(200),
  })
  .strict();

// ── Lane copy map ──────────────────────────────────────────────────────
export const LaneCopyMapSchema = z
  .object({
    student: z.string().min(1).max(200),
    game_like: z.string().min(1).max(200),
    deep_creative: z.string().min(1).max(200),
    minimal_normal: z.string().min(1).max(200),
  })
  .strict();

// ── Full journey copy per day ──────────────────────────────────────────
export const JourneyDayCopySchema = z
  .object({
    homeMessage: LaneCopyMapSchema,
    primaryCta: LaneCopyMapSchema,
    sessionSuggestion: z.object({
      student: JourneySessionSuggestionSchema,
      game_like: JourneySessionSuggestionSchema,
      deep_creative: JourneySessionSuggestionSchema,
      minimal_normal: JourneySessionSuggestionSchema,
    }),
    completionPayoff: LaneCopyMapSchema,
    nextActionCopy: LaneCopyMapSchema,
    notificationCopy: z
      .object({
        title: LaneCopyMapSchema,
        body: LaneCopyMapSchema,
      })
      .optional(),
    premiumTrigger: JourneyPremiumMomentSchema,
    returnReason: LaneCopyMapSchema,
  })
  .strict();

// ── Retention journey copy (full 0-7 map) ──────────────────────────────
export const RetentionJourneyCopySchema = z.object({
  day0: JourneyDayCopySchema,
  day1: JourneyDayCopySchema,
  day2: JourneyDayCopySchema,
  day3: JourneyDayCopySchema,
  day4: JourneyDayCopySchema,
  day5: JourneyDayCopySchema,
  day6: JourneyDayCopySchema,
  day7: JourneyDayCopySchema,
});

// ── Journey state (computed per user per day) ──────────────────────────
export const JourneyStateInputSchema = z
  .object({
    userId: z.string().min(1),
    daysSinceOnboarding: z.number().int().min(0),
    completedSessions: z.number().int().min(0),
    hasCompletedToday: z.boolean(),
    hasSeenMemoryInsight: z.boolean(),
    lane: LaneSchema,
    rescueCompleted: z.number().int().min(0),
    recentDismissals: z.number().int().min(0),
    inactivityDays: z.number().int().min(0),
    hasInsightReady: z.boolean(),
  })
  .strict();

export const JourneyStateSchema = z
  .object({
    day: JourneyDaySchema,
    phase: JourneyPhaseSchema,
    emotionalState: EmotionalStateSchema,
    homeMessage: JourneyHomeMessageSchema,
    primaryCta: z.string().min(1).max(120),
    sessionSuggestion: JourneySessionSuggestionSchema,
    completionPayoff: z.string().min(1).max(300),
    nextActionCopy: z.string().min(1).max(200),
    returnReason: z.string().min(1).max(200),
    nudgePolicy: JourneyNudgePolicySchema,
    premiumTrigger: JourneyPremiumMomentSchema,
    momentType: JourneyMomentSchema,
  })
  .strict();

// ── Derived types ──────────────────────────────────────────────────────
export type JourneyDay = z.infer<typeof JourneyDaySchema>;
export type JourneyPhase = z.infer<typeof JourneyPhaseSchema>;
export type JourneyState = z.infer<typeof JourneyStateSchema>;
export type JourneyStateInput = z.infer<typeof JourneyStateInputSchema>;
export type JourneyHomeMessage = z.infer<typeof JourneyHomeMessageSchema>;
export type JourneySessionSuggestion = z.infer<
  typeof JourneySessionSuggestionSchema
>;
export type JourneyMoment = z.infer<typeof JourneyMomentSchema>;
export type JourneyReturnReason = z.infer<typeof JourneyReturnReasonSchema>;
export type JourneyPremiumMoment = z.infer<typeof JourneyPremiumMomentSchema>;
export type JourneyNudgePolicy = z.infer<typeof JourneyNudgePolicySchema>;
export type LaneCopyMap = z.infer<typeof LaneCopyMapSchema>;
export type RetentionJourneyCopy = z.infer<typeof RetentionJourneyCopySchema>;
