/**
 * Reward Ledger Queries
 *
 * Functions for retrieving and querying reward ledger data.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import {
  RewardLedgerRowSchema,
  RewardDeliveryResultSchema,
  type RewardLedgerEntry,
  type RewardLedgerState,
  type RewardDeliveryResult,
} from './schemas';
import { deliverReward } from './service';

const debug = createDebugger('rewards:ledger-queries');

function mapRowToEntry(row: z.infer<typeof RewardLedgerRowSchema>): RewardLedgerEntry {
  return {
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
  };
}

/**
 * Get reward ledger entries for a user
 */
export async function getRewardLedger(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: string;
    state?: RewardLedgerState;
  }
): Promise<RewardLedgerEntry[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('reward_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset !== undefined) {
    const limit = options.limit ?? 20;
    query = query.range(options.offset, options.offset + limit - 1);
  }
  if (options?.type) {
    query = query.eq('type', options.type);
  }
  if (options?.state) {
    query = query.eq('state', options.state);
  }

  const { data, error } = await query;

  if (error) {
    debug.error('Failed to fetch reward ledger', error);
    throw new Error(`Failed to fetch reward ledger: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToEntry(RewardLedgerRowSchema.parse(row)));
}

/**
 * Get pending rewards for a user
 */
export async function getPendingRewards(userId: string): Promise<RewardLedgerEntry[]> {
  return getRewardLedger(userId, { state: 'PENDING' });
}

/**
 * Get failed rewards that can be retried
 */
export async function getRetryableFailedRewards(userId: string): Promise<RewardLedgerEntry[]> {
  const failedEntries = await getRewardLedger(userId, {
    state: 'FAILED',
    limit: 50
  });

  return failedEntries.filter(entry =>
    entry.retryAfter && Date.now() >= entry.retryAfter
  );
}

/**
 * Retry failed rewards
 */
export async function retryFailedRewards(userId: string): Promise<RewardDeliveryResult[]> {
  const retryableEntries = await getRetryableFailedRewards(userId);
  const results: RewardDeliveryResult[] = [];

  for (const entry of retryableEntries) {
    const result = await deliverReward(entry.id);
    results.push(result);
  }

  return results;
}

/**
 * Get reward summary for a user
 */
export async function getRewardSummary(userId: string): Promise<{
  totalXP: number;
  totalCoins: number;
  totalGems: number;
  pendingCount: number;
  failedCount: number;
  deliveredCount: number;
}> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('reward_ledger')
    .select('type, amount, state')
    .eq('user_id', userId);

  if (error) {
    debug.error('Failed to fetch reward summary', error);
    throw new Error(`Failed to fetch reward summary: ${error.message}`);
  }

  const entries = data || [];

  return {
    totalXP: entries.filter(e => e.type === 'XP').reduce((sum, e) => sum + e.amount, 0),
    totalCoins: entries.filter(e => e.type === 'COINS').reduce((sum, e) => sum + e.amount, 0),
    totalGems: entries.filter(e => e.type === 'GEMS').reduce((sum, e) => sum + e.amount, 0),
    pendingCount: entries.filter(e => e.state === 'PENDING').length,
    failedCount: entries.filter(e => e.state === 'FAILED').length,
    deliveredCount: entries.filter(e => e.state === 'DELIVERED').length,
  };
}
