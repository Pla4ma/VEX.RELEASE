import type { RouteProp } from '@react-navigation/native';
import { createDebugger } from '../utils/debug';
import { validateRouteParams } from './route-param-schemas';
import type {
  AuthStackParams,
  AuthStackRoute,
  MainStackParams,
  MainStackRoute,
  MainTabParams,
  MainTabRoute,
  RootStackParams,
  RootStackRoute,
  SessionStackParams,
  SessionStackRoute,
  SettingsStackParams,
  SettingsStackRoute,
} from './types';
type NavigationLike = {
  navigate: (...args: never[]) => void;
  getParent?: () => NavigationLike | undefined;
};
const debug = createDebugger('navigation:helpers');

function resolveRootNavigation(navigation: NavigationLike): NavigationLike {
  let current = navigation;
  let parent = current.getParent?.();
  while (parent) {
    current = parent;
    parent = current.getParent?.();
  }
  return current;
}

export {
  isNavigationReady,
  safeNavigate,
  isCurrentRoute,
  getCurrentRouteName,
  canGoBack,
  safeGoBack,
} from './navigation-safety';
export {
  validateDeepLinkParams,
  navigateWithValidation,
} from './navigation-deep-links';
export type { DeepLinkValidationResult } from './navigation-deep-links';

/**
 * Type-safe navigation to a root screen.
 * Uses a conditional call to avoid `as never` — when params are undefined
 * we call the single-argument overload; otherwise the two-argument one.
 */
export function navigateToRootScreen<Route extends RootStackRoute>(
  navigation: NavigationLike,
  route: Route,
  params?: RootStackParams[Route],
): void {
  debug.info('Navigating to root screen: %s', route);
  const rootNavigation = resolveRootNavigation(navigation);
  if (params !== undefined) {
    (rootNavigation.navigate as (name: Route, params: RootStackParams[Route]) => void)(route, params);
  } else {
    (rootNavigation.navigate as (name: Route) => void)(route);
  }
}

/**
 * Type-safe navigation to an auth sub-screen.
 * `AuthStackRoute` is already a union of valid auth screen names,
 * so we use it directly instead of `as string`.
 */
export function navigateToAuthScreen<Route extends AuthStackRoute>(
  navigation: NavigationLike,
  route: Route,
  params?: AuthStackParams[Route],
): void {
  debug.info('Navigating to auth screen: %s', route);
  navigateToRootScreen(navigation, 'Auth', { screen: route, params } as RootStackParams['Auth']);
}

/**
 * Type-safe navigation to a main tab.
 * `MainTabRoute` is already a union of valid tab names,
 * so we use it directly instead of `as string`.
 */
export function navigateToMainTab<Route extends MainTabRoute>(
  navigation: NavigationLike,
  route: Route,
  params?: MainTabParams[Route],
): void {
  debug.info('Navigating to main tab: %s', route);
  navigateToRootScreen(navigation, 'Main', { screen: route, params } as RootStackParams['Main']);
}

/**
 * Type-safe navigation to a main stack screen.
 * Uses the same conditional-call pattern as navigateToRootScreen.
 */
export function navigateToMainStackScreen<Route extends MainStackRoute>(
  navigation: NavigationLike,
  route: Route,
  params?: MainStackParams[Route],
): void {
  debug.info('Navigating to main stack screen: %s', route);
  const rootNavigation = resolveRootNavigation(navigation);
  if (params !== undefined) {
    (rootNavigation.navigate as (name: Route, params: MainStackParams[Route]) => void)(route, params);
  } else {
    (rootNavigation.navigate as (name: Route) => void)(route);
  }
}
export function navigateToSessionStackScreen(
  navigation: NavigationLike,
  route: SessionStackRoute,
  params?: SessionStackParams[SessionStackRoute],
): void {
  debug.info('Navigating to session stack: %s', route);
  navigateToRootScreen(navigation, 'SessionStack', { screen: route, params } as RootStackParams['SessionStack']);
}
export function navigateToSettingsStackScreen(
  navigation: NavigationLike,
  route: SettingsStackRoute,
  params?: SettingsStackParams[SettingsStackRoute],
): void {
  debug.info('Navigating to settings stack: %s', route);
  navigateToRootScreen(navigation, 'Settings', { screen: route, params } as RootStackParams['Settings']);
}
export function getRootRouteParams<Route extends RootStackRoute>(
  route: RouteProp<RootStackParams, Route>,
): RootStackParams[Route] {
  return validateRouteParams(
    route.name,
    route.params,
  ) as RootStackParams[Route];
}
export function getAuthRouteParams<Route extends AuthStackRoute>(
  route: RouteProp<AuthStackParams, Route>,
): AuthStackParams[Route] {
  return validateRouteParams(
    route.name,
    route.params,
  ) as AuthStackParams[Route];
}
export function getMainStackRouteParams<Route extends MainStackRoute>(
  route: RouteProp<MainStackParams, Route>,
): MainStackParams[Route] {
  return validateRouteParams(
    route.name,
    route.params,
  ) as MainStackParams[Route];
}
export function getSessionStackRouteParams<Route extends SessionStackRoute>(
  route: RouteProp<SessionStackParams, Route>,
): SessionStackParams[Route] {
  return validateRouteParams(
    route.name,
    route.params,
  ) as SessionStackParams[Route];
}
export function getSettingsStackRouteParams<Route extends SettingsStackRoute>(
  route: RouteProp<SettingsStackParams, Route>,
): SettingsStackParams[Route] {
  return validateRouteParams(
    route.name,
    route.params,
  ) as SettingsStackParams[Route];
}
