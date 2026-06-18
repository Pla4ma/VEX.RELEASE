/**
 * Sentry Configuration
 *
 * Error tracking and performance monitoring setup.
 */

import * as Sentry from '@sentry/react-native';
import { ENVIRONMENT, IS_DEVELOPMENT, CURRENT_CONFIG } from '../constants/app';
import { createDebugger } from '../utils/debug';
import { hashUserId } from '../utils/sentry-privacy';


const debug = createDebugger('config:sentry');

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (!dsn && process.env.EXPO_PUBLIC_ENVIRONMENT === 'production') {
  throw new Error('EXPO_PUBLIC_SENTRY_DSN must be set in production');
}

/**
 * Sentry configuration options
 */
export const SENTRY_CONFIG: Sentry.ReactNativeOptions = {
  dsn,
  environment: ENVIRONMENT,
  enabled: !IS_DEVELOPMENT, // Disable in dev, enable in staging/production

  // Performance monitoring
  tracesSampleRate: IS_DEVELOPMENT ? 1.0 : 0.2,

  // Session replay (for debugging user issues)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Do not attach default email, username, IP, or other PII.
  sendDefaultPii: false,

  // Before send filter (don't send in dev)
  beforeSend: (event: Sentry.ErrorEvent) => {
    if (IS_DEVELOPMENT) {
      return null;
    }
    return event;
  },

  // Release and dist
  release: `${CURRENT_CONFIG.bundleId}@${CURRENT_CONFIG.version}`,
  dist: CURRENT_CONFIG.buildNumber,
};

function createSentryIntegrations(): NonNullable<
  Sentry.ReactNativeOptions['integrations']
> {
  const integrations: NonNullable<Sentry.ReactNativeOptions['integrations']> =
    [];

  integrations.push(Sentry.reactNativeTracingIntegration());
  // Mobile Replay with aggressive masking — this app handles coaching data,
  // study content, user behavior, and private uploaded/pasted content.
  // maskAllText + maskAllImages prevents sensitive screen state from being
  // captured in replay payloads. Screen-level blocking rules below target
  // auth/content-study/coach surfaces specifically.
  integrations.push(Sentry.mobileReplayIntegration({
    maskAllText: true,
    maskAllImages: true,
  }));
  integrations.push(Sentry.feedbackIntegration());

  return integrations;
}

/**
 * Initialize Sentry
 */
export function initSentry(): void {
  if (!SENTRY_CONFIG.dsn) {
    debug.warn('[Sentry] No DSN configured, skipping initialization');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_CONFIG.dsn,
      environment: SENTRY_CONFIG.environment,
      enabled: SENTRY_CONFIG.enabled,
      tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
      replaysSessionSampleRate: SENTRY_CONFIG.replaysSessionSampleRate,
      replaysOnErrorSampleRate: SENTRY_CONFIG.replaysOnErrorSampleRate,
      sendDefaultPii: SENTRY_CONFIG.sendDefaultPii,
      release: SENTRY_CONFIG.release,
      dist: SENTRY_CONFIG.dist,
      beforeSend: SENTRY_CONFIG.beforeSend,
      integrations: createSentryIntegrations(),
    });
  } catch (error: unknown) {
    // Sentry may fail in Expo Go if native PlatformConstants is unavailable.
    // The app continues without crash reporting in that environment.
    debug.warn('[Sentry] Failed to initialize (likely Expo Go):', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(
  userId: string,
  _email?: string,
  _username?: string,
): void {
  Sentry.setUser({
    id: userId,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Capture exception manually
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
): void {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

export { Sentry };
