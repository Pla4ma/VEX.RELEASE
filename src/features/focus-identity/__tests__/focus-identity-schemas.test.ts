/**
 * Focus Identity — Schemas Tests
 */

import {
  MIN_FOCUS_SCORE,
  MAX_FOCUS_SCORE,
  FocusScoreBandLabelSchema,
  FocusScoreFactorKeySchema,
  FocusScoreUpdateInputSchema,
  getFocusScoreFactorsWeightTotal,
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

describe('focus-identity schemas', () => {
  test('MIN and MAX focus score constants are correct', () => {
    expect(MIN_FOCUS_SCORE).toBe(300);
    expect(MAX_FOCUS_SCORE).toBe(850);
  });

  test('FocusScoreBandLabelSchema accepts all valid band labels', () => {
    const labels = ['Legendary', 'Elite', 'Exceptional', 'Strong', 'Good', 'Fair', 'Building'];
    for (const label of labels) {
      expect(() => FocusScoreBandLabelSchema.parse(label)).not.toThrow();
    }
    expect(() => FocusScoreBandLabelSchema.parse('INVALID')).toThrow();
  });

  test('FocusScoreFactorKeySchema accepts all factor keys', () => {
    const keys = [
      'consistency', 'streakStability', 'sessionQuality',
      'intentionalDifficulty', 'contractCompletion', 'recency',
    ];
    for (const key of keys) {
      expect(() => FocusScoreFactorKeySchema.parse(key)).not.toThrow();
    }
  });

  test('FocusScoreUpdateInputSchema validates complete input', () => {
    const parsed = FocusScoreUpdateInputSchema.parse(makeUpdateInput());
    expect(parsed.userId).toBe('00000000-0000-4000-8000-000000000001');
    expect(parsed.previousScore).toBe(550);
  });

  test('FocusScoreUpdateInputSchema rejects missing required fields', () => {
    expect(() => FocusScoreUpdateInputSchema.parse({})).toThrow();
  });

  test('getFocusScoreFactorsWeightTotal sums weights correctly', () => {
    const factors = {
      consistency: { weightPercent: 35, score: 50, delta: 0, explanation: 'test' },
      streakStability: { weightPercent: 25, score: 50, delta: 0, explanation: 'test' },
      sessionQuality: { weightPercent: 20, score: 50, delta: 0, explanation: 'test' },
      intentionalDifficulty: { weightPercent: 7, score: 50, delta: 0, explanation: 'test' },
      contractCompletion: { weightPercent: 8, score: 50, delta: 0, explanation: 'test' },
      recency: { weightPercent: 5, score: 50, delta: 0, explanation: 'test' },
    };
    expect(getFocusScoreFactorsWeightTotal(factors)).toBe(100);
  });
});
