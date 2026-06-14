import {
  computeCompositeScore,
  getEffectiveThreshold,
  checkFeatureUnlock,
  createSignal,
  DEFAULT_WEIGHTS,
  FEATURE_SCORE_THRESHOLDS,
} from '../service';
import type { UnlockSignal } from '../types';

describe('unlock-system service', () => {
  describe('computeCompositeScore', () => {
    it('returns zero for empty signals', () => {
      const score = computeCompositeScore([]);
      expect(score.total).toBe(0);
      expect(score.signalsUsed).toBe(0);
      expect(score.sessionScore).toBe(0);
      expect(score.planScore).toBe(0);
    });

    it('calculates weighted scores correctly', () => {
      const signals: UnlockSignal[] = [
        createSignal('session_completed', 2),    // 2 * 1.0 = 2
        createSignal('plan_item_created', 3),    // 3 * 0.4 = 1.2
        createSignal('plan_item_completed', 2),  // 2 * 0.6 = 1.2
        createSignal('capture_created', 5),      // 5 * 0.3 = 1.5
      ];
      const score = computeCompositeScore(signals);

      expect(score.sessionScore).toBe(2);
      expect(score.planScore).toBeCloseTo(2.4, 1);
      expect(score.captureScore).toBe(1.5);
      expect(score.total).toBeCloseTo(5.9, 1);
      expect(score.signalsUsed).toBe(4);
    });

    it('groups signals by type', () => {
      const signals: UnlockSignal[] = [
        createSignal('session_completed', 1),
        createSignal('session_completed', 2),
      ];
      const score = computeCompositeScore(signals);
      expect(score.sessionScore).toBe(3);
      expect(score.signalsUsed).toBe(2);
    });
  });

  describe('getEffectiveThreshold', () => {
    it('returns base threshold for unknown features', () => {
      expect(getEffectiveThreshold('unknown_feature', null)).toBe(10);
    });

    it('returns base threshold when no lane', () => {
      expect(getEffectiveThreshold('focus_run', null)).toBe(4);
      expect(getEffectiveThreshold('study_intelligence', null)).toBe(3);
    });

    it('returns lane-specific threshold when available', () => {
      expect(getEffectiveThreshold('study_intelligence', 'student')).toBe(2);
      expect(getEffectiveThreshold('content_study', 'student')).toBe(6);
      expect(getEffectiveThreshold('boss_tab', 'game_like')).toBe(5);
      expect(getEffectiveThreshold('challenges', 'game_like')).toBe(3);
      expect(getEffectiveThreshold('project_thread', 'deep_creative')).toBe(3);
      expect(getEffectiveThreshold('clean_today_strip', 'minimal_normal')).toBe(1);
    });

    it('falls back to base when lane has no override', () => {
      expect(getEffectiveThreshold('focus_run', 'game_like')).toBe(4);
    });
  });

  describe('checkFeatureUnlock', () => {
    const mockScore = { total: 5, sessionScore: 2, planScore: 1, captureScore: 1, coachScore: 1, streakScore: 0, signalsUsed: 4 };

    it('unlocks when score meets threshold', () => {
      const result = checkFeatureUnlock('focus_run', mockScore, null);
      expect(result.unlocked).toBe(true);
      expect(result.requiredScore).toBe(4);
      expect(result.currentScore).toBe(5);
      expect(result.remainingScore).toBe(0);
    });

    it('locks when score below threshold', () => {
      const lowScore = { ...mockScore, total: 2 };
      const result = checkFeatureUnlock('focus_run', lowScore, null);
      expect(result.unlocked).toBe(false);
      expect(result.requiredScore).toBe(4);
      expect(result.currentScore).toBe(2);
      expect(result.remainingScore).toBe(2);
      expect(result.progress).toBe(50); // 2/4 * 100
    });

    it('calculates progress correctly', () => {
      const score = { ...mockScore, total: 3 };
      const result = checkFeatureUnlock('focus_run', score, null);
      expect(result.progress).toBe(75); // 3/4 * 100 = 75
    });

    it('caps progress at 100', () => {
      const score = { ...mockScore, total: 10 };
      const result = checkFeatureUnlock('focus_run', score, null);
      expect(result.progress).toBe(100);
    });

    it('sets teaser when between teaser threshold and required', () => {
      // challenges: teaser=4, required=5
      const score = { ...mockScore, total: 4 };
      const result = checkFeatureUnlock('challenges', score, null);
      expect(result.teaser).toBe(true);
    });

    it('no teaser when below teaser threshold', () => {
      const score = { ...mockScore, total: 3 };
      const result = checkFeatureUnlock('challenges', score, null);
      expect(result.teaser).toBe(false);
    });

    it('no teaser when unlocked', () => {
      const score = { ...mockScore, total: 5 };
      const result = checkFeatureUnlock('challenges', score, null);
      expect(result.unlocked).toBe(true);
      expect(result.teaser).toBe(false);
    });

    it('uses lane-specific thresholds', () => {
      const score = { ...mockScore, total: 2 };
      // student lane: study_intelligence threshold = 2
      const result = checkFeatureUnlock('study_intelligence', score, 'student');
      expect(result.unlocked).toBe(true);
    });
  });

  describe('createSignal', () => {
    it('creates signal with correct weight', () => {
      const signal = createSignal('session_completed', 2);
      expect(signal.type).toBe('session_completed');
      expect(signal.value).toBe(2);
      expect(signal.weight).toBe(1.0);
      expect(signal.timestamp).toBeDefined();
    });

    it('uses default weight for unknown type', () => {
      const signal = createSignal('invalid_type' as never, 1);
      expect(signal.weight).toBe(0.5);
    });

    it('accepts custom timestamp', () => {
      const signal = createSignal('coach_interaction', 1, '2026-06-14T10:00:00.000Z');
      expect(signal.timestamp).toBe('2026-06-14T10:00:00.000Z');
    });
  });
});