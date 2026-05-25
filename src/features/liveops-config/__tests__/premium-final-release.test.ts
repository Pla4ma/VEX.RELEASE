import { readFileSync } from 'fs';
import path from 'path';

import {
  FREE_BOUNDARY_COPY,
  PREMIUM_FEATURES,
  VALUE_PROPOSITION,
} from '../../../screens/paywall/paywall-copy';
import { resolveMonthlyReportAction } from '../../../screens/progress/progress-actions';
import { buildPremiumCompletionReward } from '../../session-completion/premium-completion-reward';
import { buildFeatureAccess } from '../feature-access';
import { getFeatureAvailabilityFor } from '../feature-availability';
import { canRegisterPremiumPaywallRoute } from '../../../navigation/premium-route-gating';
import type { SessionSummary } from '../../../session/types';

function premiumAccess(degraded = false) {
  return buildFeatureAccess({
    totalCompletedSessions: 5,
    degradedFeatures: degraded ? new Set(['premium_paywall']) : new Set(),
  }).features;
}

function makeSummary(xpEarned: number): SessionSummary {
  return {
    actualDuration: 1500,
    baseScore: 80,
    bonuses: [],
    coinsEarned: 0,
    completionPercentage: 100,
    createdAt: 1,
    damageTaken: 0,
    effectiveDuration: 1500,
    finalScore: 90,
    focusQuality: 90,
    gemsEarned: 0,
    interruptions: 0,
    modeBonus: 0,
    pausedDuration: 0,
    pausedTime: 0,
    pauses: 0,
    penaltiesApplied: [],
    plannedDuration: 1500,
    sessionId: 'session-1',
    sessionMode: 'LIGHT_FOCUS',
    status: 'COMPLETED',
    streakDays: 1,
    streakIncreased: true,
    streakMaintained: true,
    timeBonus: 0,
    userId: 'user-1',
    userLevel: 1,
    vsAverage: 0,
    vsBest: 0,
    xpEarned,
  };
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
    expect(resolveMonthlyReportAction(features.premium_paywall)).toBe('start-session');
  });

  it('premium degraded keeps completion free of premium chest card', () => {
    const source = readFileSync(
      path.join(__dirname, '../../../screens/session/components/SessionCompleteRewardsPhase.tsx'),
      'utf8',
    );

    expect(source).not.toContain('SessionPremiumChestCard');
  });

  it('RevenueCat healthy plus eligible user can register paywall route', () => {
    const features = premiumAccess(false);

    expect(features.premium_paywall.isUnlocked).toBe(true);
    expect(canRegisterPremiumPaywallRoute(features)).toBe(true);
  });

  it('premium copy excludes economy language', () => {
    const copy = [
      VALUE_PROPOSITION,
      FREE_BOUNDARY_COPY,
      ...PREMIUM_FEATURES.flatMap((feature) => [feature.title, feature.description]),
    ].join(' ').toLowerCase();

    for (const banned of ['chest', 'shop', 'inventory', 'coins', 'gems']) {
      expect(copy).not.toContain(banned);
    }
  });

  it('free focus loop remains free', () => {
    const features = premiumAccess(true);
    const focusAvailability = getFeatureAvailabilityFor(
      'focus_session',
      features.focus_session,
    );

    expect(focusAvailability.canNavigate).toBe(true);
    expect(FREE_BOUNDARY_COPY).toContain('Core sessions');
  });

  it('completion premium moment uses insight and memory copy only', () => {
    const reward = buildPremiumCompletionReward({
      chestResult: null,
      summary: makeSummary(40),
    });
    const copy = `${reward.title} ${reward.description} ${reward.cta}`.toLowerCase();

    expect(copy).toContain('coach memory');
    for (const banned of ['open chest', 'go to shop', 'view inventory']) {
      expect(copy).not.toContain(banned);
    }
  });
});
