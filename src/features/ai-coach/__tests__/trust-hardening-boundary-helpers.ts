import {
  RecommendationEvidenceSchema,
  CoachMemorySchema,
  type CoachMemory,
} from '../memory-schemas';

export function makeMemory(overrides: Partial<CoachMemory> = {}): CoachMemory {
  return CoachMemorySchema.parse({
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    type: 'FIRST_S_GRADE',
    title: 'First S Grade',
    description: 'Achieved first S grade',
    occurredAt: Date.now() - 86400000,
    metadata: {},
    referencedCount: 0,
    lastReferencedAt: null,
    deletedAt: null,
    evidenceHash: null,
    ...overrides,
  });
}
