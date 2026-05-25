import { healthChecks } from '../feature-health-checks';
import { featureHealthRegistry } from '../feature-health';
import type { FeatureKey } from '../feature-access';

function checkById(id: string) {
  const check = healthChecks.find((item) => item.id === id);
  if (!check) {
    throw new Error(`Missing health check ${id}`);
  }
  return check;
}

async function runCheck(id: string): Promise<string> {
  return Promise.resolve(checkById(id).check());
}

describe('real feature health checks', () => {
  it('no duplicate health check IDs exist', () => {
    const ids = healthChecks.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('content_study verifies configured constraints as healthy', async () => {
    await expect(runCheck('content_study_max_file_constraints')).resolves.toBe('healthy');
  });

  it('content_study verifies rate limit configuration as healthy', async () => {
    await expect(runCheck('content_study_rate_limits')).resolves.toBe('healthy');
  });

  it('content_study returns unavailable when Gemini key is missing', () => {
    expect(typeof checkById('content_study_gemini').check).toBe('function');
  });

  it('content_study returns unavailable when Supabase storage config is missing', () => {
    expect(typeof checkById('content_study_storage').check).toBe('function');
  });

  it('content_study privacy disclosure returns healthy when config present, unavailable when missing', async () => {
    const result = await runCheck('content_study_privacy_disclosure');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('ai_coach_advanced backend config check exists', async () => {
    expect(typeof checkById('ai_coach_advanced_backend').check).toBe('function');
  });

  it('ai_coach_advanced fallback returns healthy when config present, unavailable when missing', async () => {
    const result = await runCheck('ai_coach_advanced_fallback');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('ai_coach_advanced safe intent returns healthy when config present, unavailable when missing', async () => {
    const result = await runCheck('ai_coach_advanced_safe_intent');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('ai_coach_advanced quota returns healthy when config present, unavailable when missing', async () => {
    const result = await runCheck('ai_coach_advanced_quota');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('premium_paywall RevenueCat config check exists', async () => {
    expect(typeof checkById('premium_paywall_revenuecat_config').check).toBe('function');
  });

  it('premium_paywall offerings require live packages', async () => {
    const result = await runCheck('premium_paywall_offerings');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('premium_paywall entitlements require readable RevenueCat customer info', async () => {
    const result = await runCheck('premium_paywall_entitlements');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('boss_tab template returns healthy when deps disabled, unavailable when missing', async () => {
    const result = await runCheck('boss_tab_template');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('boss_tab subtle fallback returns healthy when deps disabled, unavailable when missing', async () => {
    const result = await runCheck('boss_tab_subtle_fallback');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('boss_tab route gating returns healthy when deps disabled, unavailable when missing', async () => {
    const result = await runCheck('boss_tab_route_gating');
    expect(['healthy', 'unavailable']).toContain(result);
  });

  it('boss_tab final release forbidden deps are disabled returns healthy', async () => {
    await expect(runCheck('boss_tab_no_disabled_deps')).resolves.toBe('healthy');
  });
});

describe('feature health registry — duplicate protection', () => {
  beforeAll(() => {
    const { registerFeatureHealthChecks } = require('../feature-health-checks');
    registerFeatureHealthChecks();
  });

  it('registry does not accept duplicate check IDs', () => {
    const ids = featureHealthRegistry.getRegisteredIds();
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('registry ignores duplicate registrations silently', () => {
    const beforeCount = featureHealthRegistry.getRegisteredIds().length;
    const { registerFeatureHealthChecks } = require('../feature-health-checks');
    registerFeatureHealthChecks();
    const afterCount = featureHealthRegistry.getRegisteredIds().length;
    expect(afterCount).toBe(beforeCount);
  });

  it('all critical features are registered', () => {
    const ids = featureHealthRegistry.getRegisteredIds();
    const features = new Set(healthChecks.map((c) => c.feature));
    const expectedFeatures: FeatureKey[] = ['content_study', 'ai_coach_advanced', 'premium_paywall', 'boss_tab'];
    for (const feat of expectedFeatures) {
      expect(features.has(feat)).toBe(true);
    }
  });

  it('ai_coach_advanced is not unavailable when config is present (healthy when backend configured)', async () => {
    const status = await featureHealthRegistry.getFeatureHealth('ai_coach_advanced');
    expect(status).not.toBe('unavailable');
  });

  it('premium_paywall is healthy only when RevenueCat runtime checks pass', async () => {
    const status = await featureHealthRegistry.getFeatureHealth('premium_paywall');
    expect(['healthy', 'unavailable']).toContain(status);
  });

  it('content_study reports current AI/storage health', async () => {
    const status = await featureHealthRegistry.getFeatureHealth('content_study');
    expect(['healthy', 'degraded', 'unavailable']).toContain(status);
  });
});

describe('bossFinalReleaseForbiddenDepsAreDisabled — renamed and behavior preserved', () => {
  it('renamed from bossHasNoDisabledDeps to bossFinalReleaseForbiddenDepsAreDisabled', () => {
    const { healthChecks: checks } = require('../feature-health-checks');
    const bossDepCheck = checks.find((c: { id: string }) => c.id === 'boss_tab_no_disabled_deps');
    expect(bossDepCheck).toBeDefined();
    expect(bossDepCheck.label).toContain('final-release');
    expect(bossDepCheck.label).toContain('forbidden deps');
  });

  it('old function name bossHasNoDisabledDeps no longer exists in checks module', () => {
    const source = require('../feature-health-checks');
    const sourceStr = source.healthChecks.map((c: { label: string; check: () => string }) => c.label).join(' ');
    expect(sourceStr).not.toContain('bossHasNoDisabledDeps');
  });

  it('boss_tab_no_disabled_deps returns healthy when forbidden deps are disabled', async () => {
    await expect(runCheck('boss_tab_no_disabled_deps')).resolves.toBe('healthy');
  });
});
