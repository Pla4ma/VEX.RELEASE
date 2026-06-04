import * as Sentry from '@sentry/react-native';
import { hashUserId, sanitizeContext } from './analytics-detail/analytics-helpers';

// Re-export types so consumers can import from "./analytics".
export type { InterventionType, CoachMetrics } from './analytics-detail/analytics-types';

// Re-export all tracking and metrics functions.
export {
  trackStateChange,
  trackMessageGenerated,
  trackMessageDelivered,
  trackMessageAction,
  trackInterventionTriggered,
  trackInterventionDisplayed,
  trackInterventionActioned,
  trackStreakRiskDetected,
  trackComebackActivated,
  trackRecommendationGenerated,
  trackDifficultyAdjusted,
  trackBehaviorSignal,
} from './analytics-detail/analytics-tracking';

export {
  recordCoachMetric,
  trackMessageEffectiveness,
  trackSessionProcessed,
  trackInterventionEffectiveness,
  trackComebackProgress,
  trackCoachEngagement,
  trackPersonalizationAccuracy,
  getCoachAggregateMetrics,
  exportCoachMetrics,
  clearCoachMetrics,
} from './analytics-detail/analytics-metrics';

// Error tracking — Sentry.captureException wrappers.

export function trackCoachError(
  operation: string,
  error: unknown,
  userId?: string,
  context?: Record<string, unknown>,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation },
    extra: {
      userId: userId ? hashUserId(userId) : undefined,
      context: sanitizeContext(context),
    },
  });
}

export function trackDeliveryFailure(
  messageId: string,
  userId: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'message-delivery' },
    extra: { messageId, userId: hashUserId(userId) },
  });
}

export function trackInterventionFailure(
  ruleId: string,
  userId: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'intervention-execution' },
    extra: { ruleId, userId: hashUserId(userId) },
  });
}

export function trackIntegrationError(
  operation: string,
  userId: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: `integration:${operation}` },
    extra: { userId: hashUserId(userId) },
  });
}

export function trackMessageGenerationError(
  userId: string,
  category: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'message-generation' },
    extra: { userId: hashUserId(userId), category },
  });
}

export function trackEventHandlerError(
  eventType: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'event-handler', eventType },
  });
}
