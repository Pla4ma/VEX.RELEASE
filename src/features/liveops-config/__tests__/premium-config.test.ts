import { getAllEntries } from '../classification-codec';
import { FEATURE_THRESHOLDS, FEATURE_RELEASE_STATES } from '../feature-access-config';
import type { FeatureKey } from '../feature-access';
import { getFeatureStatus } from '../final-release-feature-map';

describe('Classification — premium config matches classification source', () => {
  it('premium_paywall minSessions=40 in classification', () => {
    const paywall = getAllEntries().find((e) => e.systemId === 'premium_paywall');
    expect(paywall).toBeDefined();
    expect(paywall!.minSessions).toBe(40);
  });

  it('premium_gated features in feature map have progressive status', () => {
    const premiumFeatures = getAllEntries()
      .filter((e) => e.premiumCopyAllowed && typeof e.featureKey === 'string');

    for (const entry of premiumFeatures) {
      const status = getFeatureStatus(entry.featureKey as FeatureKey);
      expect(['progressive', 'premium_gated', 'included']).toContain(status);
    }
  });

  it('premium paywall threshold matches classification', () => {
    expect(FEATURE_THRESHOLDS.premium_paywall).toBe(40);
  });

  it('premiumCopyAllowed entries have appropriate feature-key release states', () => {
    const premiumSystems = getAllEntries()
      .filter((e) => e.premiumCopyAllowed && typeof e.featureKey === 'string');

    for (const entry of premiumSystems) {
      const state = FEATURE_RELEASE_STATES[entry.featureKey as FeatureKey];
      expect(state).toBeDefined();
    }
  });
});
