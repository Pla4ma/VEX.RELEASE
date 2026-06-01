/**
 * Liveops Config Feature — checkDependenciesSatisfied Tests
 */

import { checkDependenciesSatisfied } from '../feature-resolution';
import type { FeatureKey } from '../feature-access-types';

describe('checkDependenciesSatisfied', () => {
  it('returns true when no dependencies', () => {
    expect(checkDependenciesSatisfied('focus_session', new Set())).toBe(true);
  });

  it('returns true when all dependencies met', () => {
    const unlocked = new Set<FeatureKey>(['focus_session', 'progress_view']);
    expect(checkDependenciesSatisfied('boss_tab', unlocked)).toBe(true);
  });

  it('returns false when dependencies not met', () => {
    const unlocked = new Set<FeatureKey>(['focus_session']);
    expect(checkDependenciesSatisfied('boss_tab', unlocked)).toBe(false);
  });

  it('returns false when empty set for feature with deps', () => {
    expect(checkDependenciesSatisfied('boss_tab', new Set())).toBe(false);
  });
});
