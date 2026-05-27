import { accessFor } from './debloat-test-helpers';

describe('Risk 4 — Route registration enforcement', () => {
  it('all progressive routes gated by FeatureAvailability', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');

    const locked = accessFor(0);
    for (const { route } of FEATURE_ROUTE_REGISTRY) {
      expect(canRegisterFeatureRoute(locked, route)).toBe(false);
    }

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter(
      (r: { feature: string }) => canRegisterFeatureRoute(unlocked, r.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('hidden features never have registered routes', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Challenges')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'AICoach')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'ContentStudy')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Mastery')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'CompanionDetail')).toBe(false);
  });

  it('core navigation routes always available (Home, Settings, etc.)', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SettingsMain')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SessionStack.SessionSetup')).toBe(true);
  });
});
