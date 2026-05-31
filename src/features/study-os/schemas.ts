import { z } from 'zod';

export const StudySourceSchema = z
  .object({
    createdAt: z.number().int().min(0),
    extractedTextStatus: z.enum(['none', 'pending', 'ready', 'failed']),
    id: z.string().min(1),
    title: z.string().min(1),
    type: z.enum(['paste', 'file', 'manual', 'syllabus']),
    userId: z.string().min(1),
  })
  .strict();

export const StudyBlockSchema = z
  .object({
    estimatedMinutes: z.number().int().min(5).max(180),
    id: z.string().min(1),
    objective: z.string().min(1),
    priority: z.enum(['low', 'medium', 'high']),
    status: z.enum(['not_started', 'scheduled', 'completed', 'skipped']),
    studyPlanId: z.string().min(1),
    title: z.string().min(1),
  })
  .strict();

export const ReviewItemSchema = z
  .object({
    answerHint: z.string().min(1).nullable(),
    confidence: z.enum(['unknown', 'weak', 'medium', 'strong']),
    dueAt: z.number().int().min(0).nullable(),
    id: z.string().min(1),
    prompt: z.string().min(1),
    studyPlanId: z.string().min(1),
  })
  .strict();

export const StudyPlanSchema = z
  .object({
    blocks: z.array(StudyBlockSchema),
    createdAt: z.number().int().min(0),
    deadlineAt: z.number().int().min(0).nullable(),
    id: z.string().min(1),
    reviewItems: z.array(ReviewItemSchema),
    source: StudySourceSchema,
    status: z.enum(['active', 'completed', 'failed_generation']),
    title: z.string().min(1),
    userId: z.string().min(1),
  })
  .strict();

export const StudyOsHomeSurfaceSchema = z
  .object({
    ctaLabel: z.string().min(1),
    hidden: z.boolean(),
    offlineFallback: z.string().min(1).nullable(),
    riskLabel: z.string().min(1).nullable(),
    title: z.string().min(1),
  })
  .strict();

export const StudyOsUnlockGateSchema = z
  .object({
    isUnlocked: z.boolean(),
    isDayZero: z.boolean(),
    completedSessions: z.number().int().min(0),
    studyUsageRatio: z.number().min(0).max(1),
    unlockReason: z.enum([
      'day_zero',
      'evidence_sessions',
      'evidence_usage',
      'first_week',
      'full',
    ]),
  })
  .strict();

export const StudyOsPremiumGateSchema = z
  .object({
    canAccessPremiumDepth: z.boolean(),
    revenueCatHealthy: z.boolean(),
    basicStudyFree: z.boolean(),
    restrictionReason: z.string().nullable(),
  })
  .strict();

export const RecallQuestionSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    answerHint: z.string().min(1).nullable(),
    kind: z.enum(['recall', 'reflection']),
    studyBlockId: z.string().min(1),
    studyPlanId: z.string().min(1),
  })
  .strict();

export type RecallQuestion = z.infer<typeof RecallQuestionSchema>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type StudyBlock = z.infer<typeof StudyBlockSchema>;
export type StudyOsHomeSurface = z.infer<typeof StudyOsHomeSurfaceSchema>;
export type StudyOsPremiumGate = z.infer<typeof StudyOsPremiumGateSchema>;
export type StudyOsUnlockGate = z.infer<typeof StudyOsUnlockGateSchema>;
export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type StudySource = z.infer<typeof StudySourceSchema>;
