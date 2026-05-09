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
    experimentId?: string;
    name?: string;
    type?: string;
    experiment?: unknown;
  };
  'experiment:assigned': {
    userId?: string;
    experimentId?: string;
    variantId?: string;
    assignment?: unknown;
    experiment?: unknown;
  };
  'experiment:event': {
    userId: string;
    experimentId: string;
    variantId: string;
    eventName?: string;
    value?: number;
    properties?: Record<string, unknown>;
    timestamp?: number;
  };
  'experiment:completed': {
    experimentId?: string;
    winner?: string;
    results?: unknown;
    experiment?: unknown;
  };
  'experiment:unassigned': {
    userId: string;
    experimentId: string;
  };
  'experiment:assignments_cleared': {
    userId: string;
  };
  'analytics:paywall': {
    userId: string;
    context: string;
    event: string;
    analytics: unknown;
  };
  'analytics:streak': {
    userId: string;
    event: string;
    streakLength: number;
    metrics: unknown;
  };
}
