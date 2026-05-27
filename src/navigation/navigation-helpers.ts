import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { createDebugger } from "../utils/debug";
import * as Sentry from "@sentry/react-native";
import { validateRouteParams } from "./route-param-schemas";
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
} from "./types";
const debug = createDebugger("navigation:helpers");

export function navigateToRootScreen(
  navigation: NavigationProp<RootStackParams>,
  route: RootStackRoute,
  params?: RootStackParams[RootStackRoute],
): void {
  debug.info("Navigating to root screen: %s", route);
  if (params !== undefined) {
    navigation.navigate(route as string, params as Record<string, unknown>);
  } else {
    navigation.navigate(route as string);
  }
}
export function navigateToAuthScreen(
  navigation: NavigationProp<RootStackParams>,
  route: AuthStackRoute,
  params?: AuthStackParams[AuthStackRoute],
): void {
  debug.info("Navigating to auth screen: %s", route);
  navigation.navigate("Auth", { screen: route, params });
}
export function navigateToMainTab(
  navigation: NavigationProp<RootStackParams>,
  route: MainTabRoute,
  params?: MainTabParams[MainTabRoute],
): void {
  debug.info("Navigating to main tab: %s", route);
  navigation.navigate("Main", { screen: route, params });
}
export function navigateToMainStackScreen<Route extends MainStackRoute>(
  navigation: NavigationProp<MainStackParams>,
  route: Route,
  params?: MainStackParams[Route],
): void {
  debug.info("Navigating to main stack screen: %s", route);
  if (params !== undefined) {
    navigation.navigate(route as string, params as Record<string, unknown>);
  } else {
    navigation.navigate(route as string);
  }
}
export function navigateToSessionStackScreen(
  navigation: NavigationProp<RootStackParams>,
  route: SessionStackRoute,
  params?: SessionStackParams[SessionStackRoute],
): void {
  debug.info("Navigating to session stack: %s", route);
  navigation.navigate("SessionStack", { screen: route, params });
}
export function navigateToSettingsStackScreen(
  navigation: NavigationProp<RootStackParams>,
  route: SettingsStackRoute,
  params?: SettingsStackParams[SettingsStackRoute],
): void {
  debug.info("Navigating to settings stack: %s", route);
  navigation.navigate("Settings", { screen: route, params });
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
export function isNavigationReady(
  navigation:
    | NavigationProp<Record<string, object | undefined>>
    | null
    | undefined,
): navigation is NavigationProp<Record<string, object | undefined>> {
  return (
    navigation !== null &&
    navigation !== undefined &&
    typeof navigation.navigate === "function"
  );
}
export function safeNavigate(
  navigation:
    | NavigationProp<Record<string, object | undefined>>
    | null
    | undefined,
  screen: string,
  params?: Record<string, unknown>,
): boolean {
  if (!isNavigationReady(navigation)) {
    debug.warn("Navigation not ready, cannot navigate to %s", screen);
    return false;
  }
  try {
    navigation.navigate(screen, params);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error("Navigation failed: %s", new Error(errorMessage));
    return false;
  }
}
export function isCurrentRoute(
  routeName: string | undefined,
  expectedRoute: string,
): boolean {
  return routeName === expectedRoute;
}
export function getCurrentRouteName(
  navigationState:
    | { routes: Array<{ name: string }>; index: number }
    | undefined,
): string | undefined {
  if (!navigationState) {
    return undefined;
  }
  const currentRoute = navigationState.routes[navigationState.index];
  return currentRoute?.name;
}
export function canGoBack(
  navigation: NavigationProp<Record<string, object | undefined>>,
): boolean {
  return navigation.canGoBack();
}
export function safeGoBack(
  navigation:
    | NavigationProp<Record<string, object | undefined>>
    | null
    | undefined,
): boolean {
  if (!isNavigationReady(navigation)) {
    return false;
  }
  if (!navigation.canGoBack()) {
    debug.warn("Cannot go back - no routes in history");
    return false;
  }
  navigation.goBack();
  return true;
}
const VALID_ROUTE_PATTERNS: Record<string, string[]> = {
  mainTabs: ["Home", "Focus", "Progress", "Profile"],
  sessionRoutes: [
    "SessionSetup",
    "ActiveSession",
    "SessionComplete",
    "SessionHistory",
  ],
  studyRoutes: ["ContentInput", "StudyPlan", "StudyLibrary", "ContentReview"],
  settingsRoutes: ["SettingsMain", "ProfileEdit", "Notifications", "Premium"],
  authRoutes: ["Login", "Signup", "ForgotPassword"],
};
export interface DeepLinkValidationResult {
  isValid: boolean;
  sanitizedParams?: Record<string, unknown>;
  error?: string;
  fallbackRoute?: string;
}
export function validateDeepLinkParams(
  route: string,
  params?: Record<string, unknown>,
): DeepLinkValidationResult {
  const isValidRoute = Object.values(VALID_ROUTE_PATTERNS).some((routes) =>
    routes.includes(route),
  );
  if (!isValidRoute) {
    debug.warn("Invalid deep link route: %s", route);
    return {
      isValid: false,
      error: `Unknown route: ${route}`,
      fallbackRoute: "Home",
    };
  }
  const sanitizedParams = params ? sanitizeParams(params) : undefined;
  try {
    validateRouteParams(route, sanitizedParams);
    return { isValid: true, sanitizedParams };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid route params";
    return {
      isValid: false,
      error: message,
      fallbackRoute: route.startsWith("Session") ? "SessionSetup" : "Home",
    };
  }
}
function sanitizeParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "function" || typeof value === "symbol") {
      continue;
    }
    if (typeof value === "string") {
      sanitized[key] = value.replace(/[<>]/g, "").slice(0, 1000);
      continue;
    }
    if (["boolean", "number"].includes(typeof value) || value === null) {
      sanitized[key] = value;
      continue;
    }
    if (typeof value === "object" && value !== null) {
      if (key === "studyPlan" || key === "sessionConfig") {
        sanitized[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }
  return sanitized;
}
export function navigateWithValidation(
  navigation: NavigationProp<RootStackParams> | null | undefined,
  route: string,
  params?: Record<string, unknown>,
): { success: boolean; error?: string; usedFallback?: boolean } {
  if (!navigation) {
    return { success: false, error: "Navigation not available" };
  }
  const validation = validateDeepLinkParams(route, params);
  if (!validation.isValid) {
    debug.warn(
      "Deep link validation failed: %s, falling back to %s",
      validation.error,
      validation.fallbackRoute,
    );
    if (validation.fallbackRoute) {
      try {
        navigation.navigate(validation.fallbackRoute as string);
        return { success: true, usedFallback: true };
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: "navigation", operation: "fallbackNavigation" },
        });
        return { success: false, error: "Fallback navigation failed" };
      }
    }
    return { success: false, error: validation.error };
  }
  try {
    navigation.navigate(route as string, validation.sanitizedParams);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error(
      "Navigation failed after validation: %s",
      new Error(errorMessage),
    );
    return { success: false, error: errorMessage };
  }
}
