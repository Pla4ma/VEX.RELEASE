import { CoachMemorySchema } from '../memory/memory-schemas';

describe('Soft delete fields', () => {
  it('CoachMemorySchema accepts null deletedAt', () => {
    const memory = CoachMemorySchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: 'FIRST_S_GRADE',
      title: 'Test',
      description: 'Test',
      occurredAt: Date.now(),
      metadata: {},
      referencedCount: 0,
      lastReferencedAt: null,
      deletedAt: null,
      evidenceHash: null,
    });
    expect(memory.deletedAt).toBeNull();
  });

  it('CoachMemorySchema accepts deletedAt timestamp', () => {
    const now = Date.now();
    const memory = CoachMemorySchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      type: 'FIRST_S_GRADE',
      title: 'Test',
      description: 'Test',
      occurredAt: now,
      metadata: {},
      referencedCount: 0,
      lastReferencedAt: null,
      deletedAt: now,
      evidenceHash: 'ev-test123',
    });
    expect(memory.deletedAt).toBe(now);
    expect(memory.evidenceHash).toBe('ev-test123');
  });
});
