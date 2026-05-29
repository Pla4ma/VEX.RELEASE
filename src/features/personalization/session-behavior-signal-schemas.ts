import { z } from "zod";

export const SessionBehaviorSignalTypeSchema = z.enum([
  "session_started",
  "session_completed",
  "session_abandoned",
  "session_paused",
  "session_resumed",
  "app_opened_no_session",
  "cta_dismissed",
  "notification_dismissed",
  "rescue_offered",
  "rescue_started",
  "rescue_completed",
  "reflection_saved",
  "next_action_saved",
  "mode_changed",
  "study_target_completed",
  "project_handoff_saved",
]);

export type SessionBehaviorSignalType = z.infer<
  typeof SessionBehaviorSignalTypeSchema
>;

export const SessionModeAtSignalSchema = z.enum([
  "FOCUS",
  "STUDY",
  "DEEP_WORK",
  "SPRINT",
  "CREATIVE",
  "RECOVERY",
]);

export const SignalConfidenceLevelSchema = z.enum([
  "low",
  "medium",
  "high",
]);

export const SessionBehaviorSignalSchema = z
  .object({
    userId: z.string().min(1),
    signalType: SessionBehaviorSignalTypeSchema,
    timestamp: z.number().int().min(0),
    mode: SessionModeAtSignalSchema.nullable(),
    sessionId: z.string().min(1).nullable(),
    confidence: SignalConfidenceLevelSchema,
    source: z.string().min(1),
    metadata: z
      .object({
        durationSeconds: z.number().int().min(0).optional(),
        completionPercentage: z.number().min(0).max(100).optional(),
        pauseCount: z.number().int().min(0).optional(),
        previousMode: SessionModeAtSignalSchema.nullable().optional(),
        newMode: SessionModeAtSignalSchema.nullable().optional(),
        studyTarget: z.string().min(1).nullable().optional(),
        nextActionLabel: z.string().min(1).nullable().optional(),
        ctaLabel: z.string().min(1).nullable().optional(),
        notificationType: z.string().min(1).nullable().optional(),
        hourOfDay: z.number().int().min(0).max(23).optional(),
        dismissedEvening: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type SessionBehaviorSignal = z.infer<
  typeof SessionBehaviorSignalSchema
>;

export const SessionBehaviorWindowSchema = z
  .object({
    signals: z.array(SessionBehaviorSignalSchema).max(200),
    updatedAt: z.number().int().min(0),
  })
  .strict();

export type SessionBehaviorWindow = z.infer<
  typeof SessionBehaviorWindowSchema
>;

export const SessionBehaviorSummarySchema = z
  .object({
    totalSessionsStarted: z.number().int().min(0),
    totalSessionsCompleted: z.number().int().min(0),
    totalSessionsAbandoned: z.number().int().min(0),
    totalPauses: z.number().int().min(0),
    averageDurationSeconds: z.number().min(0),
    recentDurationsSeconds: z.array(z.number().int().min(0)),
    appOpenedNoSessionCount: z.number().int().min(0),
    consecutiveAppOpenedNoSession: z.number().int().min(0),
    ctaDismissals: z.number().int().min(0),
    notificationDismissals: z.number().int().min(0),
    eveningDismissals: z.number().int().min(0),
    rescueStartedCount: z.number().int().min(0),
    rescueCompletedCount: z.number().int().min(0),
    reflectionCount: z.number().int().min(0),
    modeChanges: z.number().int().min(0),
    lastMode: SessionModeAtSignalSchema.nullable(),
    previousMode: SessionModeAtSignalSchema.nullable(),
    studyTargetsCompleted: z.number().int().min(0),
    lastStudyTarget: z.string().nullable(),
    projectHandoffSaved: z.boolean(),
    lastHandoffLabel: z.string().nullable(),
    signalCount: z.number().int().min(0),
    hasEnoughData: z.boolean(),
  })
  .strict();

export type SessionBehaviorSummary = z.infer<
  typeof SessionBehaviorSummarySchema
>;

export const AdaptationRuleInputSchema = z
  .object({
    summary: SessionBehaviorSummarySchema,
    currentDurationMinutes: z.number().min(5).max(180).optional().default(25),
    currentMode: SessionModeAtSignalSchema.optional(),
    lane: z.enum(["student", "game_like", "deep_creative", "minimal_normal"]).optional(),
  })
  .strict();

export type AdaptationRuleInput = z.infer<typeof AdaptationRuleInputSchema>;

export const AdaptationResultSchema = z
  .object({
    shouldShowRescue: z.boolean(),
    rescueReason: z.string().nullable(),
    suggestedDurationMinutes: z.number().min(5).max(180),
    shouldReduceFriction: z.boolean(),
    shouldQuietEveningNudges: z.boolean(),
    shouldUseHandoffForNextSession: z.boolean(),
    handoffLabel: z.string().nullable(),
    shouldSuggestShorterSessions: z.boolean(),
    shorterSessionReason: z.string().nullable(),
    shouldSuggestStudyReview: z.boolean(),
    studyReviewTarget: z.string().nullable(),
    shouldReduceGameLanguage: z.boolean(),
    gameLanguageReason: z.string().nullable(),
    modeChangeDetected: z.boolean(),
    fromMode: SessionModeAtSignalSchema.nullable(),
    toMode: SessionModeAtSignalSchema.nullable(),
    userFacingAdaptation: z.string().nullable(),
    confidence: SignalConfidenceLevelSchema,
  })
  .strict();

export type AdaptationResult = z.infer<typeof AdaptationResultSchema>;
