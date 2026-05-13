/**
 * XP History Queries
 * Record and retrieve experience point history.
 */

import { XpEntrySchema, type XpEntry } from './schemas';
import { v4 } from '../../utils/uuid';
import { withResilience } from '../../utils/supabase-resilience';
import { RepositoryError, supabase } from './progression-queries';

// ============================================================================
// Fetch History
// ============================================================================

export async function fetchXpHistory(
  userId: string,
  options?: { limit?: number; since?: number }
): Promise<XpEntry[]> {
  let query = supabase
    .from('xp_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.since) {
    query = query.gte('created_at', options.since);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new RepositoryError('fetchXpHistory', error);
  }

  return XpEntrySchema.array().parse(data);
}

// ============================================================================
// Record Entry
// ============================================================================

export async function recordXpEntry(
  userId: string,
  entry: Omit<XpEntry, 'id' | 'userId'>
): Promise<XpEntry> {
  const newEntry = {
    id: v4(),
    user_id: userId,
    amount: entry.amount,
    source: entry.source,
    session_id: entry.sessionId,
    metadata: entry.metadata,
    created_at: entry.createdAt,
  };

  const { data, error } = await withResilience(
    supabase.from('xp_history').insert(newEntry).select().single(),
    { operation: 'recordXpEntry', fallbackValue: newEntry }
  );

  if (error) {
    throw new RepositoryError('recordXpEntry', error);
  }

  return XpEntrySchema.parse(data);
}

// ============================================================================
// Period Total
// ============================================================================

export async function fetchXpForPeriod(
  userId: string,
  startTime: number,
  endTime: number
): Promise<number> {
  const { data, error } = await supabase
    .from('xp_history')
    .select('amount')
    .eq('user_id', userId)
    .gte('created_at', startTime)
    .lte('created_at', endTime);

  if (error) {
    throw new RepositoryError('fetchXpForPeriod', error);
  }

  if (!data) {
    return 0;
  }
  return data.reduce(
    (sum: number, entry: { amount: number | null }) =>
      sum + (entry.amount || 0),
    0
  );
}
