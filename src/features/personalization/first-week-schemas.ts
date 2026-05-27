import { z } from "zod";

import { LaneProfileSchema, LaneSchema } from "../lane-engine/schemas";

export const FirstWeekStageSchema = z.enum([
  "DAY_0_NOT_STARTED",
  "DAY_0_FIRST_SESSION_STARTED",
  "DAY_1_RETURN",
  "DAY_2_PROGRESS_PROOF",
  "DAY_3_COMPANION_CONNECTION",
  "DAY_5_PATH_FORMING",
  "DAY_7_DEEPER_MODE",
  "POST_DAY_7",
]);

export const ComebackStateSchema = z.enum([
  "none",
  "missed_1_day",
  "missed_2_3_days",
  "missed_week",
  "returning_after_long_gap",
]);

export const FirstWeekSurfaceSchema = z.enum([
  "motivation_confirmation",
  "coach_presence_line",
  "start_session",
  "tiny_unlock_preview",
  "progress_proof",
  "companion_continuity",
  "study_deep_work_path",
  "tiny_boss_teaser",
  "subtle_momentum",
  "weekly_insight",
  "recovery_cta",
]);

export const HiddenFirstWeekSurfaceSchema = z.enum([
  "boss_full",
  "shop",
  "inventory",
  "battle_pass",
  "wagers",
  "rivals",
  "squads",
  "leaderboards",
  "premium_currency",
  "premium_hard_sell",
  "advanced_economy",
]);

export const FirstWeekSafeIntentSchema = z.enum([
  "START_SESSION",
  "CONTINUE_STUDY_PATH",
  "OPEN_PROGRESS",
  "OPEN_WEEKLY_INSIGHT",
]);

export const SessionProfileSchema = z
  .object({
    averageDurationMinutes: z.number().int().min(1),
    completions: z.number().int().min(0),
    abandonments: z.number().int().min(0),
    preferredStartHour: z.number().int().min(0).max(23).nullable(),
    consistencyScore: z.number().min(0).max(1),
    savedNextMoves: z.number().int().min(0),
    longestStreak: z.number().int().min(0),
  })
  .strict();

export type SessionProfile = z.infer<typeof SessionProfileSchema>;

export const FirstWeekInputSchema = z
  .object({
    behaviorStats: z
      .object({
        bossEngagement: z.enum(["none", "low", "medium", "high"]),
        studyUsageRatio: z.number().min(0).max(1),
      })
      .strict(),
    completedSessions: z.number().int().min(0),
    daysSinceLastSession: z.number().int().min(0).nullable(),
    daysSinceOnboarding: z.number().int().min(0),
    featureAvailability: z
      .object({
        boss: z.boolean(),
        premium: z.boolean(),
        social: z.boolean(),
        study: z.boolean(),
      })
      .strict(),
    motivationStyle: z.enum([
      "calm",
      "friendly",
      "coach_led",
      "study_focused",
      "game_like",
      "intense",
    ]),
    premiumState: z.enum(["unavailable", "configured", "active"]),
    primaryGoal: z.enum([
      "focus",
      "study",
      "work",
      "creative",
      "personal",
      "personal_growth",
      "learning",
    ]),
    laneProfile: LaneProfileSchema.optional(),
    sessionProfile: SessionProfileSchema.optional(),
  })
  .strict();

export const FirstWeekExperienceSchema = z
  .object({
    allowedHomeSurfaces: z.array(FirstWeekSurfaceSchema),
    bossIntensity: z.enum(["hidden", "subtle", "tiny_tease", "visible"]),
    coachMessageType: z.string().min(1),
    comebackState: ComebackStateSchema,
    completionEmphasis: z.string().min(1),
    currentDayStage: FirstWeekStageSchema,
    hiddenSurfaces: z.array(HiddenFirstWeekSurfaceSchema),
    lane: LaneSchema,
    laneConfidence: z.number().min(0).max(1),
    laneStageTheme: z.string().min(1),
    notificationAllowedTypes: z.array(z.string().min(1)),
    premiumMoment: z.enum(["none", "soft_tease", "weekly_value", "hidden"]),
    primaryCTA: z
      .object({
        intent: FirstWeekSafeIntentSchema,
        label: z.string().min(1),
      })
      .strict(),
    primaryMessage: z.string().min(1),
    secondaryCTA: z
      .object({
        intent: FirstWeekSafeIntentSchema,
        label: z.string().min(1),
      })
      .nullable(),
    spotlightSurface: z.enum([
      "none",
      "progress_proof",
      "study_deep_work_path",
      "tiny_boss_teaser",
      "weekly_insight",
    ]),
    blockedSurfaceReasons: z.array(z.string().min(1)),
    firstWeekExperiment: z
      .object({
        title: z.string().min(1),
        action: z.string().min(1),
      })
      .strict()
      .nullable(),
    studyLayerLabel: z.enum([
      "Study OS",
      "Deep Work Plan",
      "Learning OS",
      "Project Focus Path",
      "Growth Path",
    ]),
    unlockExplanation: z.string().min(1),
    unlockTease: z.string().min(1).nullable(),
  })
  .strict();

export type FirstWeekExperience = z.infer<typeof FirstWeekExperienceSchema>;
export type FirstWeekResolverInput = z.infer<typeof FirstWeekInputSchema>;
export type FirstWeekStage = z.infer<typeof FirstWeekStageSchema>;
