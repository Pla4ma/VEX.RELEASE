import { getSupabaseClient } from '../../config/supabase';
import type { FocusScoreHistoryPoint } from './types';
import {
  AppendFocusScoreHistoryEventSchema,
  FocusScoreHistoryRowSchema,
  type AppendFocusScoreHistoryEvent,
} from './repository-focus-score.schemas';
import { createDebugger } from '../../utils/debug';
import { withResilience } from '../../utils/supabase-resilience';
import { FocusIdentityRepositoryError } from './focus-score-queries';

const debug = createDebugger('focus-identity:repository');

export function mapHistoryRowToPoint(row: unknown): FocusScoreHistoryPoint {
  const parsed = FocusScoreHistoryRowSchema.parse(row);
  return {
    timestamp: parsed.occurred_at,
    score: parsed.score,
    delta: parsed.delta,
    reason: parsed.reason,
  };
}

export async function appendFocusScoreHistory(event: AppendFocusScoreHistoryEvent): Promise<FocusScoreHistoryPoint> {
  const validatedEvent = AppendFocusScoreHistoryEventSchema.parse(event);
  const supabase = getSupabaseClient();
  const { data, error } = await withResilience(
    supabase
      .from('focus_score_history')
      .insert({
        user_id: validatedEvent.userId,
        occurred_at: validatedEvent.timestamp,
        score: validatedEvent.score,
        delta: validatedEvent.delta,
        reason: validatedEvent.reason,
      })
      .select('user_id, occurred_at, score, delta, reason')
      .single(),
    { operation: 'appendFocusScoreHistory' }
  );

  if (error) {
    throw new FocusIdentityRepositoryError('appendFocusScoreHistory', error);
  }

  return mapHistoryRowToPoint(data);
}

export async function fetchFocusScoreHistory(userId: string, days: number): Promise<FocusScoreHistoryPoint[]> {
  try {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('focus_score_history')
      .select('user_id, occurred_at, score, delta, reason')
      .eq('user_id', userId)
      .gte('occurred_at', cutoff.toISOString())
      .order('occurred_at', { ascending: true });

    if (error) {
      debug.warn('Supabase fetchFocusScoreHistory failed, returning empty fallback', error);
      return [];
    }

    return (data ?? []).map(mapHistoryRowToPoint);
  } catch (err) {
    debug.error('Unexpected error in fetchFocusScoreHistory', err as Error);
    return [];
  }
}
