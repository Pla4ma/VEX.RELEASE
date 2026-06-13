import type { NavigationProp } from '@react-navigation/native';
import type { ExtendedRootStackParams } from './param-types';
import { createDebugger } from '../utils/debug';
import { captureException } from '../config/sentry';
import { validateRouteParams } from './route-param-schemas';

const debug = createDebugger('navigation:deep-links');

const VALID_ROUTE_PATTERNS: Record<string, string[]> = {
  mainTabs: ['Home', 'Focus', 'Progress', 'Profile'],
  sessionRoutes: [
    'SessionSetup',
    'ActiveSession',
    'SessionComplete',
    'SessionHistory',
  ],
  studyRoutes: ['ContentInput', 'StudyPlan', 'StudyLibrary', 'ContentReview'],
  settingsRoutes: ['SettingsMain', 'ProfileEdit', 'Notifications', 'Premium'],
  authRoutes: ['Login', 'Signup', 'ForgotPassword'],
};

/** Serializable param value types that are safe to pass through deep links */
type SafeParamValue = string | number | boolean | null | undefined;
export type SafeParamMap = { [key: string]: SafeParamValue | SafeParamValue[] | SafeParamMap };

export interface DeepLinkValidationResult {
  isValid: boolean;
  sanitizedParams?: SafeParamMap;
  error?: string;
  fallbackRoute?: string;
}

export function validateDeepLinkParams(
  route: string,
  params?: SafeParamMap,
): DeepLinkValidationResult {
  const isValidRoute = Object.values(VALID_ROUTE_PATTERNS).some((routes) =>
    routes.includes(route),
  );
  if (!isValidRoute) {
    debug.warn('Invalid deep link route: %s', route);
    return {
      isValid: false,
      error: `Unknown route: ${route}`,
      fallbackRoute: 'Home',
    };
  }
  const sanitizedParams = params ? sanitizeParams(params) : undefined;
  try {
    validateRouteParams(route, sanitizedParams);
    return { isValid: true, sanitizedParams };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid route params';
    return {
      isValid: false,
      error: message,
      fallbackRoute: route.startsWith('Session') ? 'SessionSetup' : 'Home',
    };
  }
}

function sanitizeParams(
  params: SafeParamMap,
): SafeParamMap {
  const sanitized: SafeParamMap = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'function' || typeof value === 'symbol') {
      continue;
    }
    if (typeof value === 'string') {
      sanitized[key] = value.replace(/[<>]/g, '').slice(0, 1000);
      continue;
    }
    if (['boolean', 'number'].includes(typeof value) || value === null) {
      sanitized[key] = value;
      continue;
    }
    if (typeof value === 'object' && value !== null) {
      if (key === 'studyPlan' || key === 'sessionConfig') {
        sanitized[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }
  return sanitized;
}

export function navigateWithValidation<T extends keyof ExtendedRootStackParams>(
  navigation: NavigationProp<ExtendedRootStackParams> | null | undefined,
  route: T,
  params?: ExtendedRootStackParams[T],
): { success: boolean; error?: string; usedFallback?: boolean } {
  if (!navigation) {
    return { success: false, error: 'Navigation not available' };
  }
  const validation = validateDeepLinkParams(route as string, params as SafeParamMap | undefined);
  if (!validation.isValid) {
    debug.warn(
      'Deep link validation failed: %s, falling back to %s',
      validation.error,
      validation.fallbackRoute,
    );
    if (validation.fallbackRoute) {
      try {
        navigation.navigate(
          validation.fallbackRoute as string,
          undefined,
        );
        return { success: true, usedFallback: true };
      } catch (error) {
        captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: { feature: 'navigation', operation: 'fallbackNavigation' },
        });
        return { success: false, error: 'Fallback navigation failed' };
      }
    }
    return { success: false, error: validation.error };
  }
  try {
    navigation.navigate(
      route as string,
      validation.sanitizedParams,
    );
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debug.error(
      'Navigation failed after validation: %s',
      new Error(errorMessage),
    );
    return { success: false, error: errorMessage };
  }
}
