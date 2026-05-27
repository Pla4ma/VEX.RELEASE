/**
 * Base Job Schemas
 *
 * Core Zod schemas and type exports shared across all job definitions.
 * Extracted from schemas.ts to stay under 200-line limit.
 */

import { z } from 'zod';

// ============================================================================
// Primitive Schemas
// ============================================================================

export const JobIdSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/);

export const UUIDSchema = z.string().uuid();

export const TimestampSchema = z.number().int().positive();

// ============================================================================
// Job Trigger Schemas
// ============================================================================

export const JobTriggerRequestSchema = z.object({
  jobId: JobIdSchema,
  payload: z.unknown(),
  options: z.object({
    delay: z.number().int().nonnegative().optional(),
    schedule: z.string().regex(/^([*\d,-/]+\s){4}[*\d,-/]+$/).optional(),
    idempotencyKey: z.string().min(1).max(100).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
  }).optional(),
}).strict();

export const JobTriggerResponseSchema = z.object({
  runId: UUIDSchema,
  status: z.enum(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED']),
  queuedAt: z.date(),
}).strict();

// ============================================================================
// Job Run Status Schemas
// ============================================================================

export const JobRunStatusSchema = z.enum([
  'PENDING',
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'TIMED_OUT',
  'RETRYING',
]);

export const JobErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  isRetryable: z.boolean(),
}).strict();

export const JobRunSchema = z.object({
  id: UUIDSchema,
  jobId: JobIdSchema,
  status: JobRunStatusSchema,
  input: z.unknown(),
  output: z.unknown().optional(),
  error: JobErrorSchema.optional(),
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  attemptCount: z.number().int().nonnegative(),
  lastAttemptAt: z.date().optional(),
  nextAttemptAt: z.date().optional(),
  idempotencyKey: z.string().optional(),
}).strict();

// ============================================================================
// Supabase Webhook Schema
// ============================================================================

export const SupabaseWebhookPayloadSchema = z.object({
  type: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  table: z.string(),
  schema: z.string(),
  record: z.record(z.unknown()).nullable(),
  old_record: z.record(z.unknown()).nullable(),
}).strict();

// ============================================================================
// Type Exports
// ============================================================================

export type JobTriggerRequest = z.infer<typeof JobTriggerRequestSchema>;
export type JobTriggerResponse = z.infer<typeof JobTriggerResponseSchema>;
export type JobRunStatus = z.infer<typeof JobRunStatusSchema>;
export type JobError = z.infer<typeof JobErrorSchema>;
export type JobRun = z.infer<typeof JobRunSchema>;
export type SupabaseWebhookPayload = z.infer<typeof SupabaseWebhookPayloadSchema>;
