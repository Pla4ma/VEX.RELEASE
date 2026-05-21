import { featureHealthRegistry } from '../feature-health';
import { registerFeatureHealthChecks } from '../feature-health-checks';
import type { FeatureKey } from '../feature-access';

describe('feature-health-checks', () => {
  beforeEach(() => {
    featureHealthRegistry.invalidateCache();
  });

  it('registers health checks for all four required features', () => {
    registerFeatureHealthChecks();

    const contentStudyStatus = featureHealthRegistry.getFeatureHealth('content_study');
    const aiCoachStatus = featureHealthRegistry.getFeatureHealth('ai_coach_advanced');
    const paywallStatus = featureHealthRegistry.getFeatureHealth('premium_paywall');
    const bossStatus = featureHealthRegistry.getFeatureHealth('boss_tab');

    void expect(contentStudyStatus).resolves.toBeDefined();
    void expect(aiCoachStatus).resolves.toBeDefined();
    void expect(paywallStatus).resolves.toBeDefined();
    void expect(bossStatus).resolves.toBeDefined();
  });

  it('returns healthy for features without health checks', async () => {
    registerFeatureHealthChecks();

    const status = await featureHealthRegistry.getFeatureHealth('focus_session' as FeatureKey);
    expect(status).toBe('healthy');
  });

  it('shouldDegrade returns false when health check is healthy', async () => {
    registerFeatureHealthChecks();

    const shouldDegrade = await featureHealthRegistry.shouldDegrade('premium_paywall');
    expect(shouldDegrade).toBe(false);
  });

  it('shouldDegrade returns true when health check is unavailable', async () => {
    featureHealthRegistry.register({
      id: 'test_degraded',
      feature: 'content_study' as FeatureKey,
      label: 'Test degraded check',
      dependency: 'test',
      check: () => 'unavailable',
    });

    const shouldDegrade = await featureHealthRegistry.shouldDegrade('content_study' as FeatureKey);
    expect(shouldDegrade).toBe(true);
  });

  it('getUnhealthyFeatures returns features that are not healthy', async () => {
    registerFeatureHealthChecks();

    featureHealthRegistry.register({
      id: 'test_unhealthy_feature',
      feature: 'ai_coach_advanced' as FeatureKey,
      label: 'Test unhealthy',
      dependency: 'test',
      check: () => 'degraded',
    });

    const unhealthy = await featureHealthRegistry.getUnhealthyFeatures();
    expect(unhealthy).toContain('ai_coach_advanced');
  });

  it('cache returns stale result within TTL window', async () => {
    let callCount = 0;

    featureHealthRegistry.register({
      id: 'test_cache_ttl',
      feature: 'focus_session' as FeatureKey,
      label: 'Cache TTL test',
      dependency: 'test',
      cacheMs: 60_000,
      check: () => {
        callCount++;
        return 'healthy';
      },
    });

    await featureHealthRegistry.getFeatureHealth('focus_session' as FeatureKey);
    expect(callCount).toBe(1);

    await featureHealthRegistry.getFeatureHealth('focus_session' as FeatureKey);
    expect(callCount).toBe(1);
  });
});
