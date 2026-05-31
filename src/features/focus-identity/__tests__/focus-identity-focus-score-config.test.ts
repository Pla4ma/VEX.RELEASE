/**
 * Focus Identity — Focus Score Config Tests
 */

import { FACTOR_WEIGHTS } from '../score-algorithm.helpers';
import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from '../focus-score-config';

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe('FOCUS_SCORE_CONFIG', () => {
  test('has correct min/max/initial score', () => {
    expect(FOCUS_SCORE_CONFIG.MIN_SCORE).toBe(300);
    expect(FOCUS_SCORE_CONFIG.MAX_SCORE).toBe(850);
    expect(FOCUS_SCORE_CONFIG.INITIAL_SCORE).toBe(550);
  });

  test('BANDS are sorted from highest to lowest', () => {
    for (let i = 1; i < FOCUS_SCORE_CONFIG.BANDS.length; i++) {
      expect(FACTOR_WEIGHTS).toBeDefined(); // just using as a proxy
      expect(FOCUS_SCORE_CONFIG.BANDS[i]!.max).toBeLessThanOrEqual(
        FOCUS_SCORE_CONFIG.BANDS[i - 1]!.min,
      );
    }
  });

  test('FACTOR_WEIGHTS sum to 1.0', () => {
    const sum = Object.values(FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  test('SCORE_CHANGES has correct structure', () => {
    for (const [, config] of Object.entries(FOCUS_SCORE_CONFIG.SCORE_CHANGES)) {
      expect(typeof config.base).toBe('number');
      expect(typeof config.max).toBe('number');
    }
  });

  test('IDENTITY_STATEMENTS has entries for all bands', () => {
    for (const band of FOCUS_SCORE_CONFIG.BANDS) {
      expect(IDENTITY_STATEMENTS[band.label]).toBeDefined();
      expect(IDENTITY_STATEMENTS[band.label].length).toBeGreaterThan(0);
    }
  });
});
