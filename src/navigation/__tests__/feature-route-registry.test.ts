import { buildFeatureAccess } from '../../features/liveops-config/feature-access';
import {
  FEATURE_ROUTE_REGISTRY,
  MAIN_STACK_FEATURE_ROUTES,
  canNavigateToRegisteredRoute,
  canRegisterFeatureRoute,
} from '../feature-route-registry';
import type { MainStackParams } from '../types';
import type { FeatureAccessMap } from '../../features/liveops-config/feature-access-types';

describe('feature route registry', () => {
  it('keeps every main feature route present in MainStackParams', () => {
    const routes = MAIN_STACK_FEATURE_ROUTES;
    routes.forEach((route) => {
      const typedRoute: keyof MainStackParams = route;
      expect(typeof typedRoute).toBe('string');
    });
  });

  it('registers feature routes only when FeatureAvailability allows it', () => {
    const locked: FeatureAccessMap = {} as FeatureAccessMap;
    const unlocked = buildFeatureAccess({
      totalCompletedSessions: 12,
    }).features;

    FEATURE_ROUTE_REGISTRY.forEach(({ route }) => {
      expect(canRegisterFeatureRoute(locked, route)).toBe(false);
    });

    expect(canRegisterFeatureRoute(unlocked, 'Boss')).toBe(true);
    expect(canRegisterFeatureRoute(unlocked, 'Challenges')).toBe(true);
    expect(canRegisterFeatureRoute(unlocked, 'ContentStudy')).toBe(true);
  });

  it('prevents navigation to unavailable registered feature routes', () => {
    const features: FeatureAccessMap = {} as FeatureAccessMap;

    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'AICoach')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
  });
});
