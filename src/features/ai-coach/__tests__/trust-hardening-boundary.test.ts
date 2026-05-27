import {
  RecommendationEvidenceSchema,
  CoachMemorySchema,
  type CoachMemory,
  type RecommendationEvidence,
} from '../memory-schemas';
import {
  hashEvidence,
  buildColdStartEvidence,
  buildMemoryEvidence,
  generateRecommendationEvidence,
  canClaimStrongPattern,
  isSensitiveMemoryType,
  scopeMemoryForContext,
} from '../CoachMemory';

function makeMemory(overrides: Partial<CoachMemory> = {}): CoachMemory {
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

describe('Phase 9: Trust Hardening', () => {
  describe('RecommendationEvidence schema', () => {
    it('validates cold-start evidence', () => {
      const evidence = RecommendationEvidenceSchema.parse({
        fallbackReason: 'cold_start',
      });
      expect(evidence.fallbackReason).toBe('cold_start');
      expect(evidence.memoryIds).toBeUndefined();
    });

    it('validates memory-backed evidence', () => {
      const evidence = RecommendationEvidenceSchema.parse({
        memoryIds: ['123e4567-e89b-12d3-a456-426614174000'],
        evidenceSummary: 'Morning focus works well',
        confidence: 0.85,
      });
      expect(evidence.memoryIds).toHaveLength(1);
      expect(evidence.confidence).toBe(0.85);
    });

    it('rejects invalid fallback reason', () => {
      expect(() =>
        RecommendationEvidenceSchema.parse({ fallbackReason: 'invalid_reason' }),
      ).toThrow();
    });

    it('rejects confidence outside 0-1 range', () => {
      expect(() =>
        RecommendationEvidenceSchema.parse({ confidence: 1.5 }),
      ).toThrow();
    });
  });

  describe('Evidence contract functions', () => {
    it('buildColdStartEvidence creates valid cold-start', () => {
      const evidence = buildColdStartEvidence('cold_start');
      expect(evidence.fallbackReason).toBe('cold_start');
      expect(evidence.memoryIds).toBeUndefined();
    });

    it('buildColdStartEvidence handles all valid reasons', () => {
      expect(buildColdStartEvidence('cold_start').fallbackReason).toBe('cold_start');
      expect(buildColdStartEvidence('insufficient_data').fallbackReason).toBe('insufficient_data');
      expect(buildColdStartEvidence('user_override').fallbackReason).toBe('user_override');
    });

    it('buildMemoryEvidence with empty memories returns insufficient_data', () => {
      const evidence = buildMemoryEvidence([]);
      expect(evidence.fallbackReason).toBe('insufficient_data');
      expect(evidence.memoryIds).toBeUndefined();
    });

    it('buildMemoryEvidence computes average confidence', () => {
      const m1 = makeMemory({ id: '123e4567-e89b-12d3-a456-426614174010', metadata: { confidence: 0.6 } });
      const m2 = makeMemory({ id: '123e4567-e89b-12d3-a456-426614174011', metadata: { confidence: 0.8 } });
      const evidence = buildMemoryEvidence([m1, m2]);
      expect(evidence.confidence).toBe(0.7);
      expect(evidence.memoryIds).toHaveLength(2);
    });

    it('generateRecommendationEvidence returns cold-start when sessionCount < 3', () => {
      const evidence = generateRecommendationEvidence([], 2);
      expect(evidence.fallbackReason).toBe('cold_start');
      expect(evidence.memoryIds).toBeUndefined();
    });

    it('generateRecommendationEvidence returns memory evidence when sessionCount >= 3', () => {
      const memory = makeMemory({ metadata: { confidence: 0.9 } });
      const evidence = generateRecommendationEvidence([memory], 5);
      expect(evidence.fallbackReason).toBeUndefined();
      expect(evidence.memoryIds).toContain(memory.id);
      expect(evidence.confidence).toBe(0.9);
    });

    it('generateRecommendationEvidence uses explicit fallback when provided', () => {
      const evidence = generateRecommendationEvidence([], 5, 'user_override');
      expect(evidence.fallbackReason).toBe('user_override');
    });
  });

  describe('Session count gating', () => {
    it('canClaimStrongPattern returns false before 3 sessions', () => {
      expect(canClaimStrongPattern(0)).toBe(false);
      expect(canClaimStrongPattern(1)).toBe(false);
      expect(canClaimStrongPattern(2)).toBe(false);
    });

    it('canClaimStrongPattern returns true after 3 sessions', () => {
      expect(canClaimStrongPattern(3)).toBe(true);
      expect(canClaimStrongPattern(10)).toBe(true);
    });
  });

  describe('Evidence hash', () => {
    it('hashEvidence produces consistent output', () => {
      const hash1 = hashEvidence('test evidence');
      const hash2 = hashEvidence('test evidence');
      expect(hash1).toBe(hash2);
    });

    it('hashEvidence produces different output for different input', () => {
      const hash1 = hashEvidence('evidence A');
      const hash2 = hashEvidence('evidence B');
      expect(hash1).not.toBe(hash2);
    });

    it('hashEvidence starts with ev- prefix', () => {
      const hash = hashEvidence('test');
      expect(hash).toMatch(/^ev-/);
    });
  });

  describe('Sensitive content scoping', () => {
    it('isSensitiveMemoryType identifies sensitive types', () => {
      expect(isSensitiveMemoryType('DOCUMENT_MILESTONE')).toBe(true);
      expect(isSensitiveMemoryType('STUDY_PATTERN')).toBe(true);
      expect(isSensitiveMemoryType('FIRST_S_GRADE')).toBe(false);
      expect(isSensitiveMemoryType('BEST_STREAK')).toBe(false);
    });

    it('scopeMemoryForContext allows task_specific context for all memories', () => {
      const memory = makeMemory({ type: 'DOCUMENT_MILESTONE', metadata: { source: 'import' } });
      const result = scopeMemoryForContext(memory, 'task_specific');
      expect(result.usable).toBe(true);
    });

    it('scopeMemoryForContext blocks import-sourced sensitive memories from generic_coach', () => {
      const memory = makeMemory({ type: 'DOCUMENT_MILESTONE', metadata: { source: 'import' } });
      const result = scopeMemoryForContext(memory, 'generic_coach');
      expect(result.usable).toBe(false);
    });

    it('scopeMemoryForContext allows non-sensitive memories in generic_coach', () => {
      const memory = makeMemory({ type: 'FIRST_S_GRADE' });
      const result = scopeMemoryForContext(memory, 'generic_coach');
      expect(result.usable).toBe(true);
    });

    it('scopeMemoryForContext allows sensitive memories from non-import source', () => {
      const memory = makeMemory({ type: 'STUDY_PATTERN', source: 'session_completion' });
      const result = scopeMemoryForContext(memory, 'generic_coach');
      expect(result.usable).toBe(true);
    });
  });

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
});
