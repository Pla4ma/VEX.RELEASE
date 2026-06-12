/**
 * LiveOps Config — Feature Flag Dependency Tests
 *
 * Tests for checkDependenciesSatisfied.
 */

import { checkDependenciesSatisfied } from '../feature-flag-resolution';
import type { FeatureKey } from '../feature-access-types';

type PartialFeatureDeps = Partial<Record<FeatureKey, FeatureKey[]>>;

describe('checkDependenciesSatisfied', () => {
  it('returns true when feature has empty deps', () => {
    const deps: PartialFeatureDeps = { boss_tab: [] };
    expect(checkDependenciesSatisfied('boss_tab' as FeatureKey, new Set(), deps)).toBe(true);
  });

  it('returns true when all deps unlocked', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab' as FeatureKey, 'challenges' as FeatureKey]);
    const deps: PartialFeatureDeps = { weekly_report: ['boss_tab', 'challenges'] };
    expect(checkDependenciesSatisfied('weekly_report' as FeatureKey, unlocked, deps)).toBe(true);
  });

  it('returns false when some deps missing', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab' as FeatureKey]);
    const deps: PartialFeatureDeps = { weekly_report: ['boss_tab', 'challenges'] };
    expect(checkDependenciesSatisfied('weekly_report' as FeatureKey, unlocked, deps)).toBe(false);
  });

  it('returns false when no deps unlocked', () => {
    const unlocked = new Set<FeatureKey>();
    const deps: PartialFeatureDeps = { analytics: ['boss_tab', 'challenges'] };
    expect(checkDependenciesSatisfied('analytics' as FeatureKey, unlocked, deps)).toBe(false);
  });

  it('returns true when feature not in deps map', () => {
    const deps = {} as PartialFeatureDeps;
    expect(checkDependenciesSatisfied('boss_tab' as FeatureKey, new Set(), deps)).toBe(true);
  });

  it('returns true when deps entry is undefined', () => {
    const deps: PartialFeatureDeps = { focus_mode: undefined };
    expect(checkDependenciesSatisfied('focus_mode' as FeatureKey, new Set(), deps)).toBe(true);
  });

  it('returns true for single dep satisfied', () => {
    const unlocked = new Set<FeatureKey>(['challenges' as FeatureKey]);
    const deps: PartialFeatureDeps = { analytics: ['challenges'] };
    expect(checkDependenciesSatisfied('analytics' as FeatureKey, unlocked, deps)).toBe(true);
  });

  it('returns false for single dep missing', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab' as FeatureKey]);
    const deps: PartialFeatureDeps = { analytics: ['challenges'] };
    expect(checkDependenciesSatisfied('analytics' as FeatureKey, unlocked, deps)).toBe(false);
  });

  it('returns true for large chain all satisfied', () => {
    const unlocked = new Set<FeatureKey>([
      'boss_tab', 'challenges', 'weekly_report', 'analytics',
    ] as FeatureKey[]);
    const deps: PartialFeatureDeps = {
      focus_mode: ['boss_tab', 'challenges', 'weekly_report', 'analytics'],
    };
    expect(checkDependenciesSatisfied('focus_mode' as FeatureKey, unlocked, deps)).toBe(true);
  });
});
