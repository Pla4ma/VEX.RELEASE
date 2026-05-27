import { z } from "zod";
import { LaneSchema } from "../lane-engine/schemas";
import { SessionModeSchema } from "../../session/modes";

// ============================================================================
// Session Stake Schema (Phase 2) — @deprecated Replaced by LaneSessionBrief
// ============================================================================

export const SessionStakeSchema = z
  .object({
    userId: z.string().uuid(),
    sessionId: z.string().uuid().optional(),

    // User choices
    selectedDurationSeconds: z.number().min(60).max(14400),
    selectedMode: z.enum([
      "LIGHT_FOCUS",
      "DEEP_WORK",
      "SPRINT",
      "CREATIVE",
      "STUDY",
      "RECOVERY",
      "STARTER",
    ]),
    selectedLoadout: z.array(z.string().min(1)).optional(),

    // Boss stakes (economy fields removed per Phase 5 plan)
    boss: z
      .object({
        encounterId: z.string().uuid().optional(),
        name: z.string(),
        healthRemaining: z.number(),
        maxHealth: z.number(),
        estimatedDamageMin: z.number(),
        estimatedDamageMax: z.number(),
        isFinalStrike: z.boolean(),
      })
      .optional(),

    // Streak stakes
    streak: z.object({
      currentDays: z.number(),
      status: z.enum(["SAFE", "AT_RISK", "CRITICAL"]),
      hoursRemaining: z.number().optional(),
    }),

    // Challenge stakes
    challenges: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        progressBefore: z.number(),
        progressAfter: z.number(),
        willComplete: z.boolean(),
        reward: z.string().optional(),
      }),
    ),

    // Offline restrictions
    offlineLimitations: z.array(z.string()),
  })
  .strict();

export type SessionStake = z.infer<typeof SessionStakeSchema>;

export const LaneSessionBriefSchema = z
  .object({
    lane: LaneSchema,
    userFacingModeName: z.enum(["Study", "Run", "Project", "Clean"]),
    title: z.string().min(1),
    body: z.string().min(1),
    successCondition: z.string().min(1),
    sessionMode: SessionModeSchema,
    suggestedDurationSeconds: z
      .number()
      .int()
      .min(5 * 60)
      .max(180 * 60),
    risk: z
      .object({
        type: z.enum([
          "deadline",
          "avoidance",
          "streak",
          "project_stale",
          "none",
        ]),
        label: z.string().min(1),
      })
      .nullable(),
    friction: z
      .object({
        level: z.enum(["none", "soft", "medium", "hard"]),
        reason: z.string().min(1),
      })
      .nullable(),
    afterCompletion: z.string().min(1),
    ctaLabel: z.string().min(1),
    focusStrategyLoadout: z.array(z.string().min(1)),
    offlineMessage: z.string().nullable(),
  })
  .strict();

export type LaneSessionBrief = z.infer<typeof LaneSessionBriefSchema>;

// ============================================================================
// Navigation Params
// ============================================================================

export const SessionSetupNavigationParamsSchema = z.object({
  presetDuration: z.number().int().positive().optional(),
  presetId: z.string().optional(),
  presetMode: z
    .enum([
      "LIGHT_FOCUS",
      "DEEP_WORK",
      "SPRINT",
      "CREATIVE",
      "STUDY",
      "RECOVERY",
    ])
    .optional(),
  selectedThemeId: z.string().optional(),
  goal: z.string().optional(),
  suggestedDurationSeconds: z.number().int().positive().optional(),
  suggestedDifficulty: z
    .enum(["EASY", "NORMAL", "CHALLENGING", "PUSH"])
    .optional(),
  recommendationId: z.string().optional(),
  comebackMultiplier: z.number().positive().optional(),
  comebackMessage: z.string().optional(),
  comebackQuest: z
    .object({
      streakBefore: z.number().int().nonnegative(),
      requiredSessions: z.number().int().positive(),
    })
    .nullable()
    .optional(),
  warContext: z
    .object({
      squadWarId: z.string(),
      squadId: z.string(),
    })
    .nullable()
    .optional(),
  focusAreas: z.array(z.string()).optional(),
  learningExecutionLabel: z.string().optional(),
  learningExecutionTaskId: z.string().optional(),
  source: z
    .enum([
      "content-study",
      "learning-execution",
      "onboarding_first_session",
      "rescue",
    ])
    .optional(),
  generationId: z.string().optional(),
  contentId: z.string().optional(),
  studyPlanId: z.string().optional(),
  sessionCategory: z.string().optional(),
  sessionTags: z.array(z.string()).optional(),
  rescuePlanId: z.string().optional(),
  rescueTaskDescription: z.string().optional(),
});

export const SESSION_SETUP_SOURCE_ONBOARDING = "onboarding_first_session";

export type SessionSetupNavigationParams = z.infer<
  typeof SessionSetupNavigationParamsSchema
>;

export const SessionStartSummarySchema = z.object({
  ctaLabel: z.string(),
  customizationLabel: z.string(),
  subtitle: z.string(),
});

export type SessionStartSummary = z.infer<typeof SessionStartSummarySchema>;

export const SessionStartHeroSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  body: z.string(),
});

export type SessionStartHero = z.infer<typeof SessionStartHeroSchema>;

export const FocusModeCardSchema = z.object({
  accessibilityHint: z.string().min(1),
  accessibilityLabel: z.string().min(1),
  body: z.string().min(1),
  ctaLabel: z.string().min(1),
  durationSeconds: z.number().int().min(60).max(3600),
  id: z.string().min(1),
  mode: z.enum([
    "LIGHT_FOCUS",
    "DEEP_WORK",
    "SPRINT",
    "CREATIVE",
    "STUDY",
    "RECOVERY",
  ]),
  title: z.string().min(1),
});

export type FocusModeCard = z.infer<typeof FocusModeCardSchema>;

// ============================================================================
// Adaptive Difficulty Suggestion Schemas (BONUS PHASE)
// ============================================================================

export const SessionDifficultySchema = z.enum(["CASUAL", "FOCUSED", "INTENSE"]);

export const DifficultySuggestionStatsSchema = z.object({
  sessionsAnalyzed: z.number().int().min(0),
  averageGrade: z.number().min(1).max(5),
  averagePurity: z.number().min(0).max(100),
});

export const DifficultySuggestionSchema = z.object({
  suggestion: SessionDifficultySchema.nullable(),
  reason: z.string().min(1).max(500),
  confidence: z.enum(["low", "medium", "high"]),
  stats: DifficultySuggestionStatsSchema,
});

export const DifficultyPreferenceSchema = z.object({
  userId: z.string().uuid(),
  currentDifficulty: SessionDifficultySchema,
  suggestedDifficulty: SessionDifficultySchema.nullable(),
  lastSuggestionAt: z.number().int().optional(),
  suggestionDismissedAt: z.number().int().optional(),
  timesShown: z.number().int().min(0).default(0),
  timesAccepted: z.number().int().min(0).default(0),
});

export type SessionDifficulty = z.infer<typeof SessionDifficultySchema>;
export type DifficultySuggestion = z.infer<typeof DifficultySuggestionSchema>;
export type DifficultyPreference = z.infer<typeof DifficultyPreferenceSchema>;
