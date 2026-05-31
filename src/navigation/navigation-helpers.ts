import type { NavigationProp, RouteProp } from '@react-navigation/native';
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
const debug = createDebugger('navigation:helpers');

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

export function navigateToRootScreen(
  navigation: NavigationProp<RootStackParams>,
  route: RootStackRoute,
  params?: RootStackParams[RootStackRoute],
): void {
  debug.info('Navigating to root screen: %s', route);
  if (params !== undefined) {
    navigation.navigate(route as string, params as Record<string, unknown>);
  } else {
    navigation.navigate(route as never);
  }
}
export function navigateToAuthScreen(
  navigation: NavigationProp<RootStackParams>,
  route: AuthStackRoute,
  params?: AuthStackParams[AuthStackRoute],
): void {
  debug.info('Navigating to auth screen: %s', route);
  navigation.navigate('Auth', { screen: route as string, params });
}
export function navigateToMainTab(
  navigation: NavigationProp<RootStackParams>,
  route: MainTabRoute,
  params?: MainTabParams[MainTabRoute],
): void {
  debug.info('Navigating to main tab: %s', route);
  navigation.navigate('Main', { screen: route as string, params });
}
export function navigateToMainStackScreen<Route extends MainStackRoute>(
  navigation: NavigationProp<MainStackParams>,
  route: Route,
  params?: MainStackParams[Route],
): void {
  debug.info('Navigating to main stack screen: %s', route);
  if (params !== undefined) {
    navigation.navigate(route as string, params as Record<string, unknown>);
  } else {
    navigation.navigate(route as never);
  }
}
export function navigateToSessionStackScreen(
  navigation: NavigationProp<RootStackParams>,
  route: SessionStackRoute,
  params?: SessionStackParams[SessionStackRoute],
): void {
  debug.info('Navigating to session stack: %s', route);
  navigation.navigate('SessionStack', { screen: route, params });
}
export function navigateToSettingsStackScreen(
  navigation: NavigationProp<RootStackParams>,
  route: SettingsStackRoute,
  params?: SettingsStackParams[SettingsStackRoute],
): void {
  debug.info('Navigating to settings stack: %s', route);
  navigation.navigate('Settings', { screen: route, params });
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
