/**
 * Unlock Explainer — Unlock Decision Tests
 */

import { createUnlockDecision } from '../unlock-decision';
import { NEVER_UNLOCK } from '../lane-fit';

// ─── Fake timers for consistent Date.now() ───────────────────────

const NOW = 1_764_000_000_000;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

// ─── createUnlockDecision ────────────────────────────────────────

describe('createUnlockDecision', () => {
  it('hides never-unlock features', () => {
    for (const key of NEVER_UNLOCK) {
      const result = createUnlockDecision({ featureKey: key, sessionCount: 10 });
      expect(result.decision).toBe('hidden');
      expect(result.reasonCode).toBe('final_release_deactivated');
    }
  });

  it('unlocks core features on Day 0', () => {
    for (const key of ['focus_session', 'home_tab', 'profile_tab', 'focus_tab']) {
      const result = createUnlockDecision({ featureKey: key, sessionCount: 0 });
      expect(result.decision).toBe('unlocked');
      expect(result.reasonCode).toBe('day_zero_core');
    }
  });

  it('teases non-core features on Day 0', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 0,
    });
    expect(result.decision).toBe('teased');
    expect(result.reasonCode).toBe('day_zero_tease');
  });

  it('Day 0 non-core features can hide and reconsider at session 1', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 0,
    });
    expect(result.canHide).toBe(true);
    expect(result.canReconsiderAtSessionCount).toBe(1);
  });

  it('Day 0 core features cannot hide', () => {
    const result = createUnlockDecision({
      featureKey: 'focus_session',
      sessionCount: 0,
    });
    expect(result.canHide).toBe(false);
    expect(result.canReconsiderAtSessionCount).toBeNull();
  });

  it('blocks features when lane fit is blocked', () => {
    const result = createUnlockDecision({
      featureKey: 'run_board',
      laneProfile: 'minimal_normal',
      sessionCount: 5,
    });
    expect(result.decision).toBe('blocked');
    expect(result.laneFit).toBe('blocked');
    expect(result.canHide).toBe(false);
  });

  it('blocked features reconsider after currentSession + 3', () => {
    const result = createUnlockDecision({
      featureKey: 'boss_tab',
      laneProfile: 'minimal_normal',
      sessionCount: 2,
    });
    expect(result.canReconsiderAtSessionCount).toBe(5);
  });

  it('unlocks strong lane features after 1 session', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      laneProfile: 'student',
      sessionCount: 1,
    });
    expect(result.decision).toBe('unlocked');
    expect(result.laneFit).toBe('strong');
    expect(result.reasonCode).toBe('unlocked_after_sessions');
  });

  it('teases medium-fit features before threshold', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      laneProfile: 'deep_creative',
      sessionCount: 1,
    });
    expect(result.decision).toBe('teased');
    expect(result.laneFit).toBe('medium');
    expect(result.canReconsiderAtSessionCount).toBe(3);
  });

  it('respects manual override', () => {
    const result = createUnlockDecision({
      featureKey: 'boss_tab',
      sessionCount: 0,
      manualOverride: 'unlocked',
    });
    expect(result.decision).toBe('unlocked');
    expect(result.reasonCode).toBe('manual_override');
  });

  it('manual override hidden makes canHide false', () => {
    const result = createUnlockDecision({
      featureKey: 'boss_tab',
      sessionCount: 0,
      manualOverride: 'hidden',
    });
    expect(result.decision).toBe('hidden');
    expect(result.canHide).toBe(false);
  });

  it('returns weak fit when no lane provided', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 5,
    });
    expect(result.laneFit).toBe('weak');
  });

  it('returns medium fit for unknown features', () => {
    const result = createUnlockDecision({
      featureKey: 'unknown_feature_xyz',
      laneProfile: 'student',
      sessionCount: 5,
    });
    expect(result.laneFit).toBe('medium');
    expect(result.decision).toBe('unlocked');
  });

  it('always includes at least one evidence entry', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 5,
    });
    expect(result.evidence.length).toBeGreaterThanOrEqual(1);
  });

  it('evidence has required fields', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 5,
    });
    for (const e of result.evidence) {
      expect(e).toHaveProperty('source');
      expect(e).toHaveProperty('detail');
      expect(e).toHaveProperty('observedAt');
      expect(typeof e.detail).toBe('string');
      expect(e.detail.length).toBeGreaterThan(0);
    }
  });
});
