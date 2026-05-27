/**
 * Job Event Types
 * 
 * Events for communication between jobs and other systems.
 * These are server-side events that flow through the eventBus
 * but are specifically job-related.
 * 
 * WARNING: Server-side only. Do not use in client code.
 */

import type {
  JobQueuedEvent,
  JobStartedEvent,
  JobCompletedEvent,
  JobFailedEvent,
  JobCancelledEvent,
  SeasonRolloverStartedEvent,
  SeasonRolloverCompletedEvent,
  SeasonRolloverFailedEvent,
  ChallengeRefreshStartedEvent,
  ChallengeRefreshProgressEvent,
  ChallengeRefreshCompletedEvent,
  BattlePassResetStartedEvent,
  BattlePassResetCompletedEvent,
  NotificationBatchStartedEvent,
  NotificationBatchProgressEvent,
  NotificationBatchCompletedEvent,
  EconomyReconciliationStartedEvent,
  EconomyReconciliationProgressEvent,
  EconomyReconciliationCompletedEvent,
  AIWorkflowStartedEvent,
  AIWorkflowCompletedEvent,
  AIWorkflowFailedEvent,
} from './job-base-events';

export type {
  JobQueuedEvent,
  JobStartedEvent,
  JobCompletedEvent,
  JobFailedEvent,
  JobCancelledEvent,
  SeasonRolloverStartedEvent,
  SeasonRolloverCompletedEvent,
  SeasonRolloverFailedEvent,
  ChallengeRefreshStartedEvent,
  ChallengeRefreshProgressEvent,
  ChallengeRefreshCompletedEvent,
  BattlePassResetStartedEvent,
  BattlePassResetCompletedEvent,
  NotificationBatchStartedEvent,
  NotificationBatchProgressEvent,
  NotificationBatchCompletedEvent,
  EconomyReconciliationStartedEvent,
  EconomyReconciliationProgressEvent,
  EconomyReconciliationCompletedEvent,
  AIWorkflowStartedEvent,
  AIWorkflowCompletedEvent,
  AIWorkflowFailedEvent,
} from './job-base-events';

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
