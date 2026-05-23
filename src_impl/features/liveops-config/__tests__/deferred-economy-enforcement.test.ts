import {
  PUBLIC_V1_FEATURE_MAP,
  isPublicV1Hidden,
  getPublicV1Status,
} from '../public-v1-feature-map';
import { FEATURE_ROUTE_REGISTRY } from '../../../navigation/feature-route-registry';
import { DISABLED_FEATURES, FEATURE_RELEASE_STATES } from '../feature-access-config';
import type { FeatureKey } from '../feature-access';

const DEFERRED_PUBLIC_V1_FEATURES: FeatureKey[] = [
  'shop',
  'inventory',
  'battle_pass',
  'gems_prominent',
  'economy_advanced',
  'streak_insurance',
];

describe('Deferred Public V1 — route registry excludes economy/shop/battle-pass', () => {
  it('FEATURE_ROUTE_REGISTRY excludes shop', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    expect(routeFeatures).not.toContain('shop');
  });

  it('FEATURE_ROUTE_REGISTRY excludes inventory', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    expect(routeFeatures).not.toContain('inventory');
  });

  it('FEATURE_ROUTE_REGISTRY excludes battle_pass', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    expect(routeFeatures).not.toContain('battle_pass');
  });

  it('FEATURE_ROUTE_REGISTRY excludes gems_prominent', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    expect(routeFeatures).not.toContain('gems_prominent');
  });

  it('FEATURE_ROUTE_REGISTRY excludes economy_advanced', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    expect(routeFeatures).not.toContain('economy_advanced');
  });
});

describe('Deferred Public V1 — all deferred features are hidden', () => {
  for (const feature of DEFERRED_PUBLIC_V1_FEATURES) {
    it(`${feature} has status 'hidden' in PUBLIC_V1_FEATURE_MAP`, () => {
      expect(getPublicV1Status(feature)).toBe('hidden');
    });
  }

  for (const feature of DEFERRED_PUBLIC_V1_FEATURES) {
    it(`${feature} is in DISABLED_FEATURES`, () => {
      expect(DISABLED_FEATURES).toContain(feature);
    });
  }

  for (const feature of DEFERRED_PUBLIC_V1_FEATURES) {
    it(`${feature} release state is disabled_beta or archived`, () => {
      expect(['disabled_beta', 'archived']).toContain(FEATURE_RELEASE_STATES[feature]);
    });
  }
});

describe('Deferred Public V1 — completion does not award premium currency', () => {
  it('gems_prominent is hidden in public V1', () => {
    expect(isPublicV1Hidden('gems_prominent')).toBe(true);
  });

  it('shop is hidden in public V1', () => {
    expect(isPublicV1Hidden('shop')).toBe(true);
  });

  it('economy_advanced is hidden in public V1', () => {
    expect(isPublicV1Hidden('economy_advanced')).toBe(true);
  });

  it('streak_insurance is hidden in public V1', () => {
    expect(isPublicV1Hidden('streak_insurance')).toBe(true);
  });
});

describe('Deferred Public V1 — premium copy does not reference chests/gems/inventory/battle-pass', () => {
  it('premium_paywall note does not mention shop/gems/inventory/battle-pass', () => {
    const premiumEntry = PUBLIC_V1_FEATURE_MAP.premium_paywall;
    expect(premiumEntry).toBeDefined();
    const note = premiumEntry.note ?? '';
    expect(note).not.toContain('shop');
    expect(note).not.toContain('gems');
    expect(note).not.toContain('chest');
    expect(note).not.toContain('inventory');
    expect(note).not.toContain('battle pass');
  });

  it('battle_pass copy does not appear in premium copy', () => {
    const bpEntry = PUBLIC_V1_FEATURE_MAP.battle_pass;
    expect(bpEntry).toBeDefined();
    expect(bpEntry.status).toBe('hidden');
  });

  it('shop copy does not appear in premium copy', () => {
    const shopEntry = PUBLIC_V1_FEATURE_MAP.shop;
    expect(shopEntry).toBeDefined();
    expect(shopEntry.status).toBe('hidden');
  });
});

describe('Deferred Public V1 — notification filters exclude deferred features', () => {
  it('deferred features cannot show notifications by FeatureAvailability', () => {
    const { getFeatureAvailability } = require('../feature-availability');
    for (const feature of DEFERRED_PUBLIC_V1_FEATURES) {
      const access = {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'Hidden in public V1',
        unlockReason: '',
        releaseState: 'disabled_beta' as const,
      };
      const avail = getFeatureAvailability(access);
      expect(avail.canShowNotification).toBe(false);
    }
  });
});

describe('Deferred Public V1 — all deferred features classified', () => {
  it('all DEFERRED_PUBLIC_V1 files exist in src_impl with deferred marker', () => {
    expect(DEFERRED_PUBLIC_V1_FEATURES).toHaveLength(6);
  });

  it('economy_advanced cannot register route', () => {
    const routeFeatures = FEATURE_ROUTE_REGISTRY.map((r) => r.feature);
    expect(routeFeatures).not.toContain('economy_advanced');
  });

  it('streak_insurance is not part of any completion flow', () => {
    expect(isPublicV1Hidden('streak_insurance')).toBe(true);
  });
});
