/**
 * Analytics Module
 *
 * Public exports for analytics functionality.
 *
 * Usage:
 *   import { useAnalytics, capture, SessionEvents } from '@/shared/analytics';
 */

// Service exports
export {
  analyticsService,
  getPostHogProvider,
  capture,
  identify,
  reset,
  screen,
  updateUserProperties,
  isFeatureEnabled,
  getFeatureFlag,
} from './analytics-service';

export { initializeAnalyticsEventBridge } from './event-bus-bridge';
export {
  ProductAnalyticsEvents,
  type ProductAnalyticsEvent,
} from './product-events';
export {
  sanitizeAnalyticsProperties,
  sanitizeEventName,
  sanitizeUserTraits,
  type SafeAnalyticsProperties,
} from './privacy';

// Event constants and types
export {
  // Event categories
  AuthEvents,
  SessionEvents,
  ProgressionEvents,
  EconomyEvents,
  SocialEvents,
  CoachEvents,
  FeatureEvents,
  OnboardingEvents,
  PurchaseFunnelEvents,
  RetentionEvents,
  AnalyticsEvents,

  // Types
  type AnalyticsEvent,
  type AuthEvent,
  type SessionEvent,
  type ProgressionEvent,
  type EconomyEvent,
  type PurchaseEvent,
  type SocialEvent,
  type CoachEvent,
  type FeatureEvent,
  type OnboardingEvent,
  type PurchaseFunnelEvent,
  type RetentionEvent,
  type EventProperties,
  type BaseEventProperties,
  type AuthEventProperties,
  type SessionEventProperties,
  type ProgressionEventProperties,
  type EconomyEventProperties,
  type SocialEventProperties,
  type CoachEventProperties,
} from './analytics-events';

// Hook exports
export {
  useAnalytics,
  useScreenTracking,
  useProgressionTracking,
  useSessionTracking,
} from './use-analytics';

// Sentry alert exports (Phase 8C.2)
export {
  alertRevenueWebhookFailure,
  alertWalletCreditFailure,
  alertAnalyticsFailure,
  alertSuspiciousActivity,
  alertDatabaseDegradation,
  withRevenueAlert,
} from './sentry-alerts';
