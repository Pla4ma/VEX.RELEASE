import {
  resolveFeatureVisibility,
} from '../feature-flag-resolution';
import type { MotivationProfileConfig } from '../feature-flag-resolution';

describe('feature-flag-visibility', () => {
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