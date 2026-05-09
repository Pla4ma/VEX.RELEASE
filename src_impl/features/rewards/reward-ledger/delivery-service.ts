/**
 * Reward Delivery Service
 *
 * Handles the delivery of rewards with retry logic and state management.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import * as Sentry from '@sentry/react-native';
import {
  RewardLedgerEntrySchema,
  RewardDeliveryResultSchema,
  RewardLedgerRowSchema,
  type RewardLedgerEntry,
  type RewardDeliveryResult,
  type RewardLedgerState,
} from './schemas';
import { processRewardDelivery, updateRewardState } from './delivery-processor';

const debug = createDebugger('rewards:delivery');

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_RETRY_DELAY = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// Helper Functions
// ============================================================================

function mapRowToEntry(row: z.infer<typeof RewardLedgerRowSchema>): RewardLedgerEntry {
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
 * Deliver a reward to the user
 */
export async function deliverReward(entryId: string): Promise<RewardDeliveryResult> {
  try {
    const supabase = getSupabaseClient();

    // Get the reward entry
    const { data: entry, error: fetchError } = await supabase
      .from('reward_ledger')
      .select('*')
      .eq('id', entryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch reward entry: ${fetchError.message}`);
    }

    const rewardEntry = mapRowToEntry(RewardLedgerRowSchema.parse(entry));

    // Check if already delivered
    if (rewardEntry.state === 'DELIVERED') {
      return RewardDeliveryResultSchema.parse({
        success: true,
        entryId: rewardEntry.id,
        state: rewardEntry.state,
        errorMessage: null,
        retryable: false,
      });
    }

    // Check if expired
    if (rewardEntry.expiredAt && Date.now() > rewardEntry.expiredAt) {
      await updateRewardState(entryId, 'EXPIRED', 'Reward expired');
      return RewardDeliveryResultSchema.parse({
        success: false,
        entryId: rewardEntry.id,
        state: 'EXPIRED',
        errorMessage: 'Reward expired',
        retryable: false,
      });
    }

    // Update attempt count and timestamp
    const now = Date.now();
    const attemptCount = rewardEntry.attemptCount + 1;

    await supabase
      .from('reward_ledger')
      .update({
        state: 'RETRYING',
        attempt_count: attemptCount,
        last_attempt_at: now,
      })
      .eq('id', entryId);

    // Attempt actual reward delivery
    const deliveryResult = await processRewardDelivery(rewardEntry);

    if (deliveryResult.success) {
      await updateRewardState(entryId, 'DELIVERED', null, now);
      debug.info('Reward delivered successfully', { entryId, type: rewardEntry.type });
    } else {
      const shouldRetry = attemptCount < rewardEntry.maxAttempts;
      const nextState = shouldRetry ? 'FAILED' : 'PERMANENTLY_FAILED';
      const retryAfter = shouldRetry ? now + DEFAULT_RETRY_DELAY : null;

      await updateRewardState(entryId, nextState, deliveryResult.errorMessage, null, retryAfter);

      if (!shouldRetry) {
        Sentry.captureException(new Error(`Reward permanently failed: ${deliveryResult.errorMessage}`), {
          tags: { feature: 'reward-ledger' },
          extra: { entryId, rewardEntry },
        });
      }
    }

    return RewardDeliveryResultSchema.parse({
      success: deliveryResult.success,
      entryId: rewardEntry.id,
      state: deliveryResult.success ? 'DELIVERED' : (attemptCount >= rewardEntry.maxAttempts ? 'PERMANENTLY_FAILED' : 'FAILED'),
      errorMessage: deliveryResult.errorMessage,
      retryable: attemptCount < rewardEntry.maxAttempts && !deliveryResult.success,
    });

  } catch (error) {
    debug.error('Error delivering reward', error instanceof Error ? error : undefined);
    Sentry.captureException(error, {
      tags: { feature: 'reward-ledger' },
      extra: { entryId },
    });

    return RewardDeliveryResultSchema.parse({
      success: false,
      entryId,
      state: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      retryable: true,
    });
  }
}
