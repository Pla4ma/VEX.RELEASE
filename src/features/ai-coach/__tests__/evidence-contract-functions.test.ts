import {
  buildColdStartEvidence,
  buildMemoryEvidence,
  generateRecommendationEvidence,
} from '../CoachMemory';
import { makeMemory } from './trust-hardening-boundary-helpers';

describe('Evidence contract functions', () => {
  it('buildColdStartEvidence creates valid cold-start', () => {
    const evidence = buildColdStartEvidence('cold_start');
    expect(evidence.fallbackReason).toBe('cold_start');
    expect(evidence.memoryIds).toBeUndefined();
  });

  it('buildColdStartEvidence handles all valid reasons', () => {
    expect(buildColdStartEvidence('cold_start').fallbackReason).toBe(
      'cold_start',
    );
    expect(buildColdStartEvidence('insufficient_data').fallbackReason).toBe(
      'insufficient_data',
    );
    expect(buildColdStartEvidence('user_override').fallbackReason).toBe(
      'user_override',
    );
  });

  it('buildMemoryEvidence with empty memories returns insufficient_data', () => {
    const evidence = buildMemoryEvidence([]);
    expect(evidence.fallbackReason).toBe('insufficient_data');
    expect(evidence.memoryIds).toBeUndefined();
  });

  it('buildMemoryEvidence computes average confidence', () => {
    const m1 = makeMemory({
      id: '123e4567-e89b-12d3-a456-426614174010',
      metadata: { confidence: 0.6 },
    });
    const m2 = makeMemory({
      id: '123e4567-e89b-12d3-a456-426614174011',
      metadata: { confidence: 0.8 },
    });
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
