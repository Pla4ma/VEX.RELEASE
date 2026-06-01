/**
 * Focus Identity — Score Algorithm Helpers Tests
 */

import {
  FACTOR_WEIGHTS,
  FACTOR_LABELS,
  clampScore,
  getBand,
  getFactorExplanation,
  getGradeAdjustment,
  getModeAdjustment,
  getXpMultiplier,
} from '../score-algorithm.helpers';

import {
  MIN_FOCUS_SCORE,
  MAX_FOCUS_SCORE,
} from '../schemas';

// ─── FIXTURES ────────────────────────────────────────────────────────────────

function makeUpdateInput(overrides: Record<string, unknown> = {}) {
  return {
    userId: '00000000-0000-4000-8000-000000000001',
    previousScore: 550,
    eventType: 'session:completed' as const,
    grade: 'A' as const,
    sessionMode: 'standard' as const,
    occurredAt: '2025-06-01T12:00:00.000Z',
    signals: {
      consistency: 65,
      streakStability: 60,
      sessionQuality: 70,
      intentionalDifficulty: 55,
      recency: 60,
    },
    ...overrides,
  };
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe('score-algorithm helpers', () => {
  test('FACTOR_WEIGHTS sum to 100', () => {
    const sum = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  test('FACTOR_LABELS has a label for each factor key', () => {
    expect(Object.keys(FACTOR_LABELS)).toHaveLength(6);
    expect(FACTOR_LABELS.consistency).toBe('Consistency');
    expect(FACTOR_LABELS.streakStability).toBe('Streak stability');
    expect(FACTOR_LABELS.recency).toBe('Recency');
  });

  test('clampScore enforces MIN and MAX bounds', () => {
    expect(clampScore(100)).toBe(MIN_FOCUS_SCORE);
    expect(clampScore(900)).toBe(MAX_FOCUS_SCORE);
    expect(clampScore(550)).toBe(550);
  });

  test('getBand returns correct band labels for score ranges', () => {
    expect(getBand(850)).toBe('Legendary');
    expect(getBand(750)).toBe('Elite');
    expect(getBand(700)).toBe('Exceptional');
    expect(getBand(600)).toBe('Strong');
    expect(getBand(520)).toBe('Good');
    expect(getBand(450)).toBe('Fair');
    expect(getBand(350)).toBe('Building');
  });

  test('getFactorExplanation varies by score range', () => {
    expect(getFactorExplanation('consistency', 90)).toContain('strength');
    expect(getFactorExplanation('consistency', 65)).toContain('stable');
    expect(getFactorExplanation('consistency', 45)).toContain('neutral');
    expect(getFactorExplanation('consistency', 20)).toContain('dragging');
  });

  test('getGradeAdjustment returns positive for good grades and negative for abandoned', () => {
    const input = makeUpdateInput();
    expect(getGradeAdjustment({ ...input, grade: 'S' })).toBe(14);
    expect(getGradeAdjustment({ ...input, grade: 'A' })).toBe(9);
    expect(getGradeAdjustment({ ...input, grade: 'B' })).toBe(4);
    expect(getGradeAdjustment({ ...input, grade: 'C' })).toBe(-2);
    expect(getGradeAdjustment({ ...input, grade: 'D' })).toBe(-8);
    expect(getGradeAdjustment({ ...input, eventType: 'session:abandoned' })).toBe(-12);
  });

  test('getModeAdjustment returns positive for deep_work and capped for recovery with S grade', () => {
    const input = makeUpdateInput();
    expect(getModeAdjustment({ ...input, sessionMode: 'deep_work' })).toBe(3);
    expect(getModeAdjustment({ ...input, sessionMode: 'recovery', grade: 'S' })).toBe(1);
    expect(getModeAdjustment({ ...input, sessionMode: 'starter' })).toBe(2);
    expect(getModeAdjustment({ ...input, sessionMode: 'standard' })).toBe(1);
  });

  test('getXpMultiplier varies by grade and caps for recovery mode', () => {
    const input = makeUpdateInput();
    expect(getXpMultiplier({ ...input, grade: 'S' })).toBe(1.8);
    expect(getXpMultiplier({ ...input, grade: 'D' })).toBe(0.75);
    expect(getXpMultiplier({ ...input, eventType: 'session:abandoned' })).toBe(0.5);
    expect(getXpMultiplier({ ...input, sessionMode: 'recovery', grade: 'S' })).toBeLessThanOrEqual(1.05);
  });
});
