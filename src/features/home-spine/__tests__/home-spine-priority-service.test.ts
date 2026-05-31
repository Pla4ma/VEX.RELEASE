/**
 * Tests for home-spine priority-service.ts
 * (rankHomePriorityCandidates, pickHomePrimaryPriority)
 */

import {
  rankHomePriorityCandidates,
  pickHomePrimaryPriority,
} from '../priority-service';

import type { HomeContextSnapshot } from '../priority-schemas';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userId = '550e8400-e29b-41d4-a716-446655440000';

function makeSnapshot(
  overrides: Partial<HomeContextSnapshot> = {},
): HomeContextSnapshot {
  return {
    userId,
    timestamp: Date.now(),
    boss: { hasActiveEncounter: false, isFinalStrike: false },
    challenge: { isNearDone: false, progressPercent: 0 },
    coach: { hasIntervention: false },
    companionPromise: { kind: 'hidden' },
    daily: { goalMinutes: 60, minutesFocused: 0, sessionsCompleted: 0 },
    onboarding: { firstSessionCompleted: false, isComplete: false },
    recommendation: { hasActive: false },
    streak: { currentDays: 0, isAtRisk: false, isComeback: false },
    studyPlan: { dueToday: false, hasActivePlan: false, itemsDue: 0 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// priority-service tests
// ---------------------------------------------------------------------------
describe('home-spine: priority-service', () => {
  describe('rankHomePriorityCandidates', () => {
    it('returns at least DEFAULT_SESSION when no conditions match', () => {
      const snap = makeSnapshot();
      const ranked = rankHomePriorityCandidates(snap);
      expect(ranked.length).toBeGreaterThanOrEqual(1);
      expect(ranked.some((p) => p.type === 'DEFAULT_SESSION')).toBe(true);
    });

    it('places STREAK_CRITICAL before DEFAULT_SESSION', () => {
      const snap = makeSnapshot({
        streak: { currentDays: 10, isAtRisk: true, hoursRemaining: 1, isComeback: false },
      });
      const ranked = rankHomePriorityCandidates(snap);
      const critIdx = ranked.findIndex((p) => p.type === 'STREAK_CRITICAL');
      const defIdx = ranked.findIndex((p) => p.type === 'DEFAULT_SESSION');
      expect(critIdx).toBeGreaterThanOrEqual(0);
      expect(defIdx).toBeGreaterThanOrEqual(0);
      expect(critIdx).toBeLessThan(defIdx);
    });
  });

  describe('pickHomePrimaryPriority', () => {
    it('returns the highest-priority candidate', () => {
      const snap = makeSnapshot({
        streak: { currentDays: 10, isAtRisk: true, hoursRemaining: 1, isComeback: false },
      });
      const picked = pickHomePrimaryPriority(snap);
      expect(picked.type).toBe('STREAK_CRITICAL');
    });

    it('returns DEFAULT_SESSION for a clean new-user snapshot', () => {
      const snap = makeSnapshot();
      const picked = pickHomePrimaryPriority(snap);
      expect(picked.type).toBe('DEFAULT_SESSION');
    });
  });
});
