import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { createDebugger } from "../utils/debug";
import * as Sentry from "@sentry/react-native";
import type { AuthStackParams, AuthStackRoute, MainStackParams, MainStackRoute, MainTabParams, MainTabRoute, RootStackParams, RootStackRoute, SessionStackParams, SessionStackRoute, SettingsStackParams, SettingsStackRoute } from "./types";


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