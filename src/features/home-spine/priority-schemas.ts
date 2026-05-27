import { z } from "zod";

export const HomePriorityTypeSchema = z.enum([
  "STREAK_CRITICAL",
  "COMPANION_PROMISE",
  "PROMISE_RECOVERY",
  "STREAK_AT_RISK",
  "RECOMMENDED_SESSION",
  "CHALLENGE_NEAR_DONE",
  "BOSS_ACTIVE",
  "DEFAULT_SESSION",
]);

export type HomePriorityType = z.infer<typeof HomePriorityTypeSchema>;

export const HomePriorityCTAActionSchema = z.enum([
  "OPEN_BOSS",
  "OPEN_CHALLENGES",
  "OPEN_SESSION_SETUP",
]);

export type HomePriorityCTAAction = z.infer<typeof HomePriorityCTAActionSchema>;

export const HomePriorityCTASchema = z
  .object({
    action: HomePriorityCTAActionSchema,
    params: z.record(z.unknown()).optional(),
    text: z.string(),
  })
  .strict();

export type HomePriorityCTA = z.infer<typeof HomePriorityCTASchema>;

export const HomePrimaryPrioritySchema = z
  .object({
    cta: HomePriorityCTASchema,
    reason: z.string(),
    type: HomePriorityTypeSchema,
    urgency: z.number().min(0).max(100),
  })
  .strict();

export type HomePrimaryPriority = z.infer<typeof HomePrimaryPrioritySchema>;

export const HomeStakesSchema = z
  .object({
    atRisk: z.string().optional(),
    potentialGain: z.string().optional(),
    what: z.string(),
  })
  .strict();

export type HomeStakes = z.infer<typeof HomeStakesSchema>;

export const HomeProgressSchema = z
  .object({
    dailyGoalMinutes: z.number(),
    streakDays: z.number(),
    todayMinutes: z.number(),
  })
  .strict();

export type HomeProgress = z.infer<typeof HomeProgressSchema>;

export const HomeSecondaryActionSchema = z
  .object({
    onPress: z.function(),
    title: z.string(),
    type: z.string(),
  })
  .strict();

export type HomeSecondaryAction = z.infer<typeof HomeSecondaryActionSchema>;

export const HomePrioritySchema = z
  .object({
    primary: HomePrimaryPrioritySchema,
    progress: HomeProgressSchema,
    secondary: z.array(HomeSecondaryActionSchema).max(3),
    stakes: HomeStakesSchema,
  })
  .strict();

export type HomePriority = z.infer<typeof HomePrioritySchema>;

export const ProductContextSchema = z
  .object({
    surfaceMap: z
      .record(
        z.string().min(1),
        z.enum([
          "hidden",
          "tiny_tease",
          "spotlight",
          "secondary",
          "primary",
          "blocked",
        ]),
      )
      .optional(),
    firstWeekExperience: z
      .object({
        bossIntensity: z.enum(["hidden", "subtle", "tiny_tease", "visible"]),
        currentDayStage: z.string().min(1),
        premiumMoment: z.enum(["none", "soft_tease", "weekly_value", "hidden"]),
        allowedHomeSurfaces: z.array(z.string().min(1)),
      })
      .strict()
      .optional(),
    motivationStyle: z
      .enum([
        "calm",
        "friendly",
        "coach_led",
        "game_like",
        "intense",
        "study_focused",
      ])
      .optional(),
    userStage: z.enum(["new", "activating", "engaged", "power"]).optional(),
    totalCompletedSessions: z.number().int().min(0).optional(),
  })
  .partial();

export type ProductContext = z.infer<typeof ProductContextSchema>;

const PromiseModeSchema = z.enum([
  "FOCUS",
  "RECOVERY",
  "STUDY",
  "BOSS_PREP",
  "HABIT_BUILD",
]);

const CompanionPromiseStateSchema = z
  .object({
    kind: z.enum(["hidden", "offline", "pending", "fulfilled", "missed"]),
    targetDurationMinutes: z.number().int().positive().optional(),
    targetMode: PromiseModeSchema.optional(),
  })
  .strict();

const HomeChallengeSignalSchema = z
  .object({
    id: z.string().uuid().optional(),
    isNearDone: z.boolean(),
    progressPercent: z.number().min(0).max(100),
    title: z.string().optional(),
  })
  .strict();

const HomeRecommendationSignalSchema = z
  .object({
    hasActive: z.boolean(),
    id: z.string().uuid().optional(),
    suggestedDurationSeconds: z.number().int().positive().optional(),
    suggestedMode: PromiseModeSchema.optional(),
  })
  .strict();

export const HomeContextSnapshotSchema = z
  .object({
    userId: z.string().uuid(),
    timestamp: z.number(),
    boss: z
      .object({
        hasActiveEncounter: z.boolean(),
        healthRemaining: z.number().optional(),
        isFinalStrike: z.boolean(),
        maxHealth: z.number().optional(),
      })
      .strict(),
    challenge: HomeChallengeSignalSchema,
    coach: z
      .object({
        hasIntervention: z.boolean(),
        hoursRemaining: z.number().optional(),
        interventionType: z.string().optional(),
      })
      .strict(),
    companionPromise: CompanionPromiseStateSchema,
    daily: z
      .object({
        goalMinutes: z.number(),
        minutesFocused: z.number(),
        sessionsCompleted: z.number(),
      })
      .strict(),
    onboarding: z
      .object({
        firstSessionCompleted: z.boolean(),
        isComplete: z.boolean(),
      })
      .strict(),
    recommendation: HomeRecommendationSignalSchema,
    streak: z
      .object({
        currentDays: z.number(),
        hoursRemaining: z.number().optional(),
        isAtRisk: z.boolean(),
        isComeback: z.boolean(),
      })
      .strict(),
    studyPlan: z
      .object({
        dueToday: z.boolean(),
        hasActivePlan: z.boolean(),
        itemsDue: z.number(),
      })
      .strict(),
  })
  .strict();

export type HomeContextSnapshot = z.infer<typeof HomeContextSnapshotSchema>;
