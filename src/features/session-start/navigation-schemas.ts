import { z } from 'zod';

// ============================================================================
// Navigation Params
// ============================================================================

export const SessionSetupNavigationParamsSchema = z.object({
  presetDuration: z.number().int().positive().optional(),
  presetId: z.string().optional(),
  presetMode: z
    .enum([
      'LIGHT_FOCUS',
      'DEEP_WORK',
      'SPRINT',
      'CREATIVE',
      'STUDY',
      'RECOVERY',
    ])
    .optional(),
  selectedThemeId: z.string().optional(),
  goal: z.string().optional(),
  suggestedDurationSeconds: z.number().int().positive().optional(),
  suggestedDifficulty: z
    .enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH'])
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
      'content-study',
      'learning-execution',
      'onboarding_first_session',
      'rescue',
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

export const SESSION_SETUP_SOURCE_ONBOARDING = 'onboarding_first_session';

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
    'LIGHT_FOCUS',
    'DEEP_WORK',
    'SPRINT',
    'CREATIVE',
    'STUDY',
    'RECOVERY',
  ]),
  title: z.string().min(1),
});

export type FocusModeCard = z.infer<typeof FocusModeCardSchema>;
