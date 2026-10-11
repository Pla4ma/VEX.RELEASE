import { accessFor } from './debloat-test-helpers';

describe('Risk 4 — Route registration enforcement', () => {
  it('all day-one routes are registered through FeatureAvailability', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');

    const locked = accessFor(0);
    const gatedCount = FEATURE_ROUTE_REGISTRY.filter(
      (r: { route: string }) => !canRegisterFeatureRoute(locked, r.route),
    ).length;
    expect(gatedCount).toBe(0);

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter((r: { feature: string }) =>
      canRegisterFeatureRoute(unlocked, r.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('day-one feature routes are registered while archived routes stay absent', () => {
    const {
      canNavigateToRegisteredRoute,
    } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'Challenges')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'ContentStudy')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'Mastery')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'CompanionDetail')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'Shop')).toBe(false);
  });

  it('core navigation routes always available (Home, Settings, etc.)', () => {
    const {
      canNavigateToRegisteredRoute,
    } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SettingsMain')).toBe(true);
    expect(
      canNavigateToRegisteredRoute(features, 'SessionStack.SessionSetup'),
    ).toBe(true);
  });
});
