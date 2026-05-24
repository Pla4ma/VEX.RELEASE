import { z } from 'zod';

export const ExplicitMotivationStyleSchema = z.enum([
  'calm',
  'study_focused',
  'game_like',
  'coach_led',
  'intense',
]);

export const HomeExperienceStageSchema = z.enum([
  'STAGE_0',
  'STAGE_1',
  'STAGE_2',
  'STAGE_3',
  'STAGE_4',
]);

export const HomeSectionSchema = z.enum([
  'motivation_style',
  'coach_line',
  'primary_session',
  'single_evolution_teaser',
  'session_reflection',
  'progress_signal',
  'study_layer',
  'companion_thread',
  'adaptive_challenge',
]);

export const HomeTeaserSchema = z.object({
  copy: z.string().min(1),
  system: z.enum(['coach', 'study', 'companion', 'rpg', 'progress']),
}).strict();

export const HomeSpotlightSystemSchema = z.enum([
  'none',
  'study',
  'coach',
  'boss_progress',
  'progress_rhythm',
  'companion',
]);

export type HomeSpotlightSystem = z.infer<typeof HomeSpotlightSystemSchema>;

export const HomeExperienceModelSchema = z.object({
  aiCoachMessageStyle: z.string().min(1),
  allowedQueries: z.array(z.string().min(1)),
  allowedRoutes: z.array(z.string().min(1)),
  companionPlacement: z.string().min(1),
  hiddenSections: z.array(HomeSectionSchema),
  mustNotRun: z.array(z.string().min(1)),
  primaryCta: z.string().min(1),
  progressPlacement: z.string().min(1),
  rpgBossPlacement: z.string().min(1),
  secondaryCta: z.string().min(1),
  spotlight: HomeSpotlightSystemSchema,
  stage: HomeExperienceStageSchema,
  studyOsPlacement: z.string().min(1),
  teasedElements: z.array(HomeTeaserSchema).max(1),
  unlockPathCopy: z.string().min(1),
  visibleSections: z.array(HomeSectionSchema),
}).strict();

export type ExplicitMotivationStyle = z.infer<typeof ExplicitMotivationStyleSchema>;
export type HomeExperienceModel = z.infer<typeof HomeExperienceModelSchema>;
export type HomeExperienceStage = z.infer<typeof HomeExperienceStageSchema>;
export type HomeSection = z.infer<typeof HomeSectionSchema>;
