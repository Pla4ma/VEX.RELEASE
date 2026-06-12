/**
 * LiveOps Config — Feature Flag Dependency Tests
 *
 * Tests for checkDependenciesSatisfied.
 */

import { checkDependenciesSatisfied } from '../feature-flag-resolution';
import type { FeatureKey } from '../feature-access-types';

describe('checkDependenciesSatisfied', () => {
  const FeatureKeys = [
    'boss_tab',
    'challenges',
    'weekly_report',
    'analytics',
    'focus_mode',
  ] as const;

  it('should return true when feature has no dependencies', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      boss_tab: [],
    };
    expect(checkDependenciesSatisfied('boss_tab' as FeatureKey, unlocked, dependencies)).toBe(true);
  });

  it('should return true when all dependencies are unlocked', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab', 'challenges']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      weekly_report: ['boss_tab', 'challenges'],
    };
    expect(checkDependenciesSatisfied('weekly_report' as FeatureKey, unlocked, dependencies)).toBe(true);
  });

  it('should return false when some dependencies are missing', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      weekly_report: ['boss_tab', 'challenges'],
    };
    expect(checkDependenciesSatisfied('weekly_report' as FeatureKey, unlocked, dependencies)).toBe(false);
  });

  it('should return false when no dependencies are unlocked', () => {
    const unlocked = new Set<FeatureKey>();
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      analytics: ['boss_tab', 'challenges'],
    };
    expect(checkDependenciesSatisfied('analytics' as FeatureKey, unlocked, dependencies)).toBe(false);
  });

  it('should return true when dependency key is not in dependencies map', () => {
    const unlocked = new Set<FeatureKey>();
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {};
    expect(checkDependenciesSatisfied('boss_tab' as FeatureKey, unlocked, dependencies)).toBe(true);
  });

  it('should return true when deps list is undefined', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      focus_mode: undefined,
    };
    expect(checkDependenciesSatisfied('focus_mode' as FeatureKey, unlocked, dependencies)).toBe(true);
  });

  it('should handle single dependency satisfied', () => {
    const unlocked = new Set<FeatureKey>(['challenges']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      analytics: ['challenges'],
    };
    expect(checkDependenciesSatisfied('analytics' as FeatureKey, unlocked, dependencies)).toBe(true);
  });

  it('should handle single dependency missing', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      analytics: ['challenges'],
    };
    expect(checkDependenciesSatisfied('analytics' as FeatureKey, unlocked, dependencies)).toBe(false);
  });

  it('should handle large dependency chain with all satisfied', () => {
    const unlocked = new Set<FeatureKey>(['boss_tab', 'challenges', 'weekly_report', 'analytics']);
    const dependencies: Partial<Record<FeatureKey, FeatureKey[]>> = {
      focus_mode: ['boss_tab', 'challenges', 'weekly_report', 'analytics'],
    };
    expect(checkDependenciesSatisfied('focus_mode' as FeatureKey, unlocked, dependencies)).toBe(true);
  });
});
