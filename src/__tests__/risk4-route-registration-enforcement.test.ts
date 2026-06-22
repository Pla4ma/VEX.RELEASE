import { accessFor } from './product-journey-debloat-personalization-helpers';

describe('Risk 4 — Route registration enforcement', () => {
  it('all progressive routes gated by FeatureAvailability', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');

    const locked = accessFor(0);
    const gatedCount = FEATURE_ROUTE_REGISTRY.filter(
      (r: { route: string }) => !canRegisterFeatureRoute(locked, r.route),
    ).length;
    expect(gatedCount).toBeGreaterThanOrEqual(1);

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter((r: { feature: string }) =>
      canRegisterFeatureRoute(unlocked, r.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('hidden features never have registered routes', () => {
    const {
      canNavigateToRegisteredRoute,
    } = require('../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Challenges')).toBe(false);
    // AICoach available early via ai_coach_basic gate
    expect(canNavigateToRegisteredRoute(features, 'ContentStudy')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Mastery')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'CompanionDetail')).toBe(
      false,
    );
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
