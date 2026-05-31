/**
 * Extended Analytics Event Definitions
 */

export interface ExtendedAnalyticsEventDefinitions {
  // Daily mission events
  'daily-mission:completed': {
    missionId?: string;
    missionType?: string;
    priority?: number;
    targetSystem?: string;
    finalProgress?: number;
    [key: string]: unknown;
  };
  'daily-mission:dismissed': {
    missionId?: string;
    missionType?: string;
    priority?: number;
    [key: string]: unknown;
  };
  'daily-mission:expired': {
    missionId?: string;
    missionType?: string;
    priority?: number;
    [key: string]: unknown;
  };
  'daily-mission:priority-decision': {
    selectedType?: string;
    availableTypes?: string[];
    input?: Record<string, unknown>;
    timestamp?: number;
    [key: string]: unknown;
  };
  // Economy / anti-duplication events
  'anti-duplication:attempt_logged': {
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
  'anti-duplication:exploit_detected': {
    userId?: string;
    id?: string;
    createdAt?: number;
    updatedAt?: number;
    status?: string;
    severity?: string;
    [key: string]: unknown;
  };
  'anti-duplication:exploit_alert': {
    userId?: string;
    exploitId?: string;
    severity?: string;
    message?: string;
    [key: string]: unknown;
  };
  // Currency boundaries events
  'currency-boundaries:violation_detected': {
    userId?: string;
    currency?: string;
    amount?: number;
    reason?: string;
    [key: string]: unknown;
  };
  'premium:upgrade_prompt_requested': {
    userId?: string;
    reason?: string;
    feature?: string;
    [key: string]: unknown;
  };
  // UI events
  'ui:show_toast': {
    message?: string;
    type?: string;
    duration?: number;
    [key: string]: unknown;
  };
  // Session recommendation events
  'session-recommendation:generated': {
    userId?: string;
    recommendation?: Record<string, unknown>;
    [key: string]: unknown;
  };
  'session-recommendation:accepted': {
    userId?: string;
    recommendationId?: string;
    [key: string]: unknown;
  };
  'session-recommendation:dismissed': {
    userId?: string;
    reason?: string;
    [key: string]: unknown;
  };
  'session-recommendation:blocked': {
    userId?: string;
    reason?: string;
    [key: string]: unknown;
  };
  'session-recommendation:performance': {
    userId?: string;
    metrics?: Record<string, unknown>;
    [key: string]: unknown;
  };
  // Performance event
  'performance:metric': {
    metricName?: string;
    value?: number;
    [key: string]: unknown;
  };
  // Squad events
  'squad:mutation_failed': {
    userId?: string;
    error?: string;
    [key: string]: unknown;
  };
  'squad:progress_update_failed': {
    userId?: string;
    error?: string;
    [key: string]: unknown;
  };
}
