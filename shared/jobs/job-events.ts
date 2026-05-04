/**
 * Job Event Types
 * 
 * Events for communication between jobs and other systems.
 * These are server-side events that flow through the eventBus
 * but are specifically job-related.
 * 
 * WARNING: Server-side only. Do not use in client code.
 */

// ============================================================================
// Job Lifecycle Events
// ============================================================================

export interface JobQueuedEvent {
  jobId: string;
  runId: string;
  payload: unknown;
  queuedAt: number;
  idempotencyKey?: string;
}

export interface JobStartedEvent {
  jobId: string;
  runId: string;
  attemptNumber: number;
  startedAt: number;
  isRetry: boolean;
}

export interface JobCompletedEvent {
  jobId: string;
  runId: string;
  durationMs: number;
  attemptCount: number;
  output?: unknown;
}

export interface JobFailedEvent {
  jobId: string;
  runId: string;
  error: {
    code: string;
    message: string;
    isRetryable: boolean;
  };
  attemptCount: number;
  willRetry: boolean;
}

export interface JobCancelledEvent {
  jobId: string;
  runId: string;
  reason: string;
  cancelledAt: number;
}

// ============================================================================
// Domain Job Events
// ============================================================================

// Seasons
export interface SeasonRolloverStartedEvent {
  seasonId: string;
  runId: string;
  gracePeriodEndDate: number;
}

export interface SeasonRolloverCompletedEvent {
  seasonId: string;
  runId: string;
  newSeasonId: string;
  usersMigrated: number;
  durationMs: number;
}

export interface SeasonRolloverFailedEvent {
  seasonId: string;
  runId: string;
  error: string;
  partialProgress?: {
    usersMigrated: number;
    stage: string;
  };
}

// Challenges
export interface ChallengeRefreshStartedEvent {
  seasonId: string;
  challengeTypes: string[];
  userCount: number;
  runId: string;
}

export interface ChallengeRefreshProgressEvent {
  seasonId: string;
  runId: string;
  processed: number;
  total: number;
  errors: number;
}

export interface ChallengeRefreshCompletedEvent {
  seasonId: string;
  runId: string;
  challengesGenerated: number;
  challengesAssigned: number;
  errors: Array<{ userId: string; error: string }>;
}

// Battle Pass
export interface BattlePassResetStartedEvent {
  seasonId: string;
  resetType: string;
  affectedUserCount: number;
  runId: string;
}

export interface BattlePassResetCompletedEvent {
  seasonId: string;
  runId: string;
  usersReset: number;
  gemsRefunded: number;
}

// Notifications
export interface NotificationBatchStartedEvent {
  runId: string;
  recipientCount: number;
  notificationType: string;
}

export interface NotificationBatchProgressEvent {
  runId: string;
  sent: number;
  failed: number;
  remaining: number;
}

export interface NotificationBatchCompletedEvent {
  runId: string;
  sent: number;
  failed: number;
  throttled: number;
  durationMs: number;
}

// Economy
export interface EconomyReconciliationStartedEvent {
  runId: string;
  userCount: number;
  checkType: string;
}

export interface EconomyReconciliationProgressEvent {
  runId: string;
  checked: number;
  discrepanciesFound: number;
  discrepanciesFixed: number;
}

export interface EconomyReconciliationCompletedEvent {
  runId: string;
  usersChecked: number;
  discrepanciesFound: number;
  discrepanciesFixed: number;
  reportUrl?: string;
}

// AI
export interface AIWorkflowStartedEvent {
  runId: string;
  workflowType: string;
  userId: string;
  estimatedCost: number;
}

export interface AIWorkflowCompletedEvent {
  runId: string;
  workflowType: string;
  userId: string;
  tokensUsed: number;
  actualCost: number;
  durationMs: number;
}

export interface AIWorkflowFailedEvent {
  runId: string;
  workflowType: string;
  userId: string;
  error: string;
  tokensUsed: number;
}

// ============================================================================
// Event Channel Definitions (to add to EventTypes.ts)
// ============================================================================

export const JOB_EVENT_CHANNELS = {
  // Lifecycle
  'job:queued': {} as JobQueuedEvent,
  'job:started': {} as JobStartedEvent,
  'job:completed': {} as JobCompletedEvent,
  'job:failed': {} as JobFailedEvent,
  'job:cancelled': {} as JobCancelledEvent,
  
  // Seasons
  'job:season:rollover_started': {} as SeasonRolloverStartedEvent,
  'job:season:rollover_completed': {} as SeasonRolloverCompletedEvent,
  'job:season:rollover_failed': {} as SeasonRolloverFailedEvent,
  
  // Challenges
  'job:challenge:refresh_started': {} as ChallengeRefreshStartedEvent,
  'job:challenge:refresh_progress': {} as ChallengeRefreshProgressEvent,
  'job:challenge:refresh_completed': {} as ChallengeRefreshCompletedEvent,
  
  // Battle Pass
  'job:battlepass:reset_started': {} as BattlePassResetStartedEvent,
  'job:battlepass:reset_completed': {} as BattlePassResetCompletedEvent,
  
  // Notifications
  'job:notification:batch_started': {} as NotificationBatchStartedEvent,
  'job:notification:batch_progress': {} as NotificationBatchProgressEvent,
  'job:notification:batch_completed': {} as NotificationBatchCompletedEvent,
  
  // Economy
  'job:economy:reconciliation_started': {} as EconomyReconciliationStartedEvent,
  'job:economy:reconciliation_progress': {} as EconomyReconciliationProgressEvent,
  'job:economy:reconciliation_completed': {} as EconomyReconciliationCompletedEvent,
  
  // AI
  'job:ai:workflow_started': {} as AIWorkflowStartedEvent,
  'job:ai:workflow_completed': {} as AIWorkflowCompletedEvent,
  'job:ai:workflow_failed': {} as AIWorkflowFailedEvent,
} as const;

export type JobEventChannel = keyof typeof JOB_EVENT_CHANNELS;
