import { z } from 'zod';

export const MemoryCandidateSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  source: z.enum(['study_block', 'recall', 'reflection', 'import']),
  sourceId: z.string().min(1),
  confidence: z.enum(['weak', 'medium', 'strong']),
  tags: z.array(z.string().min(1)),
  createdAt: z.number().int().min(0),
  userId: z.string().min(1),
}).strict();

export type MemoryCandidate = z.infer<typeof MemoryCandidateSchema>;

export const MemoryCandidateInputSchema = z.object({
  content: z.string().min(1).max(2000),
  source: z.enum(['study_block', 'recall', 'reflection', 'import']),
  sourceId: z.string().min(1),
  tags: z.array(z.string().min(1)).optional().default([]),
  userId: z.string().min(1),
}).strict();

export type MemoryCandidateInput = z.infer<typeof MemoryCandidateInputSchema>;

export const MemoryCandidateListSchema = z.array(MemoryCandidateSchema);
export type MemoryCandidateList = z.infer<typeof MemoryCandidateListSchema>;

export const MemoryCandidateQueryResultSchema = z.object({
  candidates: MemoryCandidateListSchema,
  total: z.number().int().min(0),
}).strict();
