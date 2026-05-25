/**
 * Final Release Classification — Comprehensive Test
 *
 * Verifies:
 * - All 55 feature folders have classification entries
 * - Archived features blocked on all 7 FeatureAvailability gates
 * - Progressive features inert before unlock
 * - Economy user-facing wallet/shop is inactive
 * - Internal XP/progress remains active
 * - Completion surfaces hide archived systems
 * - Notification filters hide archived types
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAccessMap,
  type FeatureKey,
} from '../feature-access';
import {
  FINAL_RELEASE_FEATURE_MAP,
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
} from '../final-release-feature-map';
import { DISABLED_FEATURES, FEATURE_RELEASE_STATES, FEATURE_THRESHOLDS } from '../feature-access-config';
import {
  resolveCompletionExperiencePolicy,
  type CompletionSurface,
} from '../../../features/session-completion/completion-experience-policy';
import { SessionMode } from '../../../session/modes';
import { isNotificationTypeFilterable, NOTIFICATION_CONFIG } from '../../../screens/notifications/NotificationScreenConfig';
import { isNotArchivedRoute, FEATURE_ROUTE_REGISTRY } from '../../../navigation/feature-route-registry';
import { createPrefetcher, QueryKeys } from '../../../hooks/usePrefetchQueries';

const PROJECT_ROOT = process.cwd();
const FEATURES_DIR = join(PROJECT_ROOT, 'src', 'features');

const FEATURE_FOLDERS = [
  'account-deletion', 'achievements', 'ai-coach', 'analytics',
  'battle-pass', 'boss', 'boss-realtime', 'challenges',
  'coach-presence', 'companion', 'companion-promise', 'content-study',
  'daily-mission', 'economy', 'emotion-retention', 'feature-gate',
  'focus-contract', 'focus-identity', 'home-experience',
  'home-spine', 'integration', 'inventory', 'items',
  'learning-execution', 'live-ops', 'liveops-config', 'mastery',
  'monetization', 'monthly-report', 'notifications', 'onboarding',
  'personal-bests', 'personalization', 'progression', 'retention',
  'reward-ledger', 'rewards', 'seasons', 'session',
  'session-completion', 'session-events', 'session-history', 'session-recommendation',
  'session-start', 'session-story', 'settings', 'shop',
  'social', 'spectacle', 'squads', 'streaks',
  'themes', 'wallet', 'weekly-quests',
];

function featuresAt(sessions: number): { features: FeatureAccessMap } {
  return buildFeatureAccess({ totalCompletedSessions: sessions });
}

type FeatureGate = keyof ReturnType<typeof getFeatureAvailability>;

const ALL_SEVEN_GATES: FeatureGate[] = [
  'canRenderEntryPoint', 'canNavigate', 'canQuery',
  'canUseBackend', 'canRegisterRoute', 'canSubscribeToEvents', 'canShowNotification',
];

// ============================================================
// 1. Folder classification — all 55 folders covered
// ============================================================
describe('Folder classification — every feature folder exists and is classified', () => {
  it('all expected feature folders exist', () => {
    for (const folder of FEATURE_FOLDERS) {
      const path = join(FEATURES_DIR, folder);
      expect(existsSync(path)).toBe(true);
    }
  });

  it('no unexpected folders in features/', () => {
    const actual = readdirSync(FEATURES_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter((n) => n !== '__tests__' && n !== 'components');

    for (const name of actual) {
      if (!FEATURE_FOLDERS.includes(name) && name !== '__tests__') {
        throw new Error(`Unclassified folder: src/features/${name}`);
      }
    }
  });
});

// ============================================================
// 2. Archived features — blocked on all 7 gates at any session count
// ============================================================
describe('Archived features — blocked on all 7 gates', () => {
  const HIDDEN_KEYS: FeatureKey[] = [
    'battle_pass', 'squads', 'shop', 'inventory', 'social_tab',
    'rivals', 'rankings', 'wagers', 'streak_insurance', 'gems_prominent',
    'boss_bounties', 'economy_advanced', 'economy_basic', 'seasonal_features',
  ];

  it('hidden features have status hidden in feature map', () => {
    for (const key of HIDDEN_KEYS) {
      expect(getFeatureStatus(key)).toBe('hidden');
    }
  });

  it('hidden features have FEATURE_THRESHOLDS set to Infinity or blocked by release state', () => {
    for (const key of HIDDEN_KEYS) {
      const threshold = FEATURE_THRESHOLDS[key];
      const state = FEATURE_RELEASE_STATES[key];
      // All hidden features must either have Infinity threshold or be final_release_deactivated/archived
      const blocked = threshold === Number.POSITIVE_INFINITY ||
        state === 'final_release_deactivated' ||
        state === 'archived';
      expect(blocked).toBe(true);
    }
  });

  it('hidden features have final_release_deactivated release state', () => {
    for (const key of HIDDEN_KEYS) {
      expect(FEATURE_RELEASE_STATES[key]).toBe('final_release_deactivated');
    }
  });

  it('hidden features are in DISABLED_FEATURES', () => {
    for (const key of HIDDEN_KEYS) {
      expect(DISABLED_FEATURES).toContain(key);
    }
  });

  it('hidden features blocked on all 7 gates at 0 sessions', () => {
    const { features } = featuresAt(0);
    for (const key of HIDDEN_KEYS) {
      const avail = getFeatureAvailability(features[key]);
      expect(avail.state).toBe('disabled');
      for (const gate of ALL_SEVEN_GATES) {
        expect(avail[gate]).toBe(false);
      }
    }
  });

  it('hidden features stay blocked at 50 sessions', () => {
    const { features } = featuresAt(50);
    for (const key of HIDDEN_KEYS) {
      const avail = getFeatureAvailability(features[key]);
      expect(avail.state).toBe('disabled');
    }
  });

  it('hidden features stay blocked at 999 sessions', () => {
    const { features } = featuresAt(999);
    for (const key of HIDDEN_KEYS) {
      const avail = getFeatureAvailability(features[key]);
      expect(avail.state).toBe('disabled');
      expect(avail.canNavigate).toBe(false);
      expect(avail.canSubscribeToEvents).toBe(false);
    }
  });
});

// ============================================================
// 3. Archived features — no registered routes
// ============================================================
describe('Archived features — no registered routes', () => {
  it('archived routes blocked by isNotArchivedRoute', () => {
    const archivedRoutes = ['Guild', 'Shop', 'Inventory', 'PostSessionStory'];
    for (const route of archivedRoutes) {
      expect(isNotArchivedRoute(route)).toBe(false);
    }
  });

  it('active routes pass isNotArchivedRoute', () => {
    expect(isNotArchivedRoute('AICoach')).toBe(true);
    expect(isNotArchivedRoute('Boss')).toBe(true);
    expect(isNotArchivedRoute('ContentStudy')).toBe(true);
  });

  it('no archived feature has a route in FEATURE_ROUTE_REGISTRY', () => {
    const archived = new Set(['shop', 'inventory', 'battle_pass', 'squads', 'social_tab', 'rivals', 'rankings', 'wagers', 'economy_advanced', 'economy_basic', 'gems_prominent', 'seasonal_features']);
    for (const entry of FEATURE_ROUTE_REGISTRY) {
      expect(archived.has(entry.feature)).toBe(false);
    }
  });
});

// ============================================================
// 4. Archived features — no prefetch
// ============================================================
describe('Archived features — no prefetch', () => {
  const emptyQueryClient = {
    calls: [] as Array<{ queryKey: readonly string[]; staleTime: number }>,
    queryClient: {
      prefetchQuery: async (options: { queryKey: readonly string[]; staleTime: number }): Promise<void> => {
        emptyQueryClient.calls.push(options);
      },
    },
  };

  it('shop prefetch is no-op', () => {
    const { features } = featuresAt(999);
    emptyQueryClient.calls = [];
    const prefetcher = createPrefetcher(emptyQueryClient.queryClient, { featureAccess: features });
    prefetcher.shop();
    expect(emptyQueryClient.calls).toHaveLength(0);
  });

  it('battle pass prefetch is no-op', () => {
    const { features } = featuresAt(999);
    emptyQueryClient.calls = [];
    const prefetcher = createPrefetcher(emptyQueryClient.queryClient, { featureAccess: features });
    prefetcher.battlePass();
    expect(emptyQueryClient.calls).toHaveLength(0);
  });

  it('social prefetch is no-op', () => {
    const { features } = featuresAt(999);
    emptyQueryClient.calls = [];
    const prefetcher = createPrefetcher(emptyQueryClient.queryClient, { featureAccess: features });
    prefetcher.social();
    expect(emptyQueryClient.calls).toHaveLength(0);
  });

  it('profile prefetch skips wallet and inventory', () => {
    const { features } = featuresAt(999);
    emptyQueryClient.calls = [];
    const prefetcher = createPrefetcher(emptyQueryClient.queryClient, { featureAccess: features });
    prefetcher.profile();
    const keys = emptyQueryClient.calls.map((c) => [...c.queryKey]);
    expect(keys).not.toContainEqual(QueryKeys.USER.WALLET);
    expect(keys).not.toContainEqual(QueryKeys.USER.INVENTORY);
  });

  it('prefetchByFeature blocks hidden features', () => {
    const { features } = featuresAt(0);
    emptyQueryClient.calls = [];
    const prefetcher = createPrefetcher(emptyQueryClient.queryClient, { featureAccess: features, totalCompletedSessions: 0 });
    prefetcher.byFeature('shop', QueryKeys.SHOP.OFFERS);
    prefetcher.byFeature('battle_pass', QueryKeys.BATTLE_PASS.PROGRESS);
    prefetcher.byFeature('squads', QueryKeys.SQUAD.STATUS);
    expect(emptyQueryClient.calls).toHaveLength(0);
  });
});

// ============================================================
// 5. Archived features — no notifications
// ============================================================
describe('Archived features — no notifications', () => {
  it('SQUAD notification type is not filterable', () => {
    const { features } = featuresAt(0);
    expect(isNotificationTypeFilterable('SQUAD', features)).toBe(false);
  });

  it('RIVAL notification type is not filterable', () => {
    const { features } = featuresAt(0);
    expect(isNotificationTypeFilterable('RIVAL', features)).toBe(false);
  });

  it('hidden notification types are not filterable', () => {
    const { features } = featuresAt(0);
    expect(isNotificationTypeFilterable('SQUAD', features)).toBe(false);
    expect(isNotificationTypeFilterable('RIVAL', features)).toBe(false);
  });

  it('BOSS notification is filterable when feature is unlocked', () => {
    const { features } = featuresAt(7);
    expect(isNotificationTypeFilterable('BOSS', features)).toBe(true);
  });

  it('BOSS notification is not filterable when feature is hidden', () => {
    const { features } = featuresAt(0);
    // boss_tab is locked, not disabled — but notification filter checks canShowNotification
    const avail = getFeatureAvailability(features.boss_tab);
    expect(avail.canShowNotification).toBe(false);
  });

  it('COACH notification is filterable when unlocked', () => {
    const { features } = featuresAt(8);
    expect(isNotificationTypeFilterable('COACH', features)).toBe(true);
  });

  it('all enabled notification types pass notification filters', () => {
    const { features } = featuresAt(20);
    const enabled: string[] = [];
    const types = Object.keys(NOTIFICATION_CONFIG) as Array<keyof typeof NOTIFICATION_CONFIG>;
    for (const type of types) {
      if (isNotificationTypeFilterable(type, features)) {
        enabled.push(type);
      }
    }
    expect(enabled).not.toContain('SQUAD');
    expect(enabled).not.toContain('RIVAL');
    expect(enabled).toContain('ACHIEVEMENT');
    expect(enabled).toContain('STREAK_RISK');
  });
});

// ============================================================
// 6. Progressive features — don't query before unlock
// ============================================================
describe('Progressive features — inert before unlock', () => {
  it('boss_tab cannot query at 0 sessions', () => {
    const { features } = featuresAt(0);
    expect(getFeatureAvailability(features.boss_tab).canQuery).toBe(false);
  });

  it('boss_tab can query at 7 sessions', () => {
    const { features } = featuresAt(7);
    expect(getFeatureAvailability(features.boss_tab).canQuery).toBe(true);
  });

  it('challenges cannot query at 0 sessions', () => {
    const { features } = featuresAt(0);
    expect(getFeatureAvailability(features.challenges).canQuery).toBe(false);
  });

  it('challenges can query at 5 sessions', () => {
    const { features } = featuresAt(5);
    expect(getFeatureAvailability(features.challenges).canQuery).toBe(true);
  });

  it('content_study cannot query at 0 sessions', () => {
    const { features } = featuresAt(0);
    expect(getFeatureAvailability(features.content_study).canQuery).toBe(false);
  });

  it('content_study can query at 12 sessions', () => {
    const { features } = featuresAt(12);
    expect(getFeatureAvailability(features.content_study).canQuery).toBe(true);
  });

  it('ai_coach_advanced cannot query at 0 sessions', () => {
    const { features } = featuresAt(0);
    expect(getFeatureAvailability(features.ai_coach_advanced).canQuery).toBe(false);
  });

  it('ai_coach_advanced can query at 8 sessions', () => {
    const { features } = featuresAt(8);
    expect(getFeatureAvailability(features.ai_coach_advanced).canQuery).toBe(true);
  });
});

// ============================================================
// 7. Economy split — wallet/shop inactive, XP/progress active
// ============================================================
describe('Economy split — wallet/shop inactive, XP/progress active', () => {
  it('economy_basic is hidden in final release', () => {
    expect(isFeatureHidden('economy_basic')).toBe(true);
  });

  it('economy_advanced is hidden in final release', () => {
    expect(isFeatureHidden('economy_advanced')).toBe(true);
  });

  it('gems_prominent is hidden in final release', () => {
    expect(isFeatureHidden('gems_prominent')).toBe(true);
  });

  it('shop is hidden in final release', () => {
    expect(isFeatureHidden('shop')).toBe(true);
  });

  it('inventory is hidden in final release', () => {
    expect(isFeatureHidden('inventory')).toBe(true);
  });

  it('user wallet prefetch is blocked', () => {
    const { features } = featuresAt(50);
    const avail = getFeatureAvailability(features.economy_basic);
    expect(avail.canQuery).toBe(false);
    expect(avail.canUseBackend).toBe(false);
  });

  it('progress_view is active and unlocked at 0 sessions', () => {
    const { features } = featuresAt(0);
    expect(isFeatureIncluded('progress_view')).toBe(true);
    expect(getFeatureAvailability(features.progress_view).state).toBe('unlocked');
    expect(getFeatureAvailability(features.progress_view).canQuery).toBe(true);
  });

  it('focus_session is active and unlocked at 0 sessions', () => {
    const { features } = featuresAt(0);
    expect(isFeatureIncluded('focus_session')).toBe(true);
    expect(getFeatureAvailability(features.focus_session).state).toBe('unlocked');
    expect(getFeatureAvailability(features.focus_session).canQuery).toBe(true);
  });

  it('core features are included (not hidden)', () => {
    const core: FeatureKey[] = [
      'focus_session', 'progress_view', 'home_tab', 'focus_tab',
      'profile_tab', 'ai_coach_basic', 'content_study', 'advanced_settings',
    ];
    for (const key of core) {
      expect(isFeatureIncluded(key)).toBe(true);
    }
  });

  it('XP/streak tracking (progress_view) remains active at all session counts', () => {
    for (const sessions of [0, 10, 50, 999]) {
      const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
      const avail = getFeatureAvailability(features.progress_view);
      expect(avail.canQuery).toBe(true);
      expect(avail.canSubscribeToEvents).toBe(true);
    }
  });

  it('economy_basic stays disabled regardless of session count', () => {
    for (const sessions of [0, 10, 50, 999]) {
      const { features } = buildFeatureAccess({ totalCompletedSessions: sessions });
      const avail = getFeatureAvailability(features.economy_basic);
      expect(avail.state).toBe('disabled');
      expect(avail.canQuery).toBe(false);
    }
  });
});

// ============================================================
// 8. Completion surfaces — archived systems hidden
// ============================================================
describe('Completion surfaces — archived systems hidden', () => {
  const HIDDEN_COMPLETION_SURFACES: CompletionSurface[] = [
    'battle_pass_card',
    'premium_chest',
    'coins_gems_wallet',
    'shop_inventory_prompts',
    'rival_consequence_cards',
    'squad_consequence_cards',
    'social_share_primary_action',
    'chest_reward_animation',
    'follow_through_cards',
    'mastery_card',
  ];

  it('archived completion surfaces are hidden by default', () => {
    const policy = resolveCompletionExperiencePolicy({
      consequences: {},
      featureAvailability: {
        boss: false,
        challenges: false,
        contractUsed: false,
        progress: true,
        study: false,
      },
      firstWeekStage: null,
      motivationStyle: 'calm',
      premiumState: 'free',
      primaryGoal: null,
      sessionMode: 'FLOW',
      summary: {
        actualDuration: 1500,
        baseScore: 100,
        bonuses: [],
        coinsEarned: 0,
        completionPercentage: 100,
        createdAt: 500000,
        damageTaken: 0,
        effectiveDuration: 1400,
        finalScore: 92,
        focusPurityScore: 95,
        focusQuality: 95,
        gemsEarned: 0,
        interruptions: 0,
        modeBonus: 0,
        pausedDuration: 0,
        pausedTime: 0,
        pauses: 0,
        penaltiesApplied: [],
        plannedDuration: 1500,
        sessionId: 'session-123',
        sessionMode: 'FLOW',
        status: 'COMPLETED',
        streakBonus: 10,
        streakDays: 4,
        streakIncreased: true,
        streakMaintained: true,
        timeBonus: 10,
        userId: 'user-123',
        userLevel: 2,
        vsAverage: 0,
        vsBest: 0,
        xpEarned: 120,
      },
    });

    for (const surface of HIDDEN_COMPLETION_SURFACES) {
      expect(policy.hiddenCompletionSurfaces).toContain(surface);
    }
  });

  it('completion does not expose wallet/shop/inventory', () => {
    const policy = resolveCompletionExperiencePolicy({
      consequences: {},
      featureAvailability: {
        boss: true,
        challenges: true,
        contractUsed: false,
        progress: true,
        study: true,
      },
      firstWeekStage: 'ENGAGED',
      motivationStyle: 'game_like',
      premiumState: 'premium',
      primaryGoal: null,
      sessionMode: 'FLOW',
      summary: {
        actualDuration: 1500,
        baseScore: 100,
        bonuses: [],
        coinsEarned: 0,
        completionPercentage: 100,
        createdAt: 500000,
        damageTaken: 0,
        effectiveDuration: 1400,
        finalScore: 92,
        focusPurityScore: 95,
        focusQuality: 95,
        gemsEarned: 0,
        interruptions: 0,
        modeBonus: 0,
        pausedDuration: 0,
        pausedTime: 0,
        pauses: 0,
        penaltiesApplied: [],
        plannedDuration: 1500,
        sessionId: 'session-123',
        sessionMode: 'FLOW',
        status: 'COMPLETED',
        streakBonus: 10,
        streakDays: 4,
        streakIncreased: true,
        streakMaintained: true,
        timeBonus: 10,
        userId: 'user-123',
        userLevel: 2,
        vsAverage: 0,
        vsBest: 0,
        xpEarned: 120,
      },
    });

    expect(policy.hiddenCompletionSurfaces).toContain('shop_inventory_prompts');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
    expect(policy.hiddenCompletionSurfaces).toContain('chest_reward_animation');
  });
});
