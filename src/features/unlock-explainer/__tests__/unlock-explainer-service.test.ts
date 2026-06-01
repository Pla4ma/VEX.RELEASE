/**
 * Unlock Explainer — Service Tests (visibility + copy)
 */

import { createUnlockDecision } from '../unlock-decision';
import { getUnlockExplainerCopy, isFeatureVisible } from '../service';

// ─── Fake timers for consistent Date.now() ───────────────────────

const NOW = 1_764_000_000_000;

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterAll(() => {
  jest.useRealTimers();
});

// ─── isFeatureVisible ────────────────────────────────────────────

describe('isFeatureVisible', () => {
  it('returns false for hidden decisions', () => {
    const hidden = createUnlockDecision({ featureKey: 'shop', sessionCount: 10 });
    expect(isFeatureVisible(hidden)).toBe(false);
  });

  it('returns true for unlocked decisions', () => {
    const unlocked = createUnlockDecision({
      featureKey: 'focus_session',
      sessionCount: 0,
    });
    expect(isFeatureVisible(unlocked)).toBe(true);
  });

  it('returns true for teased decisions', () => {
    const teased = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 0,
    });
    expect(isFeatureVisible(teased)).toBe(true);
  });

  it('returns true for blocked decisions', () => {
    const blocked = createUnlockDecision({
      featureKey: 'run_board',
      laneProfile: 'minimal_normal',
      sessionCount: 5,
    });
    expect(isFeatureVisible(blocked)).toBe(true);
  });
});

// ─── getUnlockExplainerCopy ──────────────────────────────────────

describe('getUnlockExplainerCopy', () => {
  it('returns unlocked title for unlocked decisions', () => {
    const decision = createUnlockDecision({
      featureKey: 'focus_session',
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.title).toContain('unlocked');
    expect(copy.body).toBeTruthy();
  });

  it("returns 'coming soon' for teased decisions", () => {
    const decision = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.title).toContain('coming soon');
  });

  it("returns 'unavailable' for blocked decisions", () => {
    const decision = createUnlockDecision({
      featureKey: 'run_board',
      laneProfile: 'minimal_normal',
      sessionCount: 5,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.title).toContain('unavailable');
  });

  it("includes CTA 'Got it' when canHide is true", () => {
    const decision = createUnlockDecision({
      featureKey: 'study_os',
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.cta).toBe('Got it');
  });

  it('CTA is null when canHide is false', () => {
    const decision = createUnlockDecision({
      featureKey: 'focus_session',
      sessionCount: 0,
    });
    const copy = getUnlockExplainerCopy(decision);
    expect(copy.cta).toBeNull();
  });
});
