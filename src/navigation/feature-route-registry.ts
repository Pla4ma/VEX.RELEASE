import {
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  type FeatureAccessMap,
  type FeatureKey,
} from '../features/liveops-config';
import type { ExtendedRootStackParams, MainStackRoute } from './types';

export type RegisteredFeatureRoute =
  | 'AICoach'
  | 'Boss'
  | 'Challenges'
  | 'CompanionDetail'
  | 'ContentStudy'
  | 'Mastery'
  | 'MemoryConsole';

export type FeatureRouteConfig = {
  feature: FeatureKey;
  route: RegisteredFeatureRoute;
};

export const FEATURE_ROUTE_REGISTRY = [
  { feature: 'companion_detail', route: 'CompanionDetail' },
  { feature: 'boss_tab', route: 'Boss' },
  { feature: 'challenges', route: 'Challenges' },
  { feature: 'ai_coach_advanced', route: 'AICoach' },
  { feature: 'achievements', route: 'Mastery' },
  { feature: 'content_study', route: 'ContentStudy' },
  { feature: 'memory_console', route: 'MemoryConsole' },
] as const satisfies readonly FeatureRouteConfig[];

export type FeatureRouteName = typeof FEATURE_ROUTE_REGISTRY[number]['route'];

export const MAIN_STACK_FEATURE_ROUTES = [
  'AICoach',
  'Boss',
  'Challenges',
  'ContentStudy',
  'Mastery',
  'MemoryConsole',
] as const satisfies readonly MainStackRoute[];

export function getFeatureForRoute(route: string): FeatureKey | null {
  return FEATURE_ROUTE_REGISTRY.find((item) => item.route === route)?.feature ?? null;
}

export function canRegisterFeatureRoute(
  features: FeatureAccessMap,
  route: FeatureRouteName,
): boolean {
  const feature = getFeatureForRoute(route);
  if (!feature) {
    return false;
  }
  return isFeatureAvailableForNavigation(getFeatureAvailabilityFor(feature, features[feature]));
}

export function canNavigateToRegisteredRoute(
  features: FeatureAccessMap,
  route: keyof ExtendedRootStackParams | string,
): boolean {
  const feature = getFeatureForRoute(String(route));
  if (!feature) {
    return true;
  }
  return isFeatureAvailableForNavigation(getFeatureAvailabilityFor(feature, features[feature]));
}

const ARCHIVED_ROUTE_SET: ReadonlySet<string> = new Set([
  'Guild',
  'Shop',
  'Inventory',
  'Vault',
  'PostSessionStory',
]);

export function isNotArchivedRoute(route: string): boolean {
  return !ARCHIVED_ROUTE_SET.has(route);
}
