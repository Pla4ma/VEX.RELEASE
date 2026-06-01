/**
 * Liveops Config Feature — resolveFeatureVisibility Tests
 */

import { resolveFeatureVisibility } from '../feature-resolution';
import type { MotivationProfile } from '../feature-access-types';

describe('resolveFeatureVisibility', () => {
  it('returns false when base is not visible', () => {
    expect(resolveFeatureVisibility('boss_tab', false, undefined, 0)).toBe(false);
  });

  it('returns base visibility when no profile', () => {
    expect(resolveFeatureVisibility('boss_tab', true, undefined, 10)).toBe(true);
  });

  it('returns base visibility for unrestricted profile', () => {
    const profile: MotivationProfile = { primary: 'game_like', secondary: [] };
    expect(resolveFeatureVisibility('boss_tab', true, profile, 10)).toBe(true);
  });

  it('hides feature for restricted profile when restrictVisibility set', () => {
    const profile: MotivationProfile = { primary: 'calm', secondary: [] };
    // boss_tab: restrict: ["calm"], restrictVisibility: true, restrictVisibilityMin: 20
    expect(resolveFeatureVisibility('boss_tab', true, profile, 5)).toBe(false);
  });

  it('shows feature for restricted profile above restrictVisibilityMin', () => {
    const profile: MotivationProfile = { primary: 'calm', secondary: [] };
    expect(resolveFeatureVisibility('boss_tab', true, profile, 25)).toBe(true);
  });
});
