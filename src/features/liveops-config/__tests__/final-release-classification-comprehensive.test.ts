import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

import { createPrefetcher, QueryKeys } from '../../../hooks/usePrefetchQueries';
import { isNotArchivedRoute, FEATURE_ROUTE_REGISTRY } from '../../../navigation/feature-route-registry';
import { isNotificationTypeFilterable } from '../../../screens/notifications/NotificationScreenConfig';
import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAccessMap,
  type FeatureKey,
} from '../feature-access';
import { DISABLED_FEATURES, FEATURE_RELEASE_STATES, FEATURE_THRESHOLDS } from '../feature-access-config';

const FEATURES_DIR = join(process.cwd(), 'src', 'features');

const FEATURE_FOLDERS = [
  'account-deletion',
  'achievements',
  'ai-coach',
  'analytics',
  'battle-pass',
  'boss',
  'boss-realtime',
  'challenges',
  'coach-presence',
  'companion',
  'companion-promise',
  'content-study',
  'daily-mission',
  'economy',
  'emotion-retention',
  'feature-gate',
  'focus-contract',
  'focus-identity',
  'focus-memory',
  'focus-profile',
  'focus-run',
  'home-experience',
  'home-spine',
  'integration',
  'inventory',
  'items',
  'lane-engine',
  'learning-execution',
  'live-ops',
  'liveops-config',
  'mastery',
  'memory-candidate',
  'monetization',
  'monthly-report',
  'notification-policy',
  'notifications',
  'onboarding',
  'personal-bests',
  'personalization',
  'progression',
  'project-focus',
  'rescue-mode',
  'retention',
  'reward-ledger',
  'rewards',
  'seasons',
  'session',
  'session-completion',
  'session-events',
  'session-history',
  'session-recommendation',
  'session-start',
  'session-story',
  'settings',
  'shop',
  'social',
  'spectacle',
  'squads',
  'streaks',
  'study-intelligence',
  'study-os',
  'themes',
  'today-system',
  'unlock-explainer',
  'vex-actions',
  'wallet',
  'weekly-quests',
];

const HIDDEN_KEYS: FeatureKey[] = [
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
  'economy_basic',
  'seasonal_features',
];

function featuresAt(sessions: number): FeatureAccessMap {
  return buildFeatureAccess({ totalCompletedSessions: sessions }).features;
}

describe('Final release classification', () => {
  it('classifies every feature folder and references real folders only', () => {
    const actual = readdirSync(FEATURES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => name !== '__tests__' && name !== 'components');

    for (const folder of FEATURE_FOLDERS) {
      expect(existsSync(join(FEATURES_DIR, folder))).toBe(true);
    }
    for (const name of actual) {
      expect(FEATURE_FOLDERS).toContain(name);
    }
  });

  it('blocks archived features on all runtime gates', () => {
    const features = featuresAt(999);
    for (const key of HIDDEN_KEYS) {
      const availability = getFeatureAvailability(features[key]);
      const threshold = FEATURE_THRESHOLDS[key];
      const releaseState = FEATURE_RELEASE_STATES[key];

      expect(DISABLED_FEATURES).toContain(key);
      expect(releaseState).toBe('final_release_deactivated');
      expect(threshold === Number.POSITIVE_INFINITY || releaseState === 'final_release_deactivated').toBe(true);
      expect(availability.state).toBe('disabled');
      expect(availability.canRenderEntryPoint).toBe(false);
      expect(availability.canNavigate).toBe(false);
      expect(availability.canQuery).toBe(false);
      expect(availability.canUseBackend).toBe(false);
      expect(availability.canRegisterRoute).toBe(false);
      expect(availability.canSubscribeToEvents).toBe(false);
      expect(availability.canShowNotification).toBe(false);
    }
  });

  it('keeps archived routes, prefetches, and notifications inert', () => {
    for (const route of ['Guild', 'Shop', 'Inventory', 'PostSessionStory']) {
      expect(isNotArchivedRoute(route)).toBe(false);
    }

    const archived = new Set([
      'shop',
      'inventory',
      'battle_pass',
      'squads',
      'social_tab',
      'rivals',
      'rankings',
      'wagers',
      'economy_advanced',
      'economy_basic',
      'gems_prominent',
      'seasonal_features',
    ]);
    for (const entry of FEATURE_ROUTE_REGISTRY) {
      expect(archived.has(entry.feature)).toBe(false);
    }

    const calls: Array<{ queryKey: readonly string[] }> = [];
    const queryClient = {
      prefetchQuery: async (options: { queryKey: readonly string[] }): Promise<void> => {
        calls.push(options);
      },
    };
    const prefetcher = createPrefetcher(queryClient, { featureAccess: featuresAt(999) });
    prefetcher.shop();
    prefetcher.battlePass();
    prefetcher.social();
    prefetcher.profile();

    expect(calls).not.toContainEqual(expect.objectContaining({ queryKey: QueryKeys.USER.WALLET }));
    expect(calls).not.toContainEqual(expect.objectContaining({ queryKey: QueryKeys.USER.INVENTORY }));
    expect(isNotificationTypeFilterable('SQUAD', featuresAt(0))).toBe(false);
    expect(isNotificationTypeFilterable('RIVAL', featuresAt(0))).toBe(false);
  });

  it('keeps progressive features inert until their unlock session count', () => {
    expect(getFeatureAvailability(featuresAt(0).boss_tab).canQuery).toBe(false);
    expect(getFeatureAvailability(featuresAt(7).boss_tab).canQuery).toBe(true);
    expect(getFeatureAvailability(featuresAt(0).challenges).canQuery).toBe(false);
    expect(getFeatureAvailability(featuresAt(5).challenges).canQuery).toBe(true);
    expect(getFeatureAvailability(featuresAt(0).content_study).canQuery).toBe(false);
    expect(getFeatureAvailability(featuresAt(12).content_study).canQuery).toBe(true);
    expect(getFeatureAvailability(featuresAt(0).ai_coach_advanced).canQuery).toBe(false);
    expect(getFeatureAvailability(featuresAt(8).ai_coach_advanced).canQuery).toBe(true);
  });
});
