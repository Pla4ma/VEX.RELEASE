import {
  calculateHoursRemaining,
  calculateQualifyingWindow,
  buildStreakDefenseState,
} from '../streak-defense';
import type { StreakSummary } from '../streak-defense';

describe('streak-defense', () => {
  describe('calculateHoursRemaining', () => {
    it('returns null when deadline is null', () => {
      expect(calculateHoursRemaining(null)).toBeNull();
    });

    it('returns null when deadline is undefined', () => {
      expect(calculateHoursRemaining(undefined)).toBeNull();
    });

    it('returns 0 when deadline is in the past', () => {
      const past = Date.now() - 3600000;
      expect(calculateHoursRemaining(past)).toBe(0);
    });

    it('returns positive hours when deadline is in the future', () => {
      const future = Date.now() + 7200000; // 2 hours
      const result = calculateHoursRemaining(future);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(2);
    });

    it('returns 0 for deadline right now', () => {
      const now = Date.now();
      expect(calculateHoursRemaining(now)).toBe(0);
    });
  });

  describe('calculateQualifyingWindow', () => {
    it('returns null when hoursRemaining is null', () => {
      expect(calculateQualifyingWindow(null)).toBeNull();
    });

    it('returns null when hoursRemaining > 12', () => {
      expect(calculateQualifyingWindow(24)).toBeNull();
    });

    it('returns window when hoursRemaining <= 12', () => {
      const result = calculateQualifyingWindow(4);
      expect(result).not.toBeNull();
      expect(result!.hoursUntilOpen).toBeGreaterThan(0);
      expect(result!.timeLabel).toContain('tomorrow');
    });
  });

  describe('buildStreakDefenseState', () => {
    it('returns default state when streakSummary is null', () => {
      const state = buildStreakDefenseState(null, 'user-1', false, null);
      expect(state.canFreeze).toBe(false);
      expect(state.graceUsesRemaining).toBe(0);
      expect(state.isAtRisk).toBe(false);
      expect(state.riskLevel).toBe('NONE');
    });

    it('returns default state when userId is null', () => {
      const summary: StreakSummary = {
        currentDays: 5,
        shieldAvailable: true,
        nextDeadline: null,
        isAtRisk: false,
        riskLevel: 'NONE',
      };
      const state = buildStreakDefenseState(summary, null, false, null);
      expect(state.canFreeze).toBe(false);
    });

    it('canFreeze is true when streak > 0 and shield available', () => {
      const summary: StreakSummary = {
        currentDays: 5,
        shieldAvailable: true,
        nextDeadline: null,
        isAtRisk: false,
        riskLevel: 'NONE',
      };
      const state = buildStreakDefenseState(summary, 'user-1', false, null);
      expect(state.canFreeze).toBe(true);
      expect(state.graceUsesRemaining).toBe(1);
    });

    it('canFreeze is false when shield not available', () => {
      const summary: StreakSummary = {
        currentDays: 5,
        shieldAvailable: false,
        nextDeadline: null,
        isAtRisk: false,
        riskLevel: 'NONE',
      };
      const state = buildStreakDefenseState(summary, 'user-1', false, null);
      expect(state.canFreeze).toBe(false);
      expect(state.hasFrozenToday).toBe(true);
    });

    it('escalates risk level based on hours remaining', () => {
      const deadlineSoon = Date.now() + 3600000; // 1 hour
      const summary: StreakSummary = {
        currentDays: 5,
        shieldAvailable: true,
        nextDeadline: deadlineSoon,
        isAtRisk: true,
        riskLevel: 'NONE',
      };
      const state = buildStreakDefenseState(summary, 'user-1', false, null);
      expect(state.riskLevel).toBe('CRITICAL');
    });

    it('passes through loading and error state', () => {
      const state = buildStreakDefenseState(null, null, true, new Error('fail'));
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeInstanceOf(Error);
    });
  });
});
