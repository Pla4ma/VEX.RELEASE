import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAvailability,
  type FeatureKey,
} from '../feature-access';
import { buildRootExposureFlags } from '../../../navigation/feature-exposure';
import { buildHomeFeatureRuntime } from '../../../screens/home/hooks/home-feature-runtime';
import { routeNotificationAction } from '../../../navigation/notification-routing-core';

function availabilityFor(sessions: number, feature: FeatureKey): FeatureAvailability {
  const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
  return getFeatureAvailability(features[feature]);
}

function exposureFor(sessions: number, feature: FeatureKey): boolean {
  const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
  const flags = buildRootExposureFlags({ features, isEnabled: () => true });
  const map: Partial<Record<FeatureKey, keyof typeof flags>> = {
    achievements: 'mastery',
    ai_coach_advanced: 'coach',
    boss_tab: 'boss',
    challenges: 'challenges',
    companion_detail: 'companion',
    content_study: 'study',
  };
  const key = map[feature];
  return key ? flags[key] : false;
}

function runtimeFor(sessions: number): ReturnType<typeof buildHomeFeatureRuntime> {
  const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
  return buildHomeFeatureRuntime({ features, totalSessions: sessions });
}

const HIDDEN_FEATURES: FeatureKey[] = [
  'battle_pass',
  'squads',
  'shop',
  'inventory',
  'social_tab',
  'rivals',
  'rankings',
  'wagers',
  'streak_insurance',
  'gems_prominent',
  'boss_bounties',
  'economy_advanced',
  'premium_paywall',
];

describe('Progressive unlock behavior', () => {
  it('keeps hidden features out of UI, routes, queries, backend, and notifications', () => {
    HIDDEN_FEATURES.forEach((feature) => {
      const avail = availabilityFor(0, feature);
      expect(avail.canRenderEntryPoint).toBe(false);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(avail.canUseBackend).toBe(false);
      expect(avail.canRegisterRoute).toBe(false);
      expect(avail.canShowNotification).toBe(false);
    });
  });

  it('teases early motivation layers without allowing navigation or queries', () => {
    const checks: Array<{ feature: FeatureKey; sessions: number }> = [
      { feature: 'companion_detail', sessions: 2 },
      { feature: 'challenges', sessions: 4 },
      { feature: 'boss_tab', sessions: 5 },
      { feature: 'ai_coach_advanced', sessions: 6 },
      { feature: 'content_study', sessions: 8 },
    ];

    checks.forEach(({ feature, sessions }) => {
      const avail = availabilityFor(sessions, feature);
      expect(avail.state).toBe('teased');
      expect(avail.canRenderEntryPoint).toBe(true);
      expect(avail.canNavigate).toBe(false);
      expect(avail.canQuery).toBe(false);
      expect(exposureFor(sessions, feature)).toBe(false);
    });
  });

  it('unlocks core progressive routes only after FeatureAvailability allows navigation', () => {
    const checks: Array<{ feature: FeatureKey; sessions: number }> = [
      { feature: 'companion_detail', sessions: 3 },
      { feature: 'challenges', sessions: 5 },
      { feature: 'achievements', sessions: 6 },
      { feature: 'boss_tab', sessions: 7 },
      { feature: 'ai_coach_advanced', sessions: 8 },
      { feature: 'content_study', sessions: 12 },
    ];

    checks.forEach(({ feature, sessions }) => {
      const avail = availabilityFor(sessions, feature);
      expect(avail.state).toBe('unlocked');
      expect(avail.canNavigate).toBe(true);
      expect(avail.canRegisterRoute).toBe(true);
      expect(exposureFor(sessions, feature)).toBe(true);
    });
  });

  it('derives home runtime queries from FeatureAvailability', () => {
    const at0 = runtimeFor(0);
    expect(at0.canQueryChallenges).toBe(false);
    expect(at0.canQueryBoss).toBe(false);
    expect(at0.canQueryCoach).toBe(false);
    expect(at0.canQueryStudy).toBe(false);

    expect(runtimeFor(5).canQueryChallenges).toBe(true);
    expect(runtimeFor(7).canQueryBoss).toBe(true);
    expect(runtimeFor(8).canQueryCoach).toBe(true);
    expect(runtimeFor(12).canQueryStudy).toBe(true);
  });

  it('keeps premium gated behind session minimum and RevenueCat availability', () => {
    // premium_paywall is progressive: unlocked at 5+ sessions, but isDegraded
    // flag blocks it until RevenueCat billing is live
    expect(availabilityFor(3, 'premium_paywall').state).toBe('locked');
    expect(availabilityFor(10, 'premium_paywall').state).toBe('unlocked');
  });

  it('gates notification routes through FeatureAvailability', () => {
    const locked = buildFeatureAccess({ totalCompletedSessions: 0 }).features;
    const unlocked = buildFeatureAccess({ totalCompletedSessions: 7 }).features;
    const nav = { navigate: jest.fn() };

    expect(routeNotificationAction(nav, { type: 'view_boss' }, locked).success).toBe(false);
    expect(routeNotificationAction(nav, { type: 'view_boss' }, unlocked).success).toBe(true);
  });
});
