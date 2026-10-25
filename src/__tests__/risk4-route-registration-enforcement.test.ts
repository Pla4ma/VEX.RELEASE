import { accessFor } from './product-journey-debloat-personalization-helpers';

describe('Risk 4 — Route registration enforcement', () => {
  it('routes are registered only when FeatureAvailability permits them', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');

    const dayZero = accessFor(0);
    const gatedRoutes = FEATURE_ROUTE_REGISTRY.filter(
      (route: { route: string }) => !canRegisterFeatureRoute(dayZero, route.route),
    ).map((route: { route: string }) => route.route);
    expect(gatedRoutes).toContain('Boss');
    expect(gatedRoutes).toHaveLength(1);

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter((route: { feature: string }) =>
      canRegisterFeatureRoute(unlocked, route.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('day-one routes remain navigable while progressive and archived routes stay blocked', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
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
