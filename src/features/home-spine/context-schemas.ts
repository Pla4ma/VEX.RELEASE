import { z } from 'zod';

export const ProductContextSchema = z
  .object({
    surfaceMap: z
      .record(
        z.string().min(1),
        z.enum([
          'hidden',
          'tiny_tease',
          'spotlight',
          'secondary',
          'primary',
          'blocked',
        ]),
      )
      .optional(),
    firstWeekExperience: z
      .object({
        bossIntensity: z.enum(['hidden', 'subtle', 'tiny_tease', 'visible']),
        currentDayStage: z.string().min(1),
        premiumMoment: z.enum(['none', 'soft_tease', 'weekly_value', 'hidden']),
        allowedHomeSurfaces: z.array(z.string().min(1)),
      })
      .strict()
      .optional(),
    motivationStyle: z
      .enum([
        'calm',
        'friendly',
        'coach_led',
        'game_like',
        'intense',
        'study_focused',
      ])
      .optional(),
    userStage: z.enum(['new', 'activating', 'engaged', 'power']).optional(),
    totalCompletedSessions: z.number().int().min(0).optional(),
  })
  .partial();

export type ProductContext = z.infer<typeof ProductContextSchema>;

const PromiseModeSchema = z.enum([
  'FOCUS',
  'RECOVERY',
  'STUDY',
  'BOSS_PREP',
  'HABIT_BUILD',
]);

const CompanionPromiseStateSchema = z
  .object({
    kind: z.enum(['hidden', 'offline', 'pending', 'fulfilled', 'missed']),
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
