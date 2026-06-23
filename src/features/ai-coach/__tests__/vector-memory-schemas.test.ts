import {
  COACH_MEMORY_EMBEDDING_DIMENSIONS,
  CoachMemoryEmbeddingSchema,
  SemanticCoachMemorySearchInputSchema,
} from '../memory/vector-memory-schemas';

const userId = '123e4567-e89b-12d3-a456-426614174000';

function embedding(value: number): number[] {
  return Array.from(
    { length: COACH_MEMORY_EMBEDDING_DIMENSIONS },
    () => value,
  );
}

describe('vector memory schemas', () => {
  it('accepts exactly 1536 embedding dimensions', () => {
    expect(CoachMemoryEmbeddingSchema.parse(embedding(0.01))).toHaveLength(
      COACH_MEMORY_EMBEDDING_DIMENSIONS,
    );
  });

  it('rejects embeddings with missing dimensions', () => {
    expect(() => CoachMemoryEmbeddingSchema.parse([0.01])).toThrow();
  });

  it('defaults semantic search controls to safe bounded values', () => {
    const parsed = SemanticCoachMemorySearchInputSchema.parse({
      userId,
      queryEmbedding: embedding(0.02),
    });

    expect(parsed.matchCount).toBe(8);
    expect(parsed.matchThreshold).toBe(0.72);
  });
});
