import type { FeatureAccess } from '../feature-access';
import {
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  shouldBlockFullSurface,
} from '../feature-availability';

function access(overrides: Partial<FeatureAccess> = {}): FeatureAccess {
  return {
    isUnlocked: true,
    isVisible: true,
    lockedDescription: '',
    recommendedUnlockMoment: '',
    unlockReason: 'Unlocked',
    releaseState: 'final_release_progressive',
    ...overrides,
  };
}

describe('FeatureAvailability health contract', () => {
  it('generic degraded feature blocks navigation', () => {
    const availability = getFeatureAvailability(access({
      isDegraded: true,
      lockedDescription: 'Degraded due to health check',
      unlockReason: 'Feature is available but running in limited mode',
    }));

    expect(isFeatureAvailableForNavigation(availability)).toBe(false);
    expect(availability.canNavigate).toBe(false);
    expect(availability.state).toBe('degraded');
  });

  it('healthy feature allows navigation', () => {
    const availability = getFeatureAvailability(access());

    expect(isFeatureAvailableForNavigation(availability)).toBe(true);
    expect(availability.state).toBe('unlocked');
  });

  it('getDegradedBlockedSurfaces returns correct surfaces', () => {
    const blocked = getDegradedBlockedSurfaces(['content_study', 'premium_paywall']);

    expect(blocked).toContain('study_layer');
    expect(blocked).toContain('upload_cta');
    expect(blocked).toContain('premium_tease');
    expect(blocked).toContain('purchasable_plan');
  });

  it('shouldBlockFullSurface returns true for degraded features', () => {
    expect(shouldBlockFullSurface('content_study', true)).toBe(true);
    expect(shouldBlockFullSurface('content_study', false)).toBe(false);
  });

  it('getDegradedFallbackSurface returns correct fallback', () => {
    expect(getDegradedFallbackSurface('content_study')).toBe('start_session');
    expect(getDegradedFallbackSurface('ai_coach_advanced')).toBe('coach_presence');
    expect(getDegradedFallbackSurface('premium_paywall')).toBe('start_session');
    expect(getDegradedFallbackSurface('boss_tab')).toBe('boss_teaser');
  });

  it('degraded premium returns disabled state', () => {
    const availability = getFeatureAvailabilityFor('premium_paywall', access({
      isDegraded: true,
      lockedDescription: 'Premium stays hidden until live subscriptions are ready.',
      unlockReason: 'Appears only after core loop proves value.',
    }));

    expect(availability.state).toBe('disabled');
    expect(availability.canRenderEntryPoint).toBe(false);
    expect(availability.canNavigate).toBe(false);
    expect(availability.canQuery).toBe(false);
    expect(availability.canUseBackend).toBe(false);
    expect(availability.canRegisterRoute).toBe(false);
    expect(availability.canSubscribeToEvents).toBe(false);
    expect(availability.canShowNotification).toBe(false);
  });

  it('healthy unlocked premium allows full access', () => {
    const availability = getFeatureAvailabilityFor('premium_paywall', access({
      unlockReason: 'Premium active',
    }));

    expect(availability.state).toBe('unlocked');
    expect(isFeatureAvailableForNavigation(availability)).toBe(true);
    expect(availability.canRenderEntryPoint).toBe(true);
    expect(availability.canNavigate).toBe(true);
    expect(availability.canRegisterRoute).toBe(true);
  });
});
