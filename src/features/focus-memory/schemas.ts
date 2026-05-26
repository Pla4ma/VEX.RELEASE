import { z } from 'zod';

export const FocusMemoryTypeSchema = z.enum([
  'best_time_window',
  'avoidance_trigger',
  'successful_session_pattern',
  'failed_session_pattern',
  'preferred_tone',
  'study_deadline',
  'project_continuity',
  'friction_preference',
  'notification_preference',
  'lane_evidence',
]);

export const FocusMemorySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: FocusMemoryTypeSchema,
  summary: z.string().min(1),
  source: z.enum(['session_completion', 'reflection', 'behavior', 'import', 'manual']),
  confidence: z.number().min(0).max(1),
  accepted: z.boolean(),
  deletedAt: z.number().int().min(0).nullable(),
  expiresAt: z.number().int().min(0).nullable(),
  evidenceHash: z.string().nullable(),
  createdAt: z.number().int().min(0),
  updatedAt: z.number().int().min(0),
}).strict();

export const ColdStartReasonSchema = z.enum([
  'cold_start',
  'insufficient_data',
  'user_override',
]);

export const RecommendationEvidenceSchema = z.object({
  memoryIds: z.array(z.string()).optional(),
  evidenceSummary: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  fallbackReason: ColdStartReasonSchema.optional(),
}).strict();

export const CreateMemoryCandidateInputSchema = z.object({
  userId: z.string().min(1),
  type: FocusMemoryTypeSchema,
  summary: z.string().min(1),
  source: z.enum(['session_completion', 'reflection', 'behavior', 'import', 'manual']),
  confidence: z.number().min(0).max(1),
  evidenceHash: z.string().min(1).optional(),
  createdAt: z.number().int().min(0).optional(),
}).strict();

export const MemoryRecommendationInputSchema = z.object({
  userId: z.string().min(1),
  types: z.array(FocusMemoryTypeSchema).optional(),
  minConfidence: z.number().min(0).max(1).optional().default(0.5),
  now: z.number().int().min(0).optional(),
}).strict();

export type ColdStartReason = z.infer<typeof ColdStartReasonSchema>;
export type RecommendationEvidence = z.infer<typeof RecommendationEvidenceSchema>;
export type CreateMemoryCandidateInput = z.infer<typeof CreateMemoryCandidateInputSchema>;
export type FocusMemory = z.infer<typeof FocusMemorySchema>;
export type FocusMemoryType = z.infer<typeof FocusMemoryTypeSchema>;
export type MemoryRecommendationInput = z.infer<typeof MemoryRecommendationInputSchema>;
