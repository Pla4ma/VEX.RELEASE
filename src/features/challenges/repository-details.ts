import { getSupabaseClient } from '../../config/supabase';
import type { ChallengeDetail } from './schemas';
import {
  RepositoryError,
  baseJoinedSelect,
  mapJoinedChallenge,
} from './repository-helpers';

const supabase = getSupabaseClient();

/** Supabase joined row type for challenge detail queries. */
type JoinedChallengeRow = Record<string, unknown>;

export async function fetchActiveChallengeDetails(
  userId: string,
): Promise<ChallengeDetail[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('user_challenges')
    .select(baseJoinedSelect)
    .eq('user_id', userId)
    .in('status', ['ACTIVE', 'COMPLETED'])
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('assigned_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchActiveChallengeDetails', error);
  }
  return (data ?? []).map((row) =>
    // Cast needed: Supabase joined result type doesn't match JoinedChallengeRow exactly;
    // Zod validates the shape inside mapJoinedChallenge
    mapJoinedChallenge(row as JoinedChallengeRow),
  );
}

export async function fetchCompletedChallengeDetails(
  userId: string,
  limit: number,
): Promise<ChallengeDetail[]> {
  const { data, error } = await supabase
    .from('user_challenges')
    .select(baseJoinedSelect)
    .eq('user_id', userId)
    .in('status', ['COMPLETED', 'CLAIMED'])
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new RepositoryError('fetchCompletedChallengeDetails', error);
  }
  return (data ?? []).map((row) =>
    // Cast needed: Supabase joined result type doesn't match JoinedChallengeRow exactly;
    // Zod validates the shape inside mapJoinedChallenge
    mapJoinedChallenge(row as JoinedChallengeRow),
  );
}
