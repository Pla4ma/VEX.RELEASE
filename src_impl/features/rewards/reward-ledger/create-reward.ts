/**
 * Create Reward Entry
 *
 * Handles the creation of new reward entries with idempotency protection.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import * as Sentry from '@sentry/react-native';
import {
  RewardLedgerEntrySchema,
  CreateRewardRequestSchema,
  RewardDeliveryResultSchema,
  RewardLedgerRowSchema,
  type CreateRewardRequest,
  type RewardDeliveryResult,
  type RewardLedgerState,
} from './schemas';
import { deliverReward } from './delivery-service';

const debug = createDebugger('rewards:create');

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_MAX_ATTEMPTS = 3;
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Helper Functions
// ============================================================================

function mapRowToEntry(row: z.infer<typeof RewardLedgerRowSchema>) {
  return RewardLedgerEntrySchema.parse({
    id: row.id,
    userId: row.user_id,
    idempotencyKey: row.idempotency_key,
    type: row.type,
    amount: row.amount,
    source: row.source,
    sourceId: row.source_id,
    description: row.description,
    state: row.state,
    createdAt: row.created_at,
    deliveredAt: row.delivered_at,
    failedAt: row.failed_at,
    expiredAt: row.expired_at,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    lastAttemptAt: row.last_attempt_at,
    errorMessage: row.error_message,
    retryAfter: row.retry_after,
    sessionId: row.session_id,
    metadata: row.metadata,
  });
}

// ============================================================================
// Core Function
// ============================================================================

/**
 * Create a new reward entry with idempotency protection
 */
export async function createRewardEntry(
  request: CreateRewardRequest
): Promise<RewardDeliveryResult> {
  try {
    const validated = CreateRewardRequestSchema.parse(request);
    const supabase = getSupabaseClient();

    // Check for existing entry with same idempotency key
    const { data: existing, error: checkError } = await supabase
      .from('reward_ledger')
      .select('*')
      .eq('idempotency_key', validated.idempotencyKey)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing reward: ${checkError.message}`);
    }

    if (existing) {
      debug.info('Reward already exists, returning existing entry', {
        idempotencyKey: validated.idempotencyKey,
        state: existing.state
      });

      return RewardDeliveryResultSchema.parse({
        success: existing.state === 'DELIVERED',
        entryId: existing.id,
        state: existing.state,
        errorMessage: existing.error_message,
        retryable: existing.state === 'FAILED' && existing.attempt_count < existing.max_attempts,
      });
    }

    // Create new reward entry
    const now = Date.now();
    const entryData = {
      user_id: validated.userId,
      idempotency_key: validated.idempotencyKey,
      type: validated.type,
      amount: validated.amount,
      source: validated.source,
      source_id: validated.sourceId,
      description: validated.description,
      state: 'PENDING' as RewardLedgerState,
      created_at: now,
      delivered_at: null,
      failed_at: null,
      expired_at: validated.expiresAt ?? now + EXPIRY_TIME,
      attempt_count: 0,
      max_attempts: DEFAULT_MAX_ATTEMPTS,
      last_attempt_at: null,
      error_message: null,
      retry_after: null,
      session_id: validated.sessionId ?? null,
      metadata: validated.metadata ?? null,
    };

    const { data, error } = await supabase
      .from('reward_ledger')
      .insert(entryData)
      .select()
      .single();

    if (error) {
      debug.error('Failed to create reward entry', error);
      throw new Error(`Failed to create reward entry: ${error.message}`);
    }

    const entry = mapRowToEntry(RewardLedgerRowSchema.parse(data));
    debug.info('Created reward entry', { entryId: entry.id, type: entry.type });

    // Attempt immediate delivery
    return await deliverReward(entry.id);

  } catch (error) {
    debug.error('Error creating reward entry', error instanceof Error ? error : undefined);
    Sentry.captureException(error, {
      tags: { feature: 'reward-ledger' },
      extra: { request }
    });

    return RewardDeliveryResultSchema.parse({
      success: false,
      entryId: '',
      state: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      retryable: false,
    });
  }
}
