/**
 * Analytics Events
 */

export interface AnalyticsEventDefinitions {
  'analytics:track': {
    event: string;
    properties?: Record<string, unknown>;
    sessionId?: string;
    timestamp?: number;
  };
  'analytics:screen': { name: string; params?: Record<string, unknown> };
  'analytics:insight_generated': {
    userId: string;
    insightId: string;
    type: string;
  };
  'analytics:insight_read': { userId: string; insightId: string };
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
  'analytics:export_failed': { jobId: string; userId: string; error: string };
  'analytics:preferences_changed': {
    userId: string;
    changes: Record<string, unknown>;
  };
  'analytics:data_refreshed': { userId: string; metrics: string[] };
  'analytics:engagement': {
    userId: string;
    event: string;
    metrics: unknown;
  };
  'analytics:monetization': {
    userId: string;
    event: string;
    metrics: unknown;
  };
  'experiment:created': {
    experimentId: string;
    name: string;
    type: string;
  };
  'experiment:assigned': {
    userId: string;
    experimentId: string;
    variantId: string;
  };
  'experiment:event': {
    userId: string;
    experimentId: string;
    variantId: string;
  };
  'experiment:completed': {
    experimentId: string;
    winner: string;
    results: unknown;
  };
}
