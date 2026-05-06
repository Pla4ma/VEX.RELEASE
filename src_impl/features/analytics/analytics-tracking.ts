/**
 * Analytics Tracking
 * Sentry breadcrumbs and custom event tracking for analytics feature
 */

import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';

// Analytics event tracking
export const AnalyticsTracking = {
  // Track insight generation
  trackInsightGenerated(userId: string, type: string, severity: string) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: `Insight generated: ${type}`,
      level: 'info',
      data: { userId, type, severity },
    });
  },

  // Track insight interaction
  trackInsightRead(userId: string, insightId: string) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Insight marked as read',
      level: 'info',
      data: { userId, insightId },
    });
  },

  // Track dashboard interactions
  trackDashboardViewed(userId: string, dashboardId: string) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Dashboard viewed',
      level: 'info',
      data: { userId, dashboardId },
    });
  },

  trackWidgetUpdated(userId: string, widgetId: string, changes: string[]) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Dashboard widget updated',
      level: 'info',
      data: { userId, widgetId, changes },
    });
  },

  // Track export operations
  trackExportRequested(userId: string, format: string, dataTypes: string[]) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Data export requested',
      level: 'info',
      data: { userId, format, dataTypes },
    });
  },

  trackExportCompleted(userId: string, jobId: string, fileSize: number) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Data export completed',
      level: 'info',
      data: { userId, jobId, fileSize },
    });
  },

  trackExportFailed(userId: string, jobId: string, error: string) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Data export failed',
      level: 'error',
      data: { userId, jobId, error },
    });
  },

  // Track pattern detection
  trackPatternDetected(userId: string, patternType: string, confidence: number) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: `Pattern detected: ${patternType}`,
      level: 'info',
      data: { userId, patternType, confidence },
    });
  },

  // Track preference changes
  trackPreferencesChanged(userId: string, changes: Record<string, unknown>) {
    Sentry.addBreadcrumb({
      category: 'analytics',
      message: 'Analytics preferences updated',
      level: 'info',
      data: { userId, changes },
    });
  },

  // Track errors
  trackError(operation: string, error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, {
      tags: { feature: 'analytics', operation },
      extra: context,
    });
  },
};

// Setup event listeners for tracking
export function setupAnalyticsTracking(): () => void {
  const unsubscribeInsightGenerated = eventBus.subscribe(
    'analytics:insight_generated',
    (payload) => {
      AnalyticsTracking.trackInsightGenerated(
        payload.userId,
        payload.type,
        'info'
      );
    }
  );

  const unsubscribeExportCompleted = eventBus.subscribe(
    'analytics:export_completed',
    (payload) => {
      AnalyticsTracking.trackExportCompleted(
        payload.userId,
        payload.jobId,
        0
      );
    }
  );

  const unsubscribeExportFailed = eventBus.subscribe(
    'analytics:export_failed',
    (payload) => {
      AnalyticsTracking.trackExportFailed(
        payload.userId,
        payload.jobId,
        payload.error
      );
    }
  );

  return () => {
    unsubscribeInsightGenerated();
    unsubscribeExportCompleted();
    unsubscribeExportFailed();
  };
}
