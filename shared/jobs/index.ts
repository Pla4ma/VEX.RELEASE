/**
 * Jobs Shared Module - Barrel Export
 * 
 * WARNING: SERVER-SIDE ONLY
 * Do NOT import this module in client-side Expo/React Native code.
 */

// Schema Types
export type {
  JobTriggerRequest,
  JobTriggerResponse,
  ChallengeExpiryCleanupInput,
  ChallengeExpiryCleanupOutput,
  JobError,
} from './schemas';

// Types
export type {
  JobDefinition,
  JobExecutionContext,
  JobResult,
  JobMetrics,
  TriggerDevConfig,
  JobRun,
  JobRunStatus,
  RetryConfig,
  SeasonRolloverInput,
  SeasonRolloverOutput,
  ChallengeRefreshInput,
  ChallengeRefreshOutput,
  BattlePassResetInput,
  BattlePassResetOutput,
  NotificationBatchInput,
  NotificationBatchOutput,
  AIWorkflowInput,
  AIWorkflowOutput,
  MaintenanceJobInput,
  MaintenanceJobOutput,
  EconomyReconciliationInput,
  EconomyReconciliationOutput,
  SupabaseWebhookPayload,
} from './job-types';

// Events
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
  JOB_EVENT_CHANNELS,
  JobEventChannel,
} from './job-events';

// Constants
export {
  RETRY_CONFIGS,
  TIMEOUT_CONFIGS,
  BATCH_CONFIGS,
  SCHEDULE_CONFIGS,
  DELAY_CONFIGS,
  RATE_LIMIT_CONFIGS,
  JOB_IDS,
  IDEMPOTENCY_CONFIGS,
  ERROR_CODES,
  LOG_CONFIGS,
  CONCURRENCY_CONFIGS,
} from './job-constants';

// Schemas
export {
  JobTriggerRequestSchema,
  JobTriggerResponseSchema,
  SeasonRolloverInputSchema,
  SeasonRolloverOutputSchema,
  ChallengeRefreshInputSchema,
  ChallengeRefreshOutputSchema,
  ChallengeExpiryCleanupInputSchema,
  ChallengeExpiryCleanupOutputSchema,
  BattlePassResetInputSchema,
  BattlePassResetOutputSchema,
  NotificationBatchInputSchema,
  NotificationBatchOutputSchema,
  AIWorkflowInputSchema,
  AIWorkflowOutputSchema,
  MaintenanceJobInputSchema,
  MaintenanceJobOutputSchema,
  EconomyReconciliationInputSchema,
  EconomyReconciliationOutputSchema,
  SupabaseWebhookPayloadSchema,
  JobRunStatusSchema,
  JobErrorSchema,
  JobRunSchema,
} from './schemas';

// Configuration (functions)
export {
  createTriggerConfig,
  getRetryConfig,
  isRetryableError,
  getNonRetryableErrors,
  getLogConfig,
  shouldReportToSentry,
  getSupabaseConfig,
  QUEUE_CONFIGS,
  guardServerOnly,
} from './trigger-config';

// Configuration (types)
export type {
  LogConfig,
  SupabaseConfig,
  QueueConfig,
} from './trigger-config';
