/**
 * Trigger.dev Job Base Types - Server-Side Only
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
  factor: number;
  minTimeoutInMs: number;
  maxTimeoutInMs: number;
  retryableErrors?: readonly string[];
  nonRetryableErrors?: readonly string[];
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
  projectId: string;
  apiKey: string;
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  defaultRetryConfig: RetryConfig;
  sentryDsn?: string;
  postHogKey?: string;
}

export interface JobTriggerRequest {
  jobId: string;
  payload: unknown;
  options?: {
    delay?: number;
    schedule?: string;
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
  input: unknown;
  output?: unknown;
  error?: JobError;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  attemptCount: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  idempotencyKey?: string;
}

// ============================================================================
// Job Registry
// ============================================================================

export interface JobRegistry {
  [jobId: string]: JobDefinition<unknown, unknown>;
}

// ============================================================================
// Webhook Types
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
