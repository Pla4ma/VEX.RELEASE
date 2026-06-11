import {
  resolveEffectiveThreshold,
  resolveFeatureVisibility,
} from '../feature-flag-resolution';
import type { MotivationProfileConfig } from '../feature-flag-resolution';

describe('feature-flag-resolution', () => {
  describe('resolveEffectiveThreshold', () => {
    const baseProfiles: Partial<Record<string, MotivationProfileConfig>> = {
      boss_tab: {
        accelerate: ['game_like', 'competitive'],
        accelerateOffset: 2,
        restrict: ['calm', 'study_focused'],
        restrictOffset: 3,
      },
      challenges: {
        accelerate: ['worker'],
        accelerateOffset: 1,
        restrict: ['student'],
        restrictOffset: 2,
        restrictVisibility: true,
        restrictVisibilityMin: 5,
      },
    };

    it('returns base threshold when no profile matches', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        undefined,
        baseProfiles,
      );
      expect(result).toBe(7);
    });

    it('returns base threshold when feature has no config', () => {
      const result = resolveEffectiveThreshold(
        'unknown_feature' as any,
        10,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(10);
    });

    it('accelerates for matching primary profile', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(5);
    });

    it('restricts for matching primary profile', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        { primary: 'calm', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(10);
    });

    it('accelerates for matching secondary profile', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        7,
        { primary: 'friendly', secondary: ['competitive'] },
        baseProfiles,
      );
      expect(result).toBe(5);
    });

    it('does not go below 0 when accelerating', () => {
      const result = resolveEffectiveThreshold(
        'boss_tab',
        1,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(0);
    });

    it('handles restrictVisibility with min sessions', () => {
      const result = resolveEffectiveThreshold(
        'challenges',
        5,
        { primary: 'student', secondary: [] },
        baseProfiles,
      );
      expect(result).toBe(7);
    });
  });

  describe('resolveFeatureVisibility', () => {
    const baseProfiles: Partial<Record<string, MotivationProfileConfig>> = {
      boss_tab: {
        accelerate: [],
        accelerateOffset: 0,
        restrict: ['calm'],
        restrictOffset: 0,
        restrictVisibility: true,
        restrictVisibilityMin: 5,
      },
      challenges: {
        accelerate: [],
        accelerateOffset: 0,
        restrict: ['student'],
        restrictOffset: 0,
      },
    };

    it('returns false when baseVisible is false', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        false,
        undefined,
        baseProfiles,
        10,
      );
      expect(result).toBe(false);
    });

    it('returns true when no profile matches', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        undefined,
        baseProfiles,
        10,
      );
      expect(result).toBe(true);
    });

    it('returns true for non-restricted profile', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'game_like', secondary: [] },
        baseProfiles,
        10,
      );
      expect(result).toBe(true);
    });

    it('returns false for restricted profile below min sessions', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'calm', secondary: [] },
        3,
        baseProfiles,
      );
      expect(result).toBe(false);
    });

    it('returns true for restricted profile at min sessions', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'calm', secondary: [] },
        5,
        baseProfiles,
      );
      expect(result).toBe(true);
    });

    it('returns true for restricted profile above min sessions', () => {
      const result = resolveFeatureVisibility(
        'boss_tab',
        true,
        { primary: 'calm', secondary: [] },
        10,
        baseProfiles,
      );
      expect(result).toBe(true);
    });

    it('returns true when restrictVisibility is not set', () => {
      const result = resolveFeatureVisibility(
        'challenges',
        true,
        { primary: 'student', secondary: [] },
        baseProfiles,
        1,
      );
      expect(result).toBe(true);
    });
  });
});
describe('feature-flag-dependencies', () => {
  const { checkDependenciesSatisfied } = require('../feature-flag-resolution');

  const deps = {
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