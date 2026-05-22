import {
  PUBLIC_V1_FEATURE_MAP,
  isPublicV1Hidden,
  isPublicV1Included,
  getPublicV1Status,
  PUBLIC_V1_HIDDEN_SYSTEMS,
} from '../public-v1-feature-map';
import { getAvailableNotificationFilters } from '../../../navigation/notification-routing-core';
import { FEATURE_ROUTE_REGISTRY } from '../../../navigation/feature-route-registry';
import { DISABLED_FEATURES, FEATURE_RELEASE_STATES } from '../feature-access-config';
import type { FeatureKey } from '../feature-access';

const HIDDEN_FEATURE_KEYS: FeatureKey[] = [
  'shop', 'inventory', 'battle_pass', 'wagers', 'rivals',
  'squads', 'social_tab', 'rankings', 'economy_advanced',
  'gems_prominent', 'streak_insurance', 'boss_bounties', 'seasonal_features',
];

describe('Public V1 Feature Map Enforcement', () => {
  it('hidden features cannot register routes', () => {
    const registeredFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    for (const key of HIDDEN_FEATURE_KEYS) {
      expect(registeredFeatures).not.toContain(key);
    }
  });

  it('hidden features cannot show notification filters', () => {
    const filters = getAvailableNotificationFilters();
    const hiddenFilterTypes = ['view_squad', 'join_duel', 'open_shop', 'open_chest'];
    for (const ft of hiddenFilterTypes) {
      expect(filters).not.toContain(ft);
    }
  });

  it('hidden features are marked disabled_beta in release states', () => {
    for (const key of HIDDEN_FEATURE_KEYS) {
      const state = FEATURE_RELEASE_STATES[key];
      if (state !== undefined) {
        expect(['disabled_beta', 'archived']).toContain(state);
      }
    }
  });

  it('hidden features are all in DISABLED_FEATURES list', () => {
    const disabledSet = new Set(DISABLED_FEATURES);
    for (const key of HIDDEN_FEATURE_KEYS) {
      expect(disabledSet.has(key)).toBe(true);
    }
  });

  it('PUBLIC_V1_HIDDEN_SYSTEMS covers economy/social features', () => {
    const hiddenSystems = PUBLIC_V1_HIDDEN_SYSTEMS as readonly string[];
    expect(hiddenSystems).toContain('shop');
    expect(hiddenSystems).toContain('inventory');
    expect(hiddenSystems).toContain('battle_pass');
    expect(hiddenSystems).toContain('wagers');
    expect(hiddenSystems).toContain('rivals');
    expect(hiddenSystems).toContain('squads_social');
    expect(hiddenSystems).toContain('leaderboards');
    expect(hiddenSystems).toContain('premium_currency');
    expect(hiddenSystems).toContain('advanced_economy');
  });

  it('isPublicV1Hidden returns true for all hidden economy/social features', () => {
    expect(isPublicV1Hidden('shop')).toBe(true);
    expect(isPublicV1Hidden('inventory')).toBe(true);
    expect(isPublicV1Hidden('battle_pass')).toBe(true);
    expect(isPublicV1Hidden('wagers')).toBe(true);
    expect(isPublicV1Hidden('rivals')).toBe(true);
    expect(isPublicV1Hidden('squads')).toBe(true);
    expect(isPublicV1Hidden('social_tab')).toBe(true);
    expect(isPublicV1Hidden('rankings')).toBe(true);
    expect(isPublicV1Hidden('economy_advanced')).toBe(true);
    expect(isPublicV1Hidden('gems_prominent')).toBe(true);
    expect(isPublicV1Hidden('streak_insurance')).toBe(true);
    expect(isPublicV1Hidden('boss_bounties')).toBe(true);
    expect(isPublicV1Hidden('seasonal_features')).toBe(true);
  });

  it('core features are NOT hidden', () => {
    expect(isPublicV1Hidden('focus_session')).toBe(false);
    expect(isPublicV1Hidden('progress_view')).toBe(false);
    expect(isPublicV1Hidden('ai_coach_basic')).toBe(false);
    expect(isPublicV1Hidden('home_tab')).toBe(false);
    expect(isPublicV1Hidden('profile_tab')).toBe(false);
    expect(isPublicV1Hidden('content_study')).toBe(false);
  });

  it('boss has no squad/community dependency in public v1', () => {
    expect(isPublicV1Hidden('squads')).toBe(true);
    expect(isPublicV1Hidden('social_tab')).toBe(true);
    const bossEntry = PUBLIC_V1_FEATURE_MAP.boss_tab;
    expect(bossEntry).toBeDefined();
    expect(bossEntry.status).toBe('progressive');
  });

  it('premium paywall does not reference hidden economy features', () => {
    const premiumEntry = PUBLIC_V1_FEATURE_MAP.premium_paywall;
    expect(premiumEntry).toBeDefined();
    expect(premiumEntry.note).toBeDefined();
    expect(premiumEntry.note).not.toContain('shop');
    expect(premiumEntry.note).not.toContain('gems');
    expect(premiumEntry.note).not.toContain('battle pass');
    expect(premiumEntry.note).not.toContain('inventory');
  });

  it('all hidden features have status hidden in PUBLIC_V1_FEATURE_MAP', () => {
    for (const key of HIDDEN_FEATURE_KEYS) {
      expect(getPublicV1Status(key)).toBe('hidden');
    }
  });

  it('hidden feature keys do not appear in FEATURE_ROUTE_REGISTRY', () => {
    const routeFeatures = new Set(FEATURE_ROUTE_REGISTRY.map((r) => r.feature));
    for (const key of HIDDEN_FEATURE_KEYS) {
      expect(routeFeatures.has(key)).toBe(false);
    }
  });

  it('all enabled routes register only non-hidden features', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    for (const feature of routeFeatures) {
      expect(isPublicV1Included(feature) || getPublicV1Status(feature) === 'progressive' || getPublicV1Status(feature) === 'premium_gated').toBe(true);
    }
  });
});
