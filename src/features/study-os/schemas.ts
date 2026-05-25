import { z } from 'zod';

export const StudySourceSchema = z.object({
  createdAt: z.number().int().min(0),
  extractedTextStatus: z.enum(['none', 'pending', 'ready', 'failed']),
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(['paste', 'file', 'manual', 'syllabus']),
  userId: z.string().min(1),
}).strict();

export const StudyBlockSchema = z.object({
  estimatedMinutes: z.number().int().min(5).max(180),
  id: z.string().min(1),
  objective: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['not_started', 'scheduled', 'completed', 'skipped']),
  studyPlanId: z.string().min(1),
  title: z.string().min(1),
}).strict();

export const ReviewItemSchema = z.object({
  answerHint: z.string().min(1).nullable(),
  confidence: z.enum(['unknown', 'weak', 'medium', 'strong']),
  dueAt: z.number().int().min(0).nullable(),
  id: z.string().min(1),
  prompt: z.string().min(1),
  studyPlanId: z.string().min(1),
}).strict();

export const StudyPlanSchema = z.object({
  blocks: z.array(StudyBlockSchema),
  createdAt: z.number().int().min(0),
  deadlineAt: z.number().int().min(0).nullable(),
  id: z.string().min(1),
  reviewItems: z.array(ReviewItemSchema),
  source: StudySourceSchema,
  status: z.enum(['active', 'completed', 'failed_generation']),
  title: z.string().min(1),
  userId: z.string().min(1),
}).strict();

export const StudyOsHomeSurfaceSchema = z.object({
  ctaLabel: z.string().min(1),
  hidden: z.boolean(),
  offlineFallback: z.string().min(1).nullable(),
  riskLabel: z.string().min(1).nullable(),
  title: z.string().min(1),
}).strict();

export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export type StudyBlock = z.infer<typeof StudyBlockSchema>;
export type StudyOsHomeSurface = z.infer<typeof StudyOsHomeSurfaceSchema>;
export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type StudySource = z.infer<typeof StudySourceSchema>;
