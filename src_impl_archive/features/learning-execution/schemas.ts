import { z } from 'zod';

export const LearningExecutionPersonaSchema = z.enum([
  'student',
  'work',
  'creative',
  'growth',
  'learning',
]);

export const LearningExecutionCopySchema = z.object({
  completionTitle: z.string().min(1),
  emptyCta: z.string().min(1),
  emptyTitle: z.string().min(1),
  homeCta: z.string().min(1),
  homeTitle: z.string().min(1),
  layerName: z.string().min(1),
  setupCta: z.string().min(1),
  setupEyebrow: z.string().min(1),
});

export const ContentStudyGateInputSchema = z.object({
  aiConfigured: z.boolean(),
  featureHealth: z.enum(['healthy', 'degraded', 'unavailable']),
  goal: z.enum(['WORK', 'STUDY', 'CREATIVE', 'PERSONAL', 'LEARNING']).nullable(),
  hasPrivacyDisclosure: z.boolean(),
  rateLimitsConfigured: z.boolean(),
  storageConfigured: z.boolean(),
  totalCompletedSessions: z.number().int().min(0),
});

export const ContentStudyGateSchema = z.object({
  fallback: z.string().nullable(),
  showUploadEntry: z.boolean(),
});

export const LearningSessionTargetSchema = z.object({
  contentId: z.string().min(1),
  focusAreas: z.array(z.string()),
  generationId: z.string().min(1),
  nextTaskId: z.string().min(1).nullable(),
  persona: LearningExecutionPersonaSchema,
  remainingMinutes: z.number().int().min(1),
  title: z.string().min(1),
});

export const LearningExecutionLayerSchema = z.object({
  copy: LearningExecutionCopySchema,
  dataModelImpact: z.string(),
  persona: LearningExecutionPersonaSchema,
  target: LearningSessionTargetSchema.nullable(),
});
