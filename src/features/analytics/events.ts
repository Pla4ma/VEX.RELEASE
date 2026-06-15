/**
 * Analytics Events
 * Event definitions and handlers for analytics system
 */

import { eventBus } from '../../events/EventBus';
import type { Insight, DetectedPattern, ExportJob } from './schemas';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('analytics:events');

// Event payload types
export interface AnalyticsEvents {
  'analytics:insight_generated': {
    userId: string;
    insightId: string;
    type: string;
  };
  'analytics:insight_read': {
    userId: string;
    insightId: string;
  };
  'analytics:insight_actioned': {
    userId: string;
    insightId: string;
    actionType: string;
  };
  'analytics:pattern_detected': {
    userId: string;
    patternId: string;
    type: string;
    confidence: number;
  };
  'analytics:dashboard_updated': {
    userId: string;
    dashboardId: string;
    changes: string[];
  };
  'analytics:export_requested': {
    jobId: string;
    userId: string;
    format: string;
  };
  'analytics:export_completed': {
    jobId: string;
    userId: string;
    fileUrl: string;
  };
  'analytics:export_failed': {
    jobId: string;
    userId: string;
    error: string;
  };
  'analytics:preferences_changed': {
    userId: string;
    changes: Record<string, unknown>;
  };
  'analytics:data_refreshed': {
    userId: string;
    metrics: string[];
  };
}

// Subscribe to analytics events
export function subscribeToAnalyticsEvents(): () => void {
  const unsubscribeInsightGenerated = eventBus.subscribe(
    'analytics:insight_generated',
    (payload) => {
      debug.info('[Analytics] Insight generated:', payload);
    },
  );

  const unsubscribeExportCompleted = eventBus.subscribe(
    'analytics:export_completed',
    (payload) => {
      debug.info('[Analytics] Export completed:', payload);
    },
  );

  const unsubscribeExportFailed = eventBus.subscribe(
    'analytics:export_failed',
    (payload) => {
      debug.error(
        '[Analytics] Export failed',
        new Error(payload.error),
        payload,
      );
    },
  );

  // Return cleanup function
  return () => {
    unsubscribeInsightGenerated();
    unsubscribeExportCompleted();
    unsubscribeExportFailed();
  };
}

// Emit analytics events helpers
export function emitInsightGenerated(userId: string, insight: Insight) {
  eventBus.publish('analytics:insight_generated', {
    userId,
    insightId: insight.id,
    type: insight.type,
  });
}

export function emitInsightRead(userId: string, insightId: string) {
  eventBus.publish('analytics:insight_read', {
    userId,
    insightId,
  });
}

export function emitPatternDetected(userId: string, pattern: DetectedPattern) {
  eventBus.publish('analytics:pattern_detected', {
    userId,
    patternId: pattern.id,
    type: pattern.type,
    confidence: pattern.confidence,
  });
}

export function emitExportRequested(job: ExportJob) {
  eventBus.publish('analytics:export_requested', {
    jobId: job.id,
    userId: job.userId,
    format: job.format,
  });
}

export function emitExportCompleted(job: ExportJob) {
  eventBus.publish('analytics:export_completed', {
    jobId: job.id,
    userId: job.userId,
    fileUrl: job.fileUrl || '',
  });
}

export function emitExportFailed(jobId: string, userId: string, error: string) {
  eventBus.publish('analytics:export_failed', {
    jobId,
    userId,
    error,
  });
}

export function emitDashboardUpdated(
  userId: string,
  dashboardId: string,
  changes: string[],
) {
  eventBus.publish('analytics:dashboard_updated', {
    userId,
    dashboardId,
    changes,
  });
}

export function emitPreferencesChanged(
  userId: string,
  changes: Record<string, unknown>,
) {
  eventBus.publish('analytics:preferences_changed', {
    userId,
    changes,
  });
}
