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

  it('keeps the full Boss route unregistered until its FeatureAvailability allows it', () => {
    const locked: FeatureAccessMap = buildFeatureAccess({
      totalCompletedSessions: 0,
    }).features;
    const unlocked = buildFeatureAccess({
      totalCompletedSessions: 7,
    }).features;

    expect(canRegisterFeatureRoute(locked, 'Boss')).toBe(false);
    expect(canRegisterFeatureRoute(locked, 'ContentStudy')).toBe(true);
    expect(canRegisterFeatureRoute(locked, 'Challenges')).toBe(true);
    expect(canRegisterFeatureRoute(unlocked, 'Boss')).toBe(true);
  });

  it('does not register feature routes when their access map is unavailable', () => {
    const locked: FeatureAccessMap = {} as FeatureAccessMap;

    FEATURE_ROUTE_REGISTRY.forEach(({ route }) => {
      expect(canRegisterFeatureRoute(locked, route)).toBe(false);
    });
  });

  it('prevents navigation to unavailable registered feature routes', () => {
    const features: FeatureAccessMap = {} as FeatureAccessMap;

    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'AICoach')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
  });
});
