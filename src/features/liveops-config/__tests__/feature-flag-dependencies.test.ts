import {
  resolveEffectiveThreshold,
  resolveFeatureVisibility,
  checkDependenciesSatisfied,
} from '../feature-flag-resolution';
import type { MotivationProfileConfig } from '../feature-flag-resolution';

describe('feature-flag-dependencies', () => {
  const deps: Partial<Record<string, string[]>> = {
    boss_tab: ['focus_session', 'progress_view'],
    challenges: ['focus_session'],
  };

  it('returns true when feature has no dependencies', () => {
    expect(checkDependenciesSatisfied('focus_session', new Set(), deps)).toBe(true);
  });

  it('returns true when all dependencies are unlocked', () => {
    expect(
      checkDependenciesSatisfied('boss_tab', new Set(['focus_session', 'progress_view']), deps),
    ).toBe(true);
  });

  it('returns false when some dependencies are missing', () => {
    expect(
      checkDependenciesSatisfied('boss_tab', new Set(['focus_session']), deps),
    ).toBe(false);
  });

  it('returns false when no dependencies are unlocked', () => {
    expect(checkDependenciesSatisfied('boss_tab', new Set(), deps)).toBe(false);
  });

  it('returns true for single satisfied dependency', () => {
    expect(
      checkDependenciesSatisfied('challenges', new Set(['focus_session']), deps),
    ).toBe(true);
  });
});