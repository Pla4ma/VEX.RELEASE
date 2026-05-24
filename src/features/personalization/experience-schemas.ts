import { z } from 'zod';
import {
  BossIntensitySchema,
  CompletionStepSchema,
  HomeSectionSchema,
  PreferredToneSchema,
  SessionModeSchema,
  StudyLayerNameSchema,
  VexSystemToDisableSchema,
} from './core-schemas';

export const HomeLayoutVariantSchema = z.enum([
  'compact_starter',
  'coach_first',
  'study_centered',
  'game_centered',
  'full_expanded',
]);

export const VexExperienceSchema = z.object({
  allowedNotificationTypes: z.array(z.string().min(1)),
  allowedRoutes: z.array(z.string().min(1)),
  bannedSurfaces: z.array(z.string().min(1)),
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
  bossCopyStyle: z.enum(['subtle_momentum', 'boss_health', 'controlled_intensity']),
  bossIntensity: BossIntensitySchema,
  bossMode: z.enum(['hidden', 'momentum', 'personal_boss']),
  coachMessageStyle: z.string().min(1),
  coachTone: PreferredToneSchema,
  companionIntensity: z.enum(['none', 'subtle', 'present', 'active']),
  companionMode: z.enum(['visual_coach', 'quiet_presence', 'active_partner']),
  companionVisualIntensity: z.enum(['none', 'subtle', 'present', 'active']),
  completion: z.object({
    fallback: z.string().min(1),
    sequence: z.array(CompletionStepSchema),
  }).strict(),
  completionSequence: z.array(CompletionStepSchema),
  hiddenSystems: z.array(VexSystemToDisableSchema),
  home: z.object({
    coachCopy: z.string().min(1),
    sections: z.array(HomeSectionSchema),
    studyName: StudyLayerNameSchema,
  }).strict(),
  homeLayoutVariant: HomeLayoutVariantSchema,
  homeSections: z.array(HomeSectionSchema),
  homeSpotlight: z.enum(['none', 'coach_presence', 'progress_proof', 'study_layer', 'boss_momentum']),
  nextBestAction: z.object({
    intent: z.enum(['START_SESSION', 'CONTINUE_STUDY_PATH', 'OPEN_PROGRESS']),
    label: z.string().min(1),
  }).strict(),
  premium: z.object({
    copy: z.string().min(1),
    mustRemainFree: z.array(z.string().min(1)),
    shouldTease: z.boolean(),
    trigger: z.enum(['none', 'session_value', 'advanced_study', 'weekly_intelligence', 'custom_identity']),
  }).strict(),
  premiumMoment: z.enum(['none', 'session_value', 'advanced_study', 'weekly_intelligence', 'custom_identity']),
  primaryHomeCTA: z.object({
    intent: z.enum(['START_SESSION', 'CONTINUE_STUDY_PATH']),
    label: z.string().min(1),
  }).strict(),
  progressEmphasis: z.enum(['basic', 'rhythm', 'intelligence']),
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
  secondaryHomeCTA: z.object({
    intent: z.enum(['OPEN_PROGRESS', 'OPEN_COACH']),
    label: z.string().min(1),
  }).nullable(),
  sessionDefaults: z.object({
    copy: z.string().min(1),
    duration: z.number().int().min(5),
    mode: SessionModeSchema,
  }).strict(),
  sessionSuggestion: z.string().min(1),
  studyLayerLabel: StudyLayerNameSchema,
  studyLayerProminence: z.enum(['hidden', 'supporting', 'spotlight']),
  teasedSystems: z.array(z.string().min(1)),
  userStage: z.enum(['new_user', 'activating', 'engaged', 'power_user']),
  version: z.literal(3),
}).strict();

export type HomeLayoutVariant = z.infer<typeof HomeLayoutVariantSchema>;
export type VexExperience = z.infer<typeof VexExperienceSchema>;
