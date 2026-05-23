import { z } from 'zod';

export const HomeSurfaceKeySchema = z.enum([
  'start_session',
  'coach_presence',
  'progress_proof',
  'focus_score',
  'progress_detail',
  'study_layer',
  'companion_thread',
  'boss_teaser',
  'boss_compact',
  'boss_full_cta',
  'challenge_teaser',
  'unlock_strip',
  'premium_tease',
  'weekly_quest',
]);

export type HomeSurfaceKey = z.infer<typeof HomeSurfaceKeySchema>;

export const HomeSurfaceDecisionSchema = z.enum([
  'hidden',
  'tiny_tease',
  'spotlight',
  'secondary',
  'primary',
  'blocked',
]);

export type HomeSurfaceDecision = z.infer<typeof HomeSurfaceDecisionSchema>;

export const HomeSurfaceMapSchema = z.record(HomeSurfaceKeySchema, HomeSurfaceDecisionSchema);

export type HomeSurfaceMap = z.infer<typeof HomeSurfaceMapSchema>;

const FirstWeekPhaseSchema = z.object({
  allowedHomeSurfaces: z.array(z.string().min(1)),
  bossIntensity: z.enum(['hidden', 'subtle', 'tiny_tease', 'visible']),
  premiumMoment: z.enum(['none', 'soft_tease', 'weekly_value', 'hidden']),
  spotlightSurface: z.enum(['none', 'progress_proof', 'study_deep_work_path', 'tiny_boss_teaser', 'weekly_insight']),
  studyLayerLabel: z.string().min(1),
}).partial().optional();

export const DegradedFeatureSchema = z.enum([
  'content_study',
  'ai_coach_advanced',
  'premium_paywall',
  'boss_tab',
]);

export const SurfaceDecisionInputSchema = z.object({
  featureAvailability: z.object({
    boss: z.boolean(),
    challenges: z.boolean(),
    premium: z.boolean(),
    study: z.boolean(),
  }).strict(),
  personalizationProfile: z.object({
    motivationStyle: z.enum([
      'calm', 'friendly', 'coach_led', 'game_like', 'intense', 'study_focused',
    ]),
    primaryGoal: z.enum(['focus', 'study', 'work', 'creative', 'personal', 'learning']),
    gamificationIntensity: z.enum(['minimal', 'medium', 'strong']),
    studyLayerName: z.string().min(1),
    userStage: z.enum(['new', 'activating', 'engaged', 'power']),
  }).strict(),
  behaviorStats: z.object({
    totalCompletedSessions: z.number().int().min(0),
    studyUsageRatio: z.number().min(0).max(1),
    bossChallengeEngagement: z.enum(['none', 'low', 'medium', 'high']),
    coachInteractions: z.number().int().min(0),
    comebackSessions: z.number().int().min(0),
    ignoredFeatures: z.array(z.string().min(1)),
    premiumFeatureAttempts: z.array(z.string().min(1)),
    completionStreak: z.number().int().min(0),
  }).strict(),
  hasActiveStudyPlan: z.boolean(),
  hasActiveRecommendation: z.boolean(),
  hasActiveBoss: z.boolean(),
  isFirstSession: z.boolean(),
  firstWeekPhase: FirstWeekPhaseSchema,
  degradedFeatures: z.array(DegradedFeatureSchema).default([]),
});
