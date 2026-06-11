import {
  resolveEffectiveThreshold,
} from '../feature-flag-resolution';
import type { MotivationProfileConfig } from '../feature-flag-resolution';

describe('feature-flag-threshold', () => {
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