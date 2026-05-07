/**
 * Enhanced Reward Ledger Schemas
 *
 * Comprehensive schemas for Phase 6 reward ledger requirements.
 */

import { z } from 'zod';

export const RewardLedgerStateSchema = z.enum([
  'PENDING',
  'DELIVERED', 
  'FAILED',
  'EXPIRED',
  'RETRYING'
]);

export type RewardLedgerState = z.infer<typeof RewardLedgerStateSchema>;

export const RewardTypeSchema = z.enum([
  'XP',
  'COINS', 
  'GEMS',
  'ITEM',
  'BADGE',
  'STREAK_SHIELD'
]);

export type RewardType = z.infer<typeof RewardTypeSchema>;

export const RewardLedgerEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  idempotencyKey: z.string(), // Ensures no duplicate rewards
  type: RewardTypeSchema,
  amount: z.number(),
  source: z.string(),
  sourceId: z.string(),
  description: z.string(),
  state: RewardLedgerStateSchema,
  createdAt: z.number(),
  deliveredAt: z.number().nullable(),
  failedAt: z.number().nullable(),
  expiredAt: z.number().nullable(),
  attemptCount: z.number(),
  maxAttempts: z.number(),
  lastAttemptAt: z.number().nullable(),
  errorMessage: z.string().nullable(),
  retryAfter: z.number().nullable(),
  sessionId: z.string().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export type RewardLedgerEntry = z.infer<typeof RewardLedgerEntrySchema>;

export const CreateRewardRequestSchema = z.object({
  userId: z.string(),
  idempotencyKey: z.string(),
  type: RewardTypeSchema,
  amount: z.number(),
  source: z.string(),
  sourceId: z.string(),
  description: z.string(),
  sessionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.number().optional(),
});

export type CreateRewardRequest = z.infer<typeof CreateRewardRequestSchema>;

export const RewardDeliveryResultSchema = z.object({
  success: z.boolean(),
  entryId: z.string(),
  state: RewardLedgerStateSchema,
  errorMessage: z.string().nullable(),
  retryable: z.boolean(),
});

export type RewardDeliveryResult = z.infer<typeof RewardDeliveryResultSchema>;

// Database row schemas
export const RewardLedgerRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  idempotency_key: z.string(),
  type: RewardTypeSchema,
  amount: z.number(),
  source: z.string(),
  source_id: z.string(),
  description: z.string(),
  state: RewardLedgerStateSchema,
  created_at: z.number(),
  delivered_at: z.number().nullable(),
  failed_at: z.number().nullable(),
  expired_at: z.number().nullable(),
  attempt_count: z.number(),
  max_attempts: z.number(),
  last_attempt_at: z.number().nullable(),
  error_message: z.string().nullable(),
  retry_after: z.number().nullable(),
  session_id: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
});

export type RewardLedgerRow = z.infer<typeof RewardLedgerRowSchema>;