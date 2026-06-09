import { createUnlockDecision, isFeatureVisible } from '../service';
import type {} from '../types';

describe('Unlock Explainer', () => {
  const NOW = 1_764_000_000_000;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('createUnlockDecision', () => {
    it('hides never-unlock features (shop, wagers, battle_pass)', () => {
      for (const key of [
        'shop',
        'inventory',
        'wagers',
        'battle_pass',
        'premium_currency',
        'streak_insurance',
      ]) {
        const result = createUnlockDecision({
          featureKey: key,
          sessionCount: 10,
        });
        expect(result.decision).toBe('hidden');
        expect(isFeatureVisible(result)).toBe(false);
      }
    });

    it('unlocks core features on Day 0', () => {
      const result = createUnlockDecision({
        featureKey: 'focus_session',
        sessionCount: 0,
      });
      expect(result.decision).toBe('unlocked');
      expect(result.reasonCode).toBe('day_zero_core');
    });

    it('teases non-core features on Day 0', () => {
      const result = createUnlockDecision({
        featureKey: 'study_os',
        sessionCount: 0,
      });
      expect(result.decision).toBe('teased');
      expect(result.canReconsiderAtSessionCount).toBe(1);
    });

    it('respects manual overrides', () => {
      const result = createUnlockDecision({
        featureKey: 'boss_tab',
        sessionCount: 0,
        manualOverride: 'unlocked',
      });
      expect(result.decision).toBe('unlocked');
      expect(result.reasonCode).toBe('manual_override');
    });

    it('blocks features when lane fit is blocked (run_board for minimal)', () => {
      const result = createUnlockDecision({
        featureKey: 'run_board',
        laneProfile: 'minimal_normal',
        sessionCount: 5,
      });
      expect(result.decision).toBe('blocked');
      expect(result.laneFit).toBe('blocked');
    });

    it('unlocks strong lane features faster (study_os for student after 1 session)', () => {
      const result = createUnlockDecision({
        featureKey: 'study_os',
        laneProfile: 'student',
        sessionCount: 1,
      });
      expect(result.decision).toBe('unlocked');
      expect(result.laneFit).toBe('strong');
    });

    it('teases study_os for game_like lane with weak fit', () => {
      const result = createUnlockDecision({
        featureKey: 'study_os',
        laneProfile: 'game_like',
        sessionCount: 3,
      });
      expect(result.laneFit).toBe('weak');
      expect(result.canReconsiderAtSessionCount).toBe(5);
    });

    it('returns medium lane fit for unknown features', () => {
      const result = createUnlockDecision({
        featureKey: 'unknown_feature_xyz',
        laneProfile: 'student',
        sessionCount: 5,
      });
      expect(result.laneFit).toBe('medium');
      expect(result.decision).toBe('unlocked');
    });

    it('falls back to weak fit when no lane provided', () => {
      const result = createUnlockDecision({
        featureKey: 'study_os',
        sessionCount: 5,
      });
      expect(result.laneFit).toBe('weak');
    });

    it('reconsiders blocked features after 3 more sessions', () => {
      const result = createUnlockDecision({
        featureKey: 'boss_tab',
        laneProfile: 'minimal_normal',
        sessionCount: 0,
      });
      expect(result.decision).toBe('blocked');
      expect(result.canReconsiderAtSessionCount).toBe(3);
    });
  });

  describe('isFeatureVisible', () => {
    it('returns false for hidden', () => {
      const decision = createUnlockDecision({
        featureKey: 'shop',
        sessionCount: 100,
      });
      expect(isFeatureVisible(decision)).toBe(false);
    });

    it('returns true for teased', () => {
      const decision = createUnlockDecision({
        featureKey: 'study_os',
        sessionCount: 0,
      });
      expect(isFeatureVisible(decision)).toBe(true);
    });

    it('returns true for unlocked', () => {
      const decision = createUnlockDecision({
        featureKey: 'focus_session',
        sessionCount: 0,
      });
      expect(isFeatureVisible(decision)).toBe(true);
    });

    it('returns true for blocked (shows fallback UX)', () => {
      const decision = createUnlockDecision({
        featureKey: 'run_board',
        laneProfile: 'minimal_normal',
        sessionCount: 5,
      });
      expect(isFeatureVisible(decision)).toBe(true);
    });
  });
});
