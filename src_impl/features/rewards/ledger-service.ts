/**
 * Reward Ledger Service
 *
 * Tracks all rewards earned by users for visibility and audit purposes.
 * Provides a complete history of rewards with filtering and aggregation.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('rewards:ledger');

// ============================================================================
// Types & Schemas
// ============================================================================

export interface RewardLedgerEntry {
  id: string;
  userId: string;
  type: 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'BADGE';
  amount: number;
  source: string;
  description: string;
  earnedAt: number;
  sessionId?: string;
}

const RewardLedgerRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['XP', 'COINS', 'GEMS', 'ITEM', 'BADGE']),
  amount: z.number(),
  source: z.string(),
  description: z.string(),
  earned_at: z.number(),
  session_id: z.string().uuid().nullable().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

function mapRowToEntry(row: z.infer<typeof RewardLedgerRowSchema>): RewardLedgerEntry {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amount: row.amount,
    source: row.source,
    description: row.description,
    earnedAt: row.earned_at,
    sessionId: row.session_id ?? undefined,
  };
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get reward ledger entries for a user with pagination and filtering
 */
export async function getRewardLedger(
  userId: string,
  options?: { limit?: number; offset?: number; type?: RewardLedgerEntry['type'] }
): Promise<RewardLedgerEntry[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('reward_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

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

  const { data, error } = await query;

  if (error) {
    debug.error('Failed to fetch reward ledger', error);
    throw new Error(`Failed to fetch reward ledger: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToEntry(RewardLedgerRowSchema.parse(row)));
}

/**
 * Get today's reward summary for a user
 */
export async function getTodayRewardSummary(userId: string): Promise<{
  totalXP: number;
  totalCoins: number;
  totalGems: number;
  sessionCount: number;
  entriesCount: number;
}> {
  const supabase = getSupabaseClient();

  // Get start of day timestamp
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startTimestamp = startOfDay.getTime();

  const { data, error } = await supabase
    .from('reward_ledger')
    .select('*')
    .eq('user_id', userId)
    .gte('earned_at', startTimestamp);

  if (error) {
    debug.error('Failed to fetch today reward summary', error);
    throw new Error(`Failed to fetch today's reward summary: ${error.message}`);
  }

  const entries = (data ?? []).map((row) => mapRowToEntry(RewardLedgerRowSchema.parse(row)));

  return {
    totalXP: entries.filter((e) => e.type === 'XP').reduce((sum, e) => sum + e.amount, 0),
    totalCoins: entries.filter((e) => e.type === 'COINS').reduce((sum, e) => sum + e.amount, 0),
    totalGems: entries.filter((e) => e.type === 'GEMS').reduce((sum, e) => sum + e.amount, 0),
    sessionCount: new Set(entries.map((e) => e.sessionId).filter(Boolean)).size,
    entriesCount: entries.length,
  };
}

/**
 * Record a new reward ledger entry
 */
export async function recordRewardLedgerEntry(
  entry: Omit<RewardLedgerEntry, 'id'>
): Promise<RewardLedgerEntry> {
  const supabase = getSupabaseClient();

  const row = {
    user_id: entry.userId,
    type: entry.type,
    amount: entry.amount,
    source: entry.source,
    description: entry.description,
    earned_at: entry.earnedAt,
    session_id: entry.sessionId ?? null,
  };

  const { data, error } = await supabase.from('reward_ledger').insert(row).select().single();

  if (error) {
    debug.error('Failed to record reward ledger entry', error);
    throw new Error(`Failed to record reward ledger entry: ${error.message}`);
  }

  const parsed = RewardLedgerRowSchema.parse(data);
  debug.info('Recorded reward ledger entry: %s for user %s', parsed.id, parsed.user_id);

  return mapRowToEntry(parsed);
}
