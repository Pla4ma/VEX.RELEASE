/**
 * Liveops Config Feature — resolveEffectiveThreshold Tests
 */

import { resolveEffectiveThreshold } from '../feature-resolution';
import type { MotivationProfile } from '../feature-access-types';

describe('resolveEffectiveThreshold', () => {
  it('returns base threshold when no profile', () => {
    expect(resolveEffectiveThreshold('challenges', 5, undefined)).toBe(5);
  });

  it('reduces threshold for accelerated primary profile', () => {
    const profile: MotivationProfile = { primary: 'game_like', secondary: [] };
    // challenges: accelerate: ["game_like", "intense", "competitive"], accelerateOffset: 2
    expect(resolveEffectiveThreshold('challenges', 5, profile)).toBe(3);
  });

  it('increases threshold for restricted primary profile', () => {
    const profile: MotivationProfile = { primary: 'calm', secondary: [] };
    // challenges: restrict: ["calm"], restrictOffset: 5
    expect(resolveEffectiveThreshold('challenges', 5, profile)).toBe(10);
  });

  it('accelerates for matching secondary profile', () => {
    const profile: MotivationProfile = { primary: 'worker', secondary: ['game_like'] };
    // challenges: accelerate includes "game_like", so secondary match
    expect(resolveEffectiveThreshold('challenges', 5, profile)).toBe(3);
  });

  it('does not go below 0', () => {
    const profile: MotivationProfile = { primary: 'game_like', secondary: [] };
    // companion_detail: accelerateOffset: 1, threshold 3 → 2
    expect(resolveEffectiveThreshold('companion_detail', 1, profile)).toBeGreaterThanOrEqual(0);
  });

  it('returns base threshold for features without motivation config', () => {
    const profile: MotivationProfile = { primary: 'game_like', secondary: [] };
    // focus_session has no motivation config
    expect(resolveEffectiveThreshold('focus_session', 0, profile)).toBe(0);
  });
});
