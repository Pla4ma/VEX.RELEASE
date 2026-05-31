/**
 * Deep Onboarding Tests — store-helpers
 */

import {
  deriveMotivationProfile,
  isCompletionValidForUser,
  mergeOnboardingCompletion,
} from '../store-helpers';

// ============================================================================
// store-helpers: deriveMotivationProfile
// ============================================================================

describe('store-helpers: deriveMotivationProfile', () => {
  it('returns explicit style when provided', () => {
    const profile = deriveMotivationProfile('WORK', 'mentor', 'FLAME', 'intense');
    expect(profile.primary).toBe('intense');
    expect(profile.secondary).toEqual([]);
  });

  it('maps STUDY goal to study_focused primary', () => {
    const profile = deriveMotivationProfile('STUDY', null, null, null);
    expect(profile.primary).toBe('study_focused');
  });

  it('maps WORK goal to worker primary', () => {
    const profile = deriveMotivationProfile('WORK', null, null, null);
    expect(profile.primary).toBe('worker');
  });

  it('maps CREATIVE goal to creator primary', () => {
    const profile = deriveMotivationProfile('CREATIVE', null, null, null);
    expect(profile.primary).toBe('creator');
  });

  it('defaults to calm when no goal provided', () => {
    const profile = deriveMotivationProfile(null, null, null, null);
    expect(profile.primary).toBe('calm');
  });

  it('drill-sergeant persona adds intense to secondary', () => {
    const profile = deriveMotivationProfile('WORK', 'drill-sergeant', null, null);
    expect(profile.secondary).toContain('intense');
  });

  it('cheerleader persona adds friendly to secondary', () => {
    const profile = deriveMotivationProfile('WORK', 'cheerleader', null, null);
    expect(profile.secondary).toContain('friendly');
  });

  it('mentor persona adds coach_led to secondary', () => {
    const profile = deriveMotivationProfile('WORK', 'mentor', null, null);
    expect(profile.secondary).toContain('coach_led');
  });

  it('FLAME element adds game_like and intense', () => {
    const profile = deriveMotivationProfile('WORK', null, 'FLAME', null);
    expect(profile.secondary).toContain('game_like');
    expect(profile.secondary).toContain('intense');
  });

  it('WAVE element adds calm', () => {
    const profile = deriveMotivationProfile('WORK', null, 'WAVE', null);
    expect(profile.secondary).toContain('calm');
  });

  it('TERRA element adds worker', () => {
    const profile = deriveMotivationProfile('WORK', null, 'TERRA', null);
    expect(profile.secondary).toContain('worker');
  });

  it('ZEPHYR element adds friendly', () => {
    const profile = deriveMotivationProfile('WORK', null, 'ZEPHYR', null);
    expect(profile.secondary).toContain('friendly');
  });

  it('VOID element adds intense and competitive', () => {
    const profile = deriveMotivationProfile('WORK', null, 'VOID', null);
    expect(profile.secondary).toContain('intense');
    expect(profile.secondary).toContain('competitive');
  });

  it('LUMINA element adds study_focused', () => {
    const profile = deriveMotivationProfile('WORK', null, 'LUMINA', null);
    expect(profile.secondary).toContain('study_focused');
  });

  it('null persona defaults to mentor', () => {
    const profile = deriveMotivationProfile('WORK', null, null, null);
    expect(profile.secondary).toContain('coach_led');
  });

  it('null element defaults to LUMINA', () => {
    const profile = deriveMotivationProfile('WORK', null, null, null);
    expect(profile.secondary).toContain('study_focused');
  });
});

// ============================================================================
// store-helpers: isCompletionValidForUser
// ============================================================================

describe('store-helpers: isCompletionValidForUser', () => {
  it('returns false when userId is null', () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: true, completedAt: Date.now(), completedForUserId: 'u1' },
        null,
      ),
    ).toBe(false);
  });

  it('returns false when not onboarded', () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: false, completedAt: null, completedForUserId: null },
        'u1',
      ),
    ).toBe(false);
  });

  it('returns true when completion matches user', () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: true, completedAt: Date.now(), completedForUserId: 'u1' },
        'u1',
      ),
    ).toBe(true);
  });

  it('returns false when completion is for different user', () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: true, completedAt: Date.now(), completedForUserId: 'u1' },
        'u2',
      ),
    ).toBe(false);
  });
});

// ============================================================================
// store-helpers: mergeOnboardingCompletion
// ============================================================================

describe('store-helpers: mergeOnboardingCompletion', () => {
  it('sets completedForUserId to null when not onboarded', () => {
    const result = mergeOnboardingCompletion(false, null);
    expect(result.isOnboarded).toBe(false);
    expect(result.completedForUserId).toBeNull();
  });

  it('preserves isOnboarded and completedAt values', () => {
    const now = Date.now();
    const result = mergeOnboardingCompletion(true, now);
    expect(result.isOnboarded).toBe(true);
    expect(result.completedAt).toBe(now);
  });
});
