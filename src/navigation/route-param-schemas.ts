import { z } from 'zod';

const uuidish = z.string().min(1).max(100);
const optionalShortText = z.string().max(1000).optional();

export const sessionSetupParamsSchema = z.object({
  presetId: optionalShortText,
  presetDuration: z.number().positive().optional(),
  presetMode: z.enum(['LIGHT_FOCUS', 'DEEP_WORK', 'SPRINT', 'CREATIVE', 'STUDY', 'RECOVERY']).optional(),
  selectedThemeId: optionalShortText,
  goal: optionalShortText,
  suggestedDurationSeconds: z.number().positive().optional(),
  suggestedDifficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH']).optional(),
  recommendationId: optionalShortText,
  comebackMultiplier: z.number().positive().optional(),
  comebackMessage: optionalShortText,
  comebackQuest: z.object({
    streakBefore: z.number().int().nonnegative(),
    requiredSessions: z.number().int().positive(),
  }).nullable().optional(),
  warContext: z.object({
    squadWarId: uuidish,
    squadId: uuidish,
  }).nullable().optional(),
  focusAreas: z.array(z.string().max(80)).optional(),
  learningExecutionLabel: optionalShortText,
  learningExecutionTaskId: optionalShortText,
  source: z.enum(['content-study', 'learning-execution', 'onboarding_first_session']).optional(),
  generationId: optionalShortText,
  contentId: optionalShortText,
  studyPlanId: optionalShortText,
  sessionCategory: optionalShortText,
  sessionTags: z.array(z.string().max(80)).optional(),
}).strict();

export const routeParamSchemas = {
  ActiveSession: z.object({ sessionId: uuidish, selectedThemeId: optionalShortText }).strict(),
  Analytics: z.object({ month: optionalShortText }).strict(),
  Comeback: z.object({ comebackState: z.unknown() }).strict(),
  ContentReview: z.object({ contentId: uuidish }).strict(),
  Leaderboard: z.object({
    period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    scope: z.enum(['GLOBAL', 'FRIENDS']).optional(),
  }).strict().optional(),
  MonthlyFocusReport: z.object({
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2100).optional(),
  }).strict().optional(),
  Onboarding: z.object({ step: z.number().int().nonnegative().optional() }).strict(),
  Paywall: z.object({
    contextBody: optionalShortText,
    contextCta: optionalShortText,
    contextHeadline: optionalShortText,
    gatedFeature: optionalShortText,
    source: optionalShortText,
  }).strict(),
  Profile: z.object({
    userId: optionalShortText,
    tab: z.enum(['stats', 'achievements', 'activity', 'social']).optional(),
  }).strict(),
  Search: z.object({ query: optionalShortText }).strict(),
  SessionComplete: z.object({ sessionId: uuidish, summary: z.unknown() }).strict(),
  SessionSetup: sessionSetupParamsSchema,
  Settings: z.object({ screen: optionalShortText }).strict(),
  StreakFuneral: z.object({
    previousStreak: z.number().int().nonnegative(),
    diedAt: z.number().positive(),
  }).strict(),
  StudyPlan: z.object({ generationId: uuidish, contentId: uuidish }).strict(),
  VipPaywall: z.object({ source: optionalShortText, gemCount: z.number().nonnegative().optional() }).strict(),
} as const;

export type ValidatedRouteName = keyof typeof routeParamSchemas;

export function validateRouteParams(routeName: string, params: unknown): unknown {
  const schema = routeParamSchemas[routeName as ValidatedRouteName];
  if (!schema) {
    return params;
  }

  return schema.parse(params);
}
