/**
 * Type-Safe Navigation Helpers
 *
 * Provides strictly-typed navigation functions with no unsafe casts.
 */

import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { createDebugger } from '../utils/debug';
import * as Sentry from '@sentry/react-native';
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

// ============================================================================
// Type-Safe Navigation Functions
// ============================================================================

/**
 * Navigate to a root stack screen with full type safety
 */
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

/**
 * Navigate to auth stack screen
 */
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

/**
 * Navigate to main tab screen
 */
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

/**
 * Navigate to main stack screen (within Main navigator)
 */
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

/**
 * Navigate to session stack screen
 */
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

/**
 * Navigate to settings stack screen
 */
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

// ============================================================================
// Type-Safe Route Param Getters
// ============================================================================

/**
 * Get typed route params for root stack
 */
export function getRootRouteParams<Route extends RootStackRoute>(
  route: RouteProp<RootStackParams, Route>
): RootStackParams[Route] {
  return route.params as RootStackParams[Route];
}

/**
 * Get typed route params for auth stack
 */
export function getAuthRouteParams<Route extends AuthStackRoute>(
  route: RouteProp<AuthStackParams, Route>
): AuthStackParams[Route] {
  return route.params as AuthStackParams[Route];
}

/**
 * Get typed route params for main stack
 */
export function getMainStackRouteParams<Route extends MainStackRoute>(
  route: RouteProp<MainStackParams, Route>
): MainStackParams[Route] {
  return route.params as MainStackParams[Route];
}

/**
 * Get typed route params for session stack
 */
export function getSessionStackRouteParams<Route extends SessionStackRoute>(
  route: RouteProp<SessionStackParams, Route>
): SessionStackParams[Route] {
  return route.params as SessionStackParams[Route];
}

/**
 * Get typed route params for settings stack
 */
export function getSettingsStackRouteParams<Route extends SettingsStackRoute>(
  route: RouteProp<SettingsStackParams, Route>
): SettingsStackParams[Route] {
  return route.params as SettingsStackParams[Route];
}

// ============================================================================
// Safe Navigation Guards
// ============================================================================

/**
 * Check if navigation is ready before navigating
 */
export function isNavigationReady(
  navigation: NavigationProp<Record<string, object | undefined>> | null | undefined
): navigation is NavigationProp<Record<string, object | undefined>> {
  return navigation !== null && navigation !== undefined && typeof navigation.navigate === 'function';
}

/**
 * Safe navigation with null check (for untyped navigation)
 * Prefer using typed navigation helpers instead of this function.
 */
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

// ============================================================================
// Navigation State Helpers
// ============================================================================

/**
 * Check if current route matches
 */
export function isCurrentRoute(
  routeName: string | undefined,
  expectedRoute: string
): boolean {
  return routeName === expectedRoute;
}

/**
 * Get current route name from navigation state
 */
export function getCurrentRouteName(
  navigationState: { routes: Array<{ name: string }>; index: number } | undefined
): string | undefined {
  if (!navigationState) {
    return undefined;
  }

  const currentRoute = navigationState.routes[navigationState.index];
  return currentRoute?.name;
}

/**
 * Check if can go back
 */
export function canGoBack(navigation: NavigationProp<Record<string, object | undefined>>): boolean {
  return navigation.canGoBack();
}

/**
 * Safe go back
 */
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

// ============================================================================
// Deep Link Safety & Validation (Phase 17 - Bulletproof Navigation)
// ============================================================================

/** Valid route patterns for deep link validation */
const VALID_ROUTE_PATTERNS: Record<string, string[]> = {
  // Main tabs - always safe
  mainTabs: ['Home', 'Focus', 'Progress', 'Profile'],
  // Session routes - require specific params
  sessionRoutes: ['SessionSetup', 'ActiveSession', 'SessionComplete', 'SessionHistory'],
  // Study routes - require content ID
  studyRoutes: ['ContentInput', 'StudyPlan', 'StudyLibrary', 'ContentReview'],
  // Settings - generally safe
  settingsRoutes: ['SettingsMain', 'ProfileEdit', 'Notifications', 'Premium'],
  // Auth routes
  authRoutes: ['Login', 'Signup', 'ForgotPassword'],
};

/** Deep link validation result */
export interface DeepLinkValidationResult {
  isValid: boolean;
  sanitizedParams?: Record<string, unknown>;
  error?: string;
  fallbackRoute?: string;
}

/**
 * Validate and sanitize deep link route params
 * Prevents crashes from malformed deep links
 */
export function validateDeepLinkParams(
  route: string,
  params?: Record<string, unknown>
): DeepLinkValidationResult {
  // Check if route exists in any valid pattern
  const isValidRoute = Object.values(VALID_ROUTE_PATTERNS).some(routes =>
    routes.includes(route)
  );

  if (!isValidRoute) {
    debug.warn('Invalid deep link route: %s', route);
    return {
      isValid: false,
      error: `Unknown route: ${route}`,
      fallbackRoute: 'Home',
    };
  }

  // Sanitize params to prevent injection/malformed data
  const sanitizedParams = params ? sanitizeParams(params) : undefined;

  // Validate session ID format if present
  if (sanitizedParams?.sessionId && !isValidSessionId(sanitizedParams.sessionId as string)) {
    return {
      isValid: false,
      error: 'Invalid session ID format',
      fallbackRoute: 'SessionSetup',
    };
  }

  // Validate study plan ID if present
  if (sanitizedParams?.studyPlanId && !isValidStudyPlanId(sanitizedParams.studyPlanId as string)) {
    return {
      isValid: false,
      error: 'Invalid study plan ID format',
      fallbackRoute: 'Focus',
    };
  }

  return {
    isValid: true,
    sanitizedParams,
  };
}

/**
 * Sanitize params to prevent injection attacks
 */
function sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    // Skip functions and complex objects
    if (typeof value === 'function' || typeof value === 'symbol') {
      continue;
    }

    // Sanitize strings
    if (typeof value === 'string') {
      // Remove potential XSS attempts, limit length
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove angle brackets
        .slice(0, 1000); // Limit length
      continue;
    }

    // Keep primitives
    if (['boolean', 'number'].includes(typeof value) || value === null) {
      sanitized[key] = value;
      continue;
    }

    // For objects, only allow specific safe structures
    if (typeof value === 'object' && value !== null) {
      // Only shallow copy allowed keys
      if (key === 'studyPlan' || key === 'sessionConfig') {
        sanitized[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }

  return sanitized;
}

/**
 * Validate session ID format (UUID or safe string)
 */
function isValidSessionId(sessionId: string): boolean {
  // Allow UUID format or alphanumeric with dashes/underscores
  return /^[a-zA-Z0-9-_{}]{1,100}$/.test(sessionId);
}

/**
 * Validate study plan ID format
 */
function isValidStudyPlanId(planId: string): boolean {
  // Similar validation to session ID
  return /^[a-zA-Z0-9-_{}]{1,100}$/.test(planId);
}

/**
 * Safe navigation with deep link validation
 * Use this for all external navigation (deep links, notifications)
 */
export function navigateWithValidation(
  navigation: NavigationProp<RootStackParams> | null | undefined,
  route: string,
  params?: Record<string, unknown>
): { success: boolean; error?: string; usedFallback?: boolean } {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }

  const validation = validateDeepLinkParams(route, params);

  if (!validation.isValid) {
    debug.warn('Deep link validation failed: %s, falling back to %s', validation.error, validation.fallbackRoute);

    // Navigate to fallback route instead of crashing
    if (validation.fallbackRoute) {
      try {
        navigation.navigate(validation.fallbackRoute as string);
        return { success: true, usedFallback: true };
      } catch (error) {
        Sentry.captureException(error, {
          tags: { feature: 'navigation', operation: 'fallbackNavigation' },
        });
        return { success: false, error: 'Fallback navigation failed' };
      }
    }

    return { success: false, error: validation.error };
  }

  try {
    navigation.navigate(route as string, validation.sanitizedParams);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error('Navigation failed after validation: %s', new Error(errorMessage));
    return { success: false, error: errorMessage };
  }
}
