/**
 * Session Recommendation — Comprehensive Tests: Time-Based Recommendations
 *
 * Covers: time-based recommendations with complete hour coverage.
 */

// ── Mocks (must come before imports that use them) ───────────────────

jest.mock('../../../store', () => ({
  useAuthStore: jest.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { id: 'user-123' } }),
  ),
}));

jest.mock('../../../utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { emit: jest.fn() },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isPending: false, isError: false, error: null, refetch: jest.fn() })),
}));

// ── Imports ──────────────────────────────────────────────────────────

import { getTimeBasedRecommendation } from '../time-based-recommendations';

// ═══════════════════════════════════════════════════════════════════════
// 4. TIME-BASED RECOMMENDATIONS — complete hour coverage
// ═══════════════════════════════════════════════════════════════════════

describe('getTimeBasedRecommendation', () => {
  it('returns null for every hour 0-4', () => {
    for (let h = 0; h < 5; h++) {
      expect(getTimeBasedRecommendation(h)).toBeNull();
    }
  });

  it('returns non-null for every hour in early morning range (5-7)', () => {
    for (let h = 5; h < 8; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe('RECOVERY');
      expect(rec!.duration).toBe(15);
    }
  });

  it('returns null for hour 8', () => {
    expect(getTimeBasedRecommendation(8)).toBeNull();
  });

  it('returns FOCUS for every hour in peak range (9-10)', () => {
    for (let h = 9; h < 11; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe('FOCUS');
      expect(rec!.duration).toBe(45);
    }
  });

  it('returns null for hours 11-12', () => {
    expect(getTimeBasedRecommendation(11)).toBeNull();
    expect(getTimeBasedRecommendation(12)).toBeNull();
  });

  it('returns RECOVERY for every hour in afternoon range (13-14)', () => {
    for (let h = 13; h < 15; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe('RECOVERY');
      expect(rec!.duration).toBe(20);
    }
  });

  it('returns null for hours 15-18', () => {
    for (let h = 15; h < 19; h++) {
      expect(getTimeBasedRecommendation(h)).toBeNull();
    }
  });

  it('returns FOCUS for every hour in evening range (19-20)', () => {
    for (let h = 19; h < 21; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe('FOCUS');
      expect(rec!.duration).toBe(30);
    }
  });

  it('returns HABIT_BUILD for every hour in late night range (21-22)', () => {
    for (let h = 21; h < 23; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe('HABIT_BUILD');
      expect(rec!.duration).toBe(15);
    }
  });

  it('returns null for hour 23', () => {
    expect(getTimeBasedRecommendation(23)).toBeNull();
  });
});
