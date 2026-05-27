import { z } from "zod";

export const CoachPresenceMotivationStyleSchema = z.enum([
  "CALM",
  "FRIENDLY",
  "STUDY_FOCUSED",
  "GAME_LIKE",
  "COACH_LED",
  "INTENSE",
]);

export const CoachActionIntentSchema = z.enum([
  "START_SESSION",
  "START_STUDY_SESSION",
  "REVIEW_PROGRESS",
  "TAKE_BREAK",
  "CONTINUE_PLAN",
  "REFLECT",
]);

export const CoachPresenceSurfaceSchema = z.enum([
  "HOME",
  "SESSION_SETUP",
  "SESSION_COMPLETION",
  "CHAT",
  "RESCUE",
  "PREMIUM",
]);

export const CoachPresenceToneSchema = z
  .object({
    motivationStyle: CoachPresenceMotivationStyleSchema,
    personality: z.enum([
      "steady",
      "warm",
      "studious",
      "playful",
      "directive",
      "sharp",
    ]),
    intensity: z.enum(["low", "medium", "high"]),
  })
  .strict();

export const CoachPresenceVisualStateSchema = z
  .object({
    element: z.string().min(1),
    level: z.number().int().min(1),
    mood: z.string().min(1),
    phase: z.string().min(1),
    reaction: z.enum([
      "steady",
      "focused",
      "celebrating",
      "recovering",
      "ready",
    ]),
  })
  .strict();

export const CoachPresenceMemorySummarySchema = z
  .object({
    coachMemoryCount: z.number().int().min(0),
    companionMemoryCount: z.number().int().min(0),
    latestMemory: z.string().min(1).nullable(),
    syncAvailable: z.boolean().default(true),
  })
  .strict();

export const CoachMemoryConfidenceSchema = z.enum([
  "none",
  "weak",
  "medium",
  "strong",
]);

export const CoachPresenceActionSchema = z
  .object({
    intent: CoachActionIntentSchema,
    label: z.string().min(1).max(32),
    reason: z.string().min(1).max(96),
  })
  .strict();

export const CoachPresenceSchema = z
  .object({
    id: z.string().min(1),
    tone: CoachPresenceToneSchema,
    visualCompanionState: CoachPresenceVisualStateSchema,
    message: z.string().min(1).max(96),
    nextAction: CoachPresenceActionSchema,
    sessionReflection: z.string().min(1).max(120),
    progressReaction: z.string().min(1).max(96),
    memorySummary: CoachPresenceMemorySummarySchema,
    memoryConfidence: CoachMemoryConfidenceSchema,
    motivationStyleAdaptation: z.string().min(1).max(96),
  })
  .strict();

export const CoachPresenceProgressInputSchema = z
  .object({
    currentStreakDays: z.number().int().min(0),
    highFocusStreak: z.number().int().min(0),
    totalSessions: z.number().int().min(0),
  })
  .strict();

export const CompletionPresenceSummarySchema = z
  .object({
    durationMinutes: z.number().int().min(0),
    focusPurityScore: z.number().min(0).max(100),
    isComeback: z.boolean(),
    isFirstSession: z.boolean(),
    isHighFocusStreak: z.boolean(),
    isLowEnergyDay: z.boolean(),
    isStreakRecovery: z.boolean(),
    sessionMode: z.string().min(1),
    streakDays: z.number().int().min(0),
  })
  .strict();

// ── Coach visibility policy ────────────────────────────────────────────
export const CoachVisibilitySurfaceSchema = z.enum([
  "ONBOARDING",
  "DAY_0_HOME",
  "SESSION_SETUP",
  "ACTIVE_SESSION",
  "PAUSE_INTERRUPTION",
  "COMPLETION",
  "RESCUE",
  "PREMIUM",
  "RETURN_HOME",
]);
export type CoachVisibilitySurface = z.infer<
  typeof CoachVisibilitySurfaceSchema
>;

export const CoachVisibilityDecisionSchema = z.enum([
  "VISIBLE",
  "HIDDEN",
  "SUBTLE_ONE_LINE",
  "AVAILABLE_ON_REQUEST",
]);
export type CoachVisibilityDecision = z.infer<
  typeof CoachVisibilityDecisionSchema
>;

export const CoachVisibilityPolicySchema = z
  .object({
    surface: CoachVisibilitySurfaceSchema,
    lane: z.enum(["student", "game_like", "deep_creative", "minimal_normal"]),
    decision: CoachVisibilityDecisionSchema,
    maxMessageLength: z.number().int().min(0).max(96).default(96),
    reason: z.string().min(1),
  })
  .strict();
export type CoachVisibilityPolicy = z.infer<typeof CoachVisibilityPolicySchema>;

export type CoachPresenceMotivationStyle = z.infer<
  typeof CoachPresenceMotivationStyleSchema
>;
export type CoachActionIntent = z.infer<typeof CoachActionIntentSchema>;
export type CoachPresenceSurface = z.infer<typeof CoachPresenceSurfaceSchema>;
export type CoachPresenceTone = z.infer<typeof CoachPresenceToneSchema>;
export type CoachPresenceVisualState = z.infer<
  typeof CoachPresenceVisualStateSchema
>;
export type CoachPresenceMemorySummary = z.infer<
  typeof CoachPresenceMemorySummarySchema
>;
export type CoachMemoryConfidence = z.infer<typeof CoachMemoryConfidenceSchema>;
export type CoachPresenceAction = z.infer<typeof CoachPresenceActionSchema>;
export type CoachPresence = z.infer<typeof CoachPresenceSchema>;
export type CoachPresenceProgressInput = z.infer<
  typeof CoachPresenceProgressInputSchema
>;
export type CompletionPresenceSummary = z.infer<
  typeof CompletionPresenceSummarySchema
>;
