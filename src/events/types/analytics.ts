/**
 * Analytics Events
 */

export interface AnalyticsEventDefinitions {
  "analytics:track": {
    event: string;
    properties?: Record<string, unknown>;
    sessionId?: string;
    timestamp?: number;
  };
  "analytics:screen": { name: string; params?: Record<string, unknown> };
  "analytics:insight_generated": {
    userId: string;
    insightId: string;
    type: string;
  };
  "analytics:insight_read": { userId: string; insightId: string };
  "analytics:insight_actioned": {
    userId: string;
    insightId: string;
    actionType: string;
  };
  "analytics:pattern_detected": {
    userId: string;
    patternId: string;
    type: string;
    confidence: number;
  };
  "analytics:dashboard_updated": {
    userId: string;
    dashboardId: string;
    changes: string[];
  };
  "analytics:export_requested": {
    jobId: string;
    userId: string;
    format: string;
  };
  "analytics:export_completed": {
    jobId: string;
    userId: string;
    fileUrl: string;
  };
  "analytics:export_failed": { jobId: string; userId: string; error: string };
  "analytics:preferences_changed": {
    userId: string;
    changes: Record<string, unknown>;
  };
  "analytics:data_refreshed": { userId: string; metrics: string[] };
  "analytics:paywall": {
    userId: string;
    context: string;
    event: string;
    analytics: Record<string, unknown>;
  };
  "analytics:streak": {
    userId: string;
    event: string;
    data: Record<string, unknown>;
  };
  "daily-mission:shown": {
    missionId: string;
    userId?: string;
    timestamp: number;
    missionType?: string;
    priority?: number;
    targetSystem?: string;
  };
  "daily-mission:started": {
    missionId: string;
    userId?: string;
    timestamp: number;
    missionType?: string;
    targetSystem?: string;
  };
  "analytics:engagement": {
    userId: string;
    event: string;
    metrics: unknown;
  };
  "analytics:monetization": {
    userId: string;
    event: string;
    metrics: unknown;
  };
  "experiment:created": {
    experimentId?: string;
    name?: string;
    type?: string;
    experiment?: unknown;
  };
  "experiment:assigned": {
    userId?: string;
    experimentId?: string;
    variantId?: string;
    assignment?: unknown;
    experiment?: unknown;
  };
  "experiment:event": {
    userId: string;
    experimentId: string;
    variantId: string;
    eventName?: string;
    value?: number;
    properties?: Record<string, unknown>;
    timestamp?: number;
  };
  "experiment:completed": {
    experimentId?: string;
    winner?: string;
    results?: unknown;
    experiment?: unknown;
  };
  "experiment:unassigned": {
    userId: string;
    experimentId: string;
  };
  "experiment:assignments_cleared": {
    userId: string;
  };
  // Daily mission events
  "daily-mission:completed": {
    missionId?: string;
    missionType?: string;
    priority?: number;
    targetSystem?: string;
    finalProgress?: number;
    [key: string]: unknown;
  };
  "daily-mission:dismissed": {
    missionId?: string;
    missionType?: string;
    priority?: number;
    [key: string]: unknown;
  };
  "daily-mission:expired": {
    missionId?: string;
    missionType?: string;
    priority?: number;
    [key: string]: unknown;
  };
  "daily-mission:priority-decision": {
    selectedType?: string;
    availableTypes?: string[];
    input?: Record<string, unknown>;
    timestamp?: number;
    [key: string]: unknown;
  };
  // Economy / anti-duplication events
  "anti-duplication:attempt_logged": {
    userId?: string;
    id?: string;
    source?: string;
    metadata?: Record<string, unknown> | null;
    createdAt?: number;
    reason?: string | null;
    sourceId?: string | null;
    result?: string;
    actionType?: string;
    contextKey?: string;
    [key: string]: unknown;
  };
  "anti-duplication:exploit_detected": {
    userId?: string;
    id?: string;
    createdAt?: number;
    updatedAt?: number;
    status?: string;
    severity?: string;
    [key: string]: unknown;
  };
  "anti-duplication:exploit_alert": {
    userId?: string;
    exploitId?: string;
    severity?: string;
    message?: string;
    [key: string]: unknown;
  };
  // Currency boundaries events
  "currency-boundaries:violation_detected": {
    userId?: string;
    currency?: string;
    amount?: number;
    reason?: string;
    [key: string]: unknown;
  };
  "premium:upgrade_prompt_requested": {
    userId?: string;
    reason?: string;
    feature?: string;
    [key: string]: unknown;
  };
  // UI events
  "ui:show_toast": {
    message?: string;
    type?: string;
    duration?: number;
    [key: string]: unknown;
  };
  // Session recommendation events
  "session-recommendation:generated": {
    userId?: string;
    recommendation?: Record<string, unknown>;
    [key: string]: unknown;
  };
  "session-recommendation:accepted": {
    userId?: string;
    recommendationId?: string;
    [key: string]: unknown;
  };
  "session-recommendation:dismissed": {
    userId?: string;
    reason?: string;
    [key: string]: unknown;
  };
  "session-recommendation:blocked": {
    userId?: string;
    reason?: string;
    [key: string]: unknown;
  };
  "session-recommendation:performance": {
    userId?: string;
    metrics?: Record<string, unknown>;
    [key: string]: unknown;
  };
  // Performance event
  "performance:metric": {
    metricName?: string;
    value?: number;
    [key: string]: unknown;
  };
  // Squad events
  "squad:mutation_failed": {
    userId?: string;
    error?: string;
    [key: string]: unknown;
  };
  "squad:progress_update_failed": {
    userId?: string;
    error?: string;
    [key: string]: unknown;
  };
}
