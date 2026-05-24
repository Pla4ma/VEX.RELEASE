import { getSupabaseClient } from '../../config/supabase';
import {
  SupabaseSessionRowSchema,
  type SupabaseSessionRow,
} from './schemas';

export class SessionHistoryRepositoryError extends Error {
  constructor(operation: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Session history ${operation} failed: ${message}`);
    this.name = 'SessionHistoryRepositoryError';
  }
}

export async function fetchSessionHistoryRows(
  userId: string,
  limit: number,
): Promise<SupabaseSessionRow[]> {
  const { data, error } = await getSupabaseClient()
    .from('sessions')
    .select(
      [
        'id',
        'user_id',
        'status',
        'duration',
        'effective_duration',
        'quality_score',
        'mode',
        'difficulty',
        'metadata',
        'started_at',
        'completed_at',
        'ended_at',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new SessionHistoryRepositoryError('fetch', error);
  }

  return SupabaseSessionRowSchema.array().parse(data ?? []);
}
