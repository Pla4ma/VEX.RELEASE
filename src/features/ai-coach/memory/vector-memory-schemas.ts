import { z } from 'zod';
import { CoachMemoryRowSchema, CoachMemorySchema } from './memory-schemas';

export const COACH_MEMORY_EMBEDDING_DIMENSIONS = 1536;

export const CoachMemoryEmbeddingSchema = z
  .array(z.number().finite())
  .length(COACH_MEMORY_EMBEDDING_DIMENSIONS);

export const StoreCoachMemoryEmbeddingInputSchema = z.object({
  memoryId: z.string().uuid(),
  userId: z.string().uuid(),
  embedding: CoachMemoryEmbeddingSchema,
  embeddingModel: z.string().min(1).max(120),
});

export const SemanticCoachMemorySearchInputSchema = z.object({
  userId: z.string().uuid(),
  queryEmbedding: CoachMemoryEmbeddingSchema,
  matchCount: z.number().int().min(1).max(20).default(8),
  matchThreshold: z.number().min(0).max(1).default(0.72),
});

export const MatchedCoachMemoryRowSchema = CoachMemoryRowSchema.extend({
  similarity: z.number().min(0).max(1),
});

export const MatchedCoachMemorySchema = CoachMemorySchema.extend({
  similarity: z.number().min(0).max(1),
});

export type CoachMemoryEmbedding = z.infer<
  typeof CoachMemoryEmbeddingSchema
>;
export type StoreCoachMemoryEmbeddingInput = z.infer<
  typeof StoreCoachMemoryEmbeddingInputSchema
>;
export type SemanticCoachMemorySearchInput = z.infer<
  typeof SemanticCoachMemorySearchInputSchema
>;
export type MatchedCoachMemory = z.infer<typeof MatchedCoachMemorySchema>;
