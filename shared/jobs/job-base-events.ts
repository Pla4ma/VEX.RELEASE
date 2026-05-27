/**
 * Job Base Event Types
 * 
 * Base event interfaces for job lifecycle and domain events.
 * Extracted from job-events.ts for file size compliance.
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
