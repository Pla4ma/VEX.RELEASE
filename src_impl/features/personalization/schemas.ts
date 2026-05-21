import { z } from 'zod';

export const MotivationStyleSchema = z.enum([
  'calm',
  'student',
  'game_like',
  'coach_led',
  'intense',
]);

export const BossIntensitySchema = z.enum([
  'subtle',
  'standard',
  'game-like',
  'intense',
]);

export const PrimaryGoalSchema = z.enum([
  'WORK',
  'STUDY',
  'CREATIVE',
  'PERSONAL',
]);

export const CoachToneSchema = z.enum(['calm', 'direct', 'warm', 'strategic']);
export const CoachModeSchema = z.enum(['reflective', 'directive', 'study', 'performance']);
export const StudyLayerNameSchema = z.enum(['Study OS', 'Deep Work OS', 'Execution OS']);
export const SessionModeSchema = z.enum(['FOCUS', 'STUDY', 'DEEP_WORK', 'SPRINT']);
export const UserStageSchema = z.enum(['new', 'activating', 'engaged', 'power']);

export const HomeSectionSchema = z.enum([
  'coach_line',
  'primary_session',
  'progress_signal',
  'study_layer',
  'companion_thread',
  'boss_teaser',
  'boss_compact',
  'boss_full_cta',
  'premium_tease',
]);

export const CompletionStepSchema = z.enum([
  'core_saved',
  'coach_companion_reflection',
  'streak_progress',
  'study_progress',
  'boss_effect',
  'quiet_xp',
  'next_action',
]);

export const VexSystemToDisableSchema = z.enum([
  'shop',
  'inventory',
  'premium_currency',
  'battle_pass',
  'wagers',
  'rivals',
  'squads',
  'leaderboards',
  'advanced_economy',
]);

export const FeatureAvailabilitySnapshotSchema = z.object({
  boss: z.boolean(),
  challenges: z.boolean(),
  premium: z.boolean(),
  study: z.boolean(),
}).strict();

export const BehaviorStatsSchema = z.object({
  abandonedSessionDurations: z.array(z.number().int().min(1)),
  bossChallengeEngagement: z.enum(['none', 'low', 'medium', 'high']),
  coachInteractions: z.number().int().min(0),
  comebackSessions: z.number().int().min(0),
  completedSessionDurations: z.array(z.number().int().min(1)),
  completionStreak: z.number().int().min(0),
  ignoredFeatures: z.array(z.string().min(1)),
  mostSuccessfulTimeOfDay: z.string().min(1).nullable(),
  preferredSessionMode: SessionModeSchema.nullable(),
  premiumFeatureAttempts: z.array(z.string().min(1)),
  studyUsageRatio: z.number().min(0).max(1),
  totalCompletedSessions: z.number().int().min(0),
}).strict();

export const VexPersonalizationProfileSchema = z.object({
  coachMode: CoachModeSchema,
  defaultSessionDuration: z.number().int().min(5),
  defaultSessionMode: SessionModeSchema,
  featureIntensityMap: z.record(BossIntensitySchema),
  gamificationIntensity: BossIntensitySchema,
  motivationStyle: MotivationStyleSchema,
  preferredTone: CoachToneSchema,
  primaryGoal: PrimaryGoalSchema,
  studyLayerName: StudyLayerNameSchema,
  userStage: UserStageSchema,
}).strict();

export const VexExperienceSchema = z.object({
  behaviorAdaptations: z.array(z.string().min(1)),
  boss: z.object({
    completionEffect: z.enum(['none', 'smooth_pulse', 'session_damage']),
    copy: z.string().min(1),
    dayZeroTeaserAllowed: z.boolean(),
    homePlacement: z.enum(['hidden', 'top_tiny', 'compact_card', 'optional_screen']),
    intensity: BossIntensitySchema,
    isVisible: z.boolean(),
    progressSource: z.enum(['none', 'completed_focus_sessions']),
    systemsDisabled: z.array(VexSystemToDisableSchema),
  }).strict(),
  completion: z.object({
    fallback: z.string().min(1),
    sequence: z.array(CompletionStepSchema),
  }).strict(),
  home: z.object({
    coachCopy: z.string().min(1),
    sections: z.array(HomeSectionSchema),
    studyName: StudyLayerNameSchema,
  }).strict(),
  premium: z.object({
    copy: z.string().min(1),
    mustRemainFree: z.array(z.string().min(1)),
    shouldTease: z.boolean(),
    trigger: z.enum(['none', 'session_value', 'advanced_study', 'weekly_intelligence', 'custom_identity']),
  }).strict(),
  release: z.object({
    hidden: z.array(z.string().min(1)),
    included: z.array(z.string().min(1)),
    productionProof: z.array(z.string().min(1)),
    teasedOnly: z.array(z.string().min(1)),
  }).strict(),
  routeGates: z.object({
    boss: z.object({ canNavigate: z.boolean(), canQuery: z.boolean() }).strict(),
    premium: z.object({ canNavigate: z.boolean(), canQuery: z.boolean() }).strict(),
  }).strict(),
  sessionDefaults: z.object({
    copy: z.string().min(1),
    duration: z.number().int().min(5),
    mode: SessionModeSchema,
  }).strict(),
}).strict();

export type BehaviorStats = z.infer<typeof BehaviorStatsSchema>;
export type BossIntensity = z.infer<typeof BossIntensitySchema>;
export type CompletionStep = z.infer<typeof CompletionStepSchema>;
export type FeatureAvailabilitySnapshot = z.infer<typeof FeatureAvailabilitySnapshotSchema>;
export type HomeSection = z.infer<typeof HomeSectionSchema>;
export type MotivationStyle = z.infer<typeof MotivationStyleSchema>;
export type VexExperience = z.infer<typeof VexExperienceSchema>;
export type VexPersonalizationProfile = z.infer<typeof VexPersonalizationProfileSchema>;
export type VexSystemToDisable = z.infer<typeof VexSystemToDisableSchema>;
