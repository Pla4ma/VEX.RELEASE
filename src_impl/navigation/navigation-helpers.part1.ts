import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { createDebugger } from "../utils/debug";
import * as Sentry from "@sentry/react-native";
import type { AuthStackParams, AuthStackRoute, MainStackParams, MainStackRoute, MainTabParams, MainTabRoute, RootStackParams, RootStackRoute, SessionStackParams, SessionStackRoute, SettingsStackParams, SettingsStackRoute } from "./types";


export function navigateToRootScreen(
  navigation: NavigationProp<RootStackParams>,
  route: RootStackRoute,
  params?: RootStackParams[RootStackRoute]
): void {
  debug.info('Navigating to root screen: %s', route);

  if (params) {
    navigation.navigate(route as unknown as string, params);
  } else {
    navigation.navigate(route as unknown as string);
  }
}

export function navigateToAuthScreen(
  navigation: NavigationProp<RootStackParams>,
  route: AuthStackRoute,
  params?: AuthStackParams[AuthStackRoute]
): void {
  debug.info('Navigating to auth screen: %s', route);

  type AuthNavParams = { screen: AuthStackRoute; params?: AuthStackParams[AuthStackRoute] };
  const navParams: AuthNavParams = params ? { screen: route, params } : { screen: route };
  navigation.navigate('Auth', navParams as unknown as object);
}

export function navigateToMainTab(
  navigation: NavigationProp<RootStackParams>,
  route: MainTabRoute,
  params?: MainTabParams[MainTabRoute]
): void {
  debug.info('Navigating to main tab: %s', route);

  type MainNavParams = { screen: MainTabRoute; params?: MainTabParams[MainTabRoute] };
  const navParams: MainNavParams = params ? { screen: route, params } : { screen: route };
  navigation.navigate('Main', navParams as unknown as object);
}

export function navigateToMainStackScreen(
  navigation: NavigationProp<MainStackParams>,
  route: MainStackRoute,
  params?: MainStackParams[MainStackRoute]
): void {
  debug.info('Navigating to main stack screen: %s', route);

  if (params) {
    navigation.navigate(route as unknown as string, params as unknown as object);
  } else {
    navigation.navigate(route as unknown as string);
  }
}

export function navigateToSessionStackScreen(
  navigation: NavigationProp<RootStackParams>,
  route: SessionStackRoute,
  params?: SessionStackParams[SessionStackRoute]
): void {
  debug.info('Navigating to session stack: %s', route);

  type SessionNavParams = { screen: SessionStackRoute; params?: SessionStackParams[SessionStackRoute] };
  const navParams: SessionNavParams = params ? { screen: route, params } : { screen: route };
  navigation.navigate('SessionStack', navParams as unknown as { screen: SessionStackRoute; params?: SessionStackParams[SessionStackRoute] });
}

export function navigateToSettingsStackScreen(
  navigation: NavigationProp<RootStackParams>,
  route: SettingsStackRoute,
  params?: SettingsStackParams[SettingsStackRoute]
): void {
  debug.info('Navigating to settings stack: %s', route);

  type SettingsNavParams = { screen: SettingsStackRoute; params?: SettingsStackParams[SettingsStackRoute] };
  const navParams: SettingsNavParams = params ? { screen: route, params } : { screen: route };
  navigation.navigate('Settings', navParams as unknown as object);
}

export function getRootRouteParams<Route extends RootStackRoute>(
  route: RouteProp<RootStackParams, Route>
): RootStackParams[Route] {
  return route.params as RootStackParams[Route];
}

export function getAuthRouteParams<Route extends AuthStackRoute>(
  route: RouteProp<AuthStackParams, Route>
): AuthStackParams[Route] {
  return route.params as AuthStackParams[Route];
}

export function getMainStackRouteParams<Route extends MainStackRoute>(
  route: RouteProp<MainStackParams, Route>
): MainStackParams[Route] {
  return route.params as MainStackParams[Route];
}

export function getSessionStackRouteParams<Route extends SessionStackRoute>(
  route: RouteProp<SessionStackParams, Route>
): SessionStackParams[Route] {
  return route.params as SessionStackParams[Route];
}

export function getSettingsStackRouteParams<Route extends SettingsStackRoute>(
  route: RouteProp<SettingsStackParams, Route>
): SettingsStackParams[Route] {
  return route.params as SettingsStackParams[Route];
}

export function isNavigationReady(
  navigation: NavigationProp<Record<string, object | undefined>> | null | undefined
): navigation is NavigationProp<Record<string, object | undefined>> {
  return navigation !== null && navigation !== undefined && typeof navigation.navigate === 'function';
}

export function safeNavigate(
  navigation: NavigationProp<Record<string, object | undefined>> | null | undefined,
  screen: string,
  params?: Record<string, unknown>
): boolean {
  if (!isNavigationReady(navigation)) {
    debug.warn('Navigation not ready, cannot navigate to %s', screen);
    return false;
  }

  try {
    navigation.navigate(screen, params);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error('Navigation failed: %s', new Error(errorMessage));
    return false;
  }
}

export function isCurrentRoute(
  routeName: string | undefined,
  expectedRoute: string
): boolean {
  return routeName === expectedRoute;
}

export function getCurrentRouteName(
  navigationState: { routes: Array<{ name: string }>; index: number } | undefined
): string | undefined {
  if (!navigationState) {
    return undefined;
  }

  const currentRoute = navigationState.routes[navigationState.index];
  return currentRoute?.name;
}

export function canGoBack(navigation: NavigationProp<Record<string, object | undefined>>): boolean {
  return navigation.canGoBack();
}

export function safeGoBack(navigation: NavigationProp<Record<string, object | undefined>> | null | undefined): boolean {
  if (!isNavigationReady(navigation)) {
    return false;
  }

  if (!navigation.canGoBack()) {
    debug.warn('Cannot go back - no routes in history');
    return false;
  }

  navigation.goBack();
  return true;
}