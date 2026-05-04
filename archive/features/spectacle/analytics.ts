/**
 * Spectacle Analytics
 *
 * Analytics tracking for spectacle events.
 * Records celebration engagement and timing.
 */

import * as Sentry from '@sentry/react-native';
import { SpectacleType, SpectacleEvent } from './types';

/**
 * Track when a spectacle is triggered
 */
export function trackSpectacleTriggered(
  type: SpectacleType,
  spectacleId: string,
  queuePosition: number
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Spectacle triggered: ${type}`,
    level: 'info',
    data: {
      spectacleType: type,
      spectacleId,
      queuePosition,
    },
  });
}

/**
 * Track when a spectacle starts playing
 */
export function trackSpectacleStarted(
  type: SpectacleType,
  spectacleId: string,
  queueWaitTime: number
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Spectacle started: ${type}`,
    level: 'info',
    data: {
      spectacleType: type,
      spectacleId,
      queueWaitTime,
    },
  });
}

/**
 * Track when a spectacle completes
 */
export function trackSpectacleCompleted(
  type: SpectacleType,
  spectacleId: string,
  duration: number,
  dismissedByUser: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Spectacle completed: ${type}`,
    level: 'info',
    data: {
      spectacleType: type,
      spectacleId,
      duration,
      dismissedByUser,
    },
  });
}

/**
 * Track when a spectacle is skipped
 */
export function trackSpectacleSkipped(
  type: SpectacleType,
  spectacleId: string,
  progressPercent: number
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Spectacle skipped: ${type}`,
    level: 'info',
    data: {
      spectacleType: type,
      spectacleId,
      progressPercent,
    },
  });
}

/**
 * Track haptic playback
 */
export function trackHapticPlayed(
  pattern: string,
  success: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Haptic ${success ? 'played' : 'failed'}: ${pattern}`,
    level: success ? 'info' : 'warning',
    data: {
      pattern,
      success,
    },
  });
}

/**
 * Track spectacle error
 */
export function trackSpectacleError(
  type: SpectacleType | 'UNKNOWN',
  error: Error,
  context?: Record<string, unknown>
): void {
  Sentry.captureException(error, {
    tags: {
      feature: 'spectacle',
      spectacleType: type,
    },
    extra: context,
  });
}

/**
 * Track batch spectacle events
 */
export function trackSpectacleBatch(
  events: SpectacleEvent[],
  totalQueueTime: number
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Spectacle batch: ${events.length} events`,
    level: 'info',
    data: {
      eventCount: events.length,
      types: events.map(e => e.type),
      totalQueueTime,
    },
  });
}

/**
 * Track spectacle dismissal
 */
export function trackSpectacleDismissed(
  type: SpectacleType,
  method: 'tap' | 'auto' | 'timeout',
  timeViewed: number
): void {
  Sentry.addBreadcrumb({
    category: 'spectacle',
    message: `Spectacle dismissed: ${type}`,
    level: 'info',
    data: {
      spectacleType: type,
      method,
      timeViewed,
    },
  });
}
