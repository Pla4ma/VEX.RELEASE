import { z } from 'zod';

export const OnboardingGoalSchema = z.enum([
  'build_consistency',
  'deep_work',
  'study_focus',
  'beat_distractions',
]);

export const CompanionElementSchema = z.enum([
  'FLAME',
  'WAVE',
  'TERRA',
  'ZEPHYR',
  'VOID',
  'LUMINA',
]);

export const OnboardingDraftSchema = z.object({
  goal: OnboardingGoalSchema.optional(),
  element: CompanionElementSchema.optional(),
  personaId: z.string().min(1).optional(),
  starterPresetId: z.string().min(1).optional(),
  squadId: z.string().min(1).nullable().optional(),
  updatedAt: z.number().optional(),
}).strict();

export const OnboardingProfileSchema = z.object({
  goal: OnboardingGoalSchema,
  element: CompanionElementSchema,
  personaId: z.string().min(1),
  starterPresetId: z.string().min(1),
  squadId: z.string().min(1).nullable(),
  completedAt: z.number(),
}).strict();

export const OnboardingPersistedStateSchema = z.object({
  drafts: z.record(OnboardingDraftSchema).default({}),
  profiles: z.record(OnboardingProfileSchema).default({}),
}).strict();
