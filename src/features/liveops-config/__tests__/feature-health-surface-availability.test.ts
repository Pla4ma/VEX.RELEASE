import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../feature-availability';

function degradedAccess() {
  return {
    isUnlocked: true,
    isVisible: true,
    isDegraded: true,
    lockedDescription: 'Degraded',
    unlockReason: 'Limited mode',
    releaseState: 'final_release_progressive' as const,
  };
}

describe('degraded surface enforcement - FeatureAvailability gates', () => {
  it('degraded content_study blocks upload CTA', () => {
    const avail = getFeatureAvailability(degradedAccess());
    expect(avail.state).toBe('degraded');
    expect(isFeatureAvailableForNavigation(avail)).toBe(false);
    expect(avail.canQuery).toBe(false);
  });

  it('degraded ai_coach_advanced blocks advanced coach route', () => {
    const avail = getFeatureAvailability(degradedAccess());
    expect(avail.state).toBe('degraded');
    expect(avail.canNavigate).toBe(false);
  });

  it('degraded premium_paywall blocks purchasable paywall', () => {
    const avail = getFeatureAvailability(degradedAccess());
    expect(avail.canNavigate).toBe(false);
    expect(avail.canQuery).toBe(false);
  });

  it('degraded boss_tab blocks full boss route', () => {
    const avail = getFeatureAvailability(degradedAccess());
    expect(avail.canNavigate).toBe(false);
    expect(avail.state).toBe('degraded');
  });

  it('healthy features allow navigation', () => {
    const avail = getFeatureAvailability({
      isUnlocked: true,
      isVisible: true,
      lockedDescription: '',
      unlockReason: 'Unlocked',
      releaseState: 'final_release_progressive' as const,
    });
    expect(avail.state).toBe('unlocked');
    expect(isFeatureAvailableForNavigation(avail)).toBe(true);
  });
});
