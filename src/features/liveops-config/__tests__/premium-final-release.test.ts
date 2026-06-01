import { readFileSync } from 'fs';
import path from 'path';

import {
  FREE_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  VALUE_PROPOSITION,
} from '../../../screens/paywall/paywall-copy';
import { resolveMonthlyReportAction } from '../../../screens/progress/progress-actions';
import { buildFeatureAccess } from '../feature-access';
import { getFeatureAvailabilityFor } from '../feature-availability';
import { canRegisterPremiumPaywallRoute } from '../../../navigation/premium-route-gating';

function premiumAccess(degraded = false, sessions = 40) {
  return buildFeatureAccess({
    totalCompletedSessions: sessions,
    degradedFeatures: degraded ? new Set(['premium_paywall']) : new Set(),
  }).features;
}

describe('premium final-release truth', () => {
  it('premium degraded disables route registration', () => {
    const features = premiumAccess(true);
    const availability = getFeatureAvailabilityFor(
      'premium_paywall',
      features.premium_paywall,
    );

    expect(availability.state).toBe('disabled');
    expect(canRegisterPremiumPaywallRoute(features)).toBe(false);
  });

  it('premium degraded removes entry points', () => {
    const features = premiumAccess(true);
    const availability = getFeatureAvailabilityFor(
      'premium_paywall',
      features.premium_paywall,
    );

    expect(availability.canRenderEntryPoint).toBe(false);
    expect(resolveMonthlyReportAction(features.premium_paywall)).toBe(
      'start-session',
    );
  });

  it('premium degraded keeps completion free of premium chest card', () => {
    const source = readFileSync(
      path.join(
        __dirname,
        '../../../screens/session/components/SessionCompleteRewardsPhase.tsx',
      ),
      'utf8',
    );

    expect(source).not.toContain('SessionPremiumChestCard');
    expect(source).not.toContain('SessionPremiumInsightCard');
  });

  it('RevenueCat healthy plus eligible user (40+ sessions) can register paywall route', () => {
    const features = premiumAccess(false);

    expect(features.premium_paywall.isUnlocked).toBe(true);
    expect(canRegisterPremiumPaywallRoute(features)).toBe(true);
  });

  it('below 40 sessions: premium not unlocked even without degraded', () => {
    const features = premiumAccess(false, 25);

    expect(features.premium_paywall.isUnlocked).toBe(false);
    expect(canRegisterPremiumPaywallRoute(features)).toBe(false);
  });

  it('premium copy excludes economy language', () => {
    const copy = [
      VALUE_PROPOSITION,
      FREE_BOUNDARY_COPY,
      ...PREMIUM_FEATURES.flatMap((feature) => [
        feature.title,
        feature.description,
      ]),
    ]
      .join(' ')
      .toLowerCase();

    for (const banned of ['chest', 'shop', 'inventory', 'coins', 'gems']) {
      // Negation patterns ("no coins", "no gems") are intentional disclaimers — not economy selling
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,5})${banned}`,
        'i',
      );
      expect(copy).not.toMatch(positiveUse);
    }
  });

  it('free focus loop remains free', () => {
    const features = premiumAccess(true);
    const focusAvailability = getFeatureAvailabilityFor(
      'focus_session',
      features.focus_session,
    );

    expect(focusAvailability.canNavigate).toBe(true);
    expect(FREE_BOUNDARY_COPY).toContain('free forever');
  });
});
