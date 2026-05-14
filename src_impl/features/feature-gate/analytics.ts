/**
 * Feature Gate Analytics
 *
 * Handles analytics for feature gate events and visibility tracking.
 */

import Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import type { FeatureKey } from '../liveops-config/feature-access';

/**
 * Tracks when a user attempts to access a disabled feature
 */
export function trackFeatureAccessAttempted(
  feature: FeatureKey,
  accessMethod: string,
  context: Record<string, unknown> = {}
): void {
  Sentry.addBreadcrumb({
    category: 'feature-gate',
    message: `Feature access attempted: ${feature}`,
    data: {
      feature,
      accessMethod,
      context,
    },
    level: 'info',
  });

  eventBus.emit('feature-gate:access_attempted', {
    feature,
    accessMethod,
    context,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a feature gate blocks access
 */
export function trackFeatureGateBlocked(
  feature: FeatureKey,
  reason: string,
  fallbackRoute?: string
): void {
  Sentry.addBreadcrumb({
    category: 'feature-gate',
    message: `Feature gate blocked: ${feature}`,
    data: {
      feature,
      reason,
      fallbackRoute,
    },
    level: 'warning',
  });

  eventBus.emit('feature-gate:blocked', {
    feature,
    reason,
    fallbackRoute,
    timestamp: Date.now(),
  });
}

/**
 * Tracks when a feature gate allows access
 */
export function trackFeatureGateAllowed(
  feature: FeatureKey,
  accessMethod: string
): void {
  Sentry.addBreadcrumb({
    category: 'feature-gate',
    message: `Feature gate allowed: ${feature}`,
    data: {
      feature,
      accessMethod,
    },
    level: 'info',
  });

  eventBus.emit('feature-gate:allowed', {
    feature,
    accessMethod,
    timestamp: Date.now(),
  });
}

/**
 * Tracks feature visibility changes
 */
export function trackFeatureVisibilityChanged(
  feature: FeatureKey,
  wasVisible: boolean,
  isVisible: boolean,
  reason?: string
): void {
  Sentry.addBreadcrumb({
    category: 'feature-gate',
    message: `Feature visibility changed: ${feature}`,
    data: {
      feature,
      wasVisible,
      isVisible,
      reason,
    },
    level: 'info',
  });

  eventBus.emit('feature-gate:visibility_changed', {
    feature,
    wasVisible,
    isVisible,
    reason,
    timestamp: Date.now(),
  });
}
