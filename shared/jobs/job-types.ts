/**
 * Trigger.dev Job Types - Server-Side Only
 * 
 * WARNING: These types are for server-side job definitions only.
 * NEVER import this file into client-side Expo/React Native code.
 * 
 * Dependencies:
 * - Trigger.dev v4 (server-side worker infrastructure)
 * - Supabase (data source)
 * - Sentry (error tracking)
 * - PostHog (future analytics)
 */

import type { z } from 'npm:zod';

// ============================================================================
// Job Categories
// ============================================================================

export type JobCategory = 
  | 'SEASONS'
  | 'CHALLENGES' 
  | 'BATTLE_PASS'
  | 'NOTIFICATIONS'
  | 'AI'
  | 'MAINTENANCE'
  | 'ANALYTICS'
  | 'ECONOMY';

// ============================================================================
// Base Job Types
// ============================================================================

export interface JobDefinition<Input, Output> {
  id: string;
  name: string;
  category: JobCategory;
  description: string;
  
  // Schema validation
  inputSchema: z.ZodSchema<Input>;
  outputSchema: z.ZodSchema<Output>;
  
  // Execution config
  retryConfig: RetryConfig;
  timeoutSeconds: number;
  concurrencyLimit?: number;
  
  // Observability
  sentryEnabled: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}

export interface RetryConfig {
  maxAttempts: number;
  factor: number; // Exponential backoff factor
  minTimeoutInMs: number;
  maxTimeoutInMs: number;
  retryableErrors?: readonly string[]; // Error codes that trigger retry
  nonRetryableErrors?: readonly string[]; // Error codes that fail immediately
}

export interface JobExecutionContext {
  jobId: string;
  runId: string;
  attemptNumber: number;
  startedAt: Date;
  isRetry: boolean;
  
  // Observability
  traceId: string;
  parentTraceId?: string;
}

export interface JobResult<Output> {
  success: boolean;
  output?: Output;
  error?: JobError;
  metrics: JobMetrics;
}

export interface JobError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  isRetryable: boolean;
}

export interface JobMetrics {
  durationMs: number;
  attemptCount: number;
  dbQueries: number;
  externalCalls: number;
}

// ============================================================================
// Trigger.dev Specific Types
// ============================================================================

export interface TriggerDevConfig {
  // Project identification
  projectId: string;
  apiKey: string; // SERVER-SIDE ONLY - never in client code
  apiUrl: string;
  
  // Environment
  environment: 'development' | 'staging' | 'production';
  
  // Default retry settings
  defaultRetryConfig: RetryConfig;
  
  // Observability
  sentryDsn?: string;
  postHogKey?: string;
}

export interface JobTriggerRequest {
  jobId: string;
  payload: unknown;
  options?: {
    delay?: number; // Delay in seconds
    schedule?: string; // Cron expression for scheduled jobs
    idempotencyKey?: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH';
  };
}

export interface JobTriggerResponse {
  runId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  queuedAt: Date;
}

// ============================================================================
// Job State Types
// ============================================================================

export type JobRunStatus = 
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMED_OUT'
  | 'RETRYING';

export interface JobRun {
  id: string;
  jobId: string;
  status: JobRunStatus;
  
  // Input/Output
  input: unknown;
  output?: unknown;
  error?: JobError;
  
  // Timing
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Retry tracking
  attemptCount: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  
  // Idempotency
  idempotencyKey?: string;
}

// ============================================================================
// Domain-Specific Job Types
// ============================================================================

// Seasons Jobs
export interface SeasonRolloverInput {
  seasonId: string;
  gracePeriodDays: number;
  autoArchive: boolean;
  notifyUsers: boolean;
}

export interface SeasonRolloverOutput {
  archivedSeasonId: string;
  newSeasonId: string;
  usersMigrated: number;
  rewardsDistributed: number;
}

// Challenge Jobs
export interface ChallengeRefreshInput {
  seasonId: string;
  userIds?: string[]; // Optional - if not provided, all users
  challengeTypes: ('DAILY' | 'WEEKLY')[];
  preserveProgress: boolean;
}

export interface ChallengeRefreshOutput {
  challengesGenerated: number;
  challengesAssigned: number;
  errors: Array<{ userId: string; error: string }>;
}

// Battle Pass Jobs
export interface BattlePassResetInput {
  seasonId: string;
  resetType: 'SOFT' | 'HARD'; // Soft keeps history, hard wipes everything
  refundPremium: boolean;
}

export interface BattlePassResetOutput {
  usersReset: number;
  gemsRefunded: number;
  errors: string[];
}

// Notification Jobs
export interface NotificationBatchInput {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  delaySeconds?: number;
  throttleMs?: number; // Rate limiting between sends
}

export interface NotificationBatchOutput {
  sent: number;
  failed: number;
  throttled: number;
  errors: Array<{ userId: string; error: string }>;
}

// AI Jobs
export interface AIWorkflowInput {
  workflowType: 'SESSION_SUMMARY' | 'PROGRESS_ANALYSIS' | 'CHALLENGE_GENERATION';
  userId: string;
  context: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}

export interface AIWorkflowOutput {
  result: unknown;
  tokensUsed: number;
  costEstimate: number;
  durationMs: number;
}

// Maintenance Jobs
export interface MaintenanceJobInput {
  jobType: 'CLEANUP_OLD_DATA' | 'RECONCILE_WALLETS' | 'SYNC_ANALYTICS' | 'HEALTH_CHECK';
  dryRun: boolean;
  batchSize: number;
  maxRuntimeMinutes: number;
}

export interface MaintenanceJobOutput {
  processed: number;
  modified: number;
  errors: string[];
  log: string[];
}

// Economy Jobs
export interface EconomyReconciliationInput {
  userIds?: string[]; // Optional - reconcile specific users
  checkBalances: boolean;
  checkTransactions: boolean;
  fixDiscrepancies: boolean;
}

export interface EconomyReconciliationOutput {
  usersChecked: number;
  discrepanciesFound: number;
  discrepanciesFixed: number;
  reportUrl?: string;
}

// ============================================================================
// Job Registry
// ============================================================================

export interface JobRegistry {
  [jobId: string]: JobDefinition<unknown, unknown>;
}

// ============================================================================
// Webhook Types (for Supabase -> Trigger.dev integration)
// ============================================================================

export interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

export interface WebhookJobMapping {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  jobId: string;
  payloadTransform: (payload: SupabaseWebhookPayload) => unknown;
  filter?: (payload: SupabaseWebhookPayload) => boolean;
}
