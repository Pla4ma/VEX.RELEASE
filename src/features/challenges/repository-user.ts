import { getSupabaseClient } from '../../config/supabase';
import {
  UserChallengeSchema,
  type UserChallenge,
} from './schemas';
import {
  RepositoryError,
} from './repository-helpers';
import { fetchActiveChallengeDetails, fetchCompletedChallengeDetails } from './repository-details';

export { fetchActiveChallengeDetails, fetchCompletedChallengeDetails };

const supabase = getSupabaseClient();

const CHALLENGE_SELECT = 'id,user_id,challenge_id,current_value,status,assigned_at,completed_at,claimed_at,expires_at,reroll_count,rerolled_from_id,last_progress_at,progress_history,created_at';

export async function fetchUserChallenge(
  userId: string,
  challengeId: string,
): Promise<UserChallenge | null> {
  const { data, error } = await supabase
    .from('user_challenges')
    .select(CHALLENGE_SELECT)
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle();
  if (error) {
    throw new RepositoryError('fetchUserChallenge', error);
  }
  return data ? UserChallengeSchema.parse(data) : null;
}

export async function fetchUserChallenges(
  userId: string,
  filters?: { status?: string },
): Promise<UserChallenge[]> {
  let query = supabase
    .from('user_challenges')
    .select(CHALLENGE_SELECT)
    .eq('user_id', userId);
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  const { data, error } = await query.order('assigned_at', {
    ascending: false,
  });
  if (error) {
    throw new RepositoryError('fetchUserChallenges', error);
  }
  return (data ?? []).map((row) => UserChallengeSchema.parse(row));
}

export async function fetchUserActiveChallenges(
  userId: string,
): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from('user_challenges')
    .select(CHALLENGE_SELECT)
    .eq('user_id', userId)
    .in('status', ['ACTIVE', 'COMPLETED'])
    .order('assigned_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchUserActiveChallenges', error);
  }
  return (data ?? []).map((row) => UserChallengeSchema.parse(row));
}

export async function createUserChallenge(
  userId: string,
  challengeId: string,
  expiresAt?: number,
): Promise<UserChallenge> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      current_value: 0,
      status: 'ACTIVE',
      assigned_at: now,
      completed_at: null,
      claimed_at: null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      reroll_count: 0,
      created_at: now,
    })
    .select(CHALLENGE_SELECT)
    .single();
  if (error) {
    throw new RepositoryError('createUserChallenge', error);
  }
  return UserChallengeSchema.parse(data);
}

export async function updateUserChallenge(
  userId: string,
  challengeId: string,
  updates: Partial<
    Omit<UserChallenge, 'id' | 'userId' | 'challengeId' | 'createdAt'>
  >,
): Promise<UserChallenge> {
  const payload: Record<string, unknown> = {};
  if (updates.currentValue !== undefined) {
    payload.current_value = updates.currentValue;
  }
  if (updates.status !== undefined) {
    payload.status = updates.status;
  }
  if (updates.completedAt !== undefined) {
    payload.completed_at = updates.completedAt
      ? new Date(updates.completedAt).toISOString()
      : null;
  }
  if (updates.claimedAt !== undefined) {
    payload.claimed_at = updates.claimedAt
      ? new Date(updates.claimedAt).toISOString()
      : null;
  }
  if (updates.expiresAt !== undefined) {
    payload.expires_at = updates.expiresAt
      ? new Date(updates.expiresAt).toISOString()
      : null;
  }
  if (updates.rerollCount !== undefined) {
    payload.reroll_count = updates.rerollCount;
  }
  const { data, error } = await supabase
    .from('user_challenges')
    .update(payload)
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .select(CHALLENGE_SELECT)
    .single();
  if (error) {
    throw new RepositoryError('updateUserChallenge', error);
  }
  return UserChallengeSchema.parse(data);
}

export async function addChallengeProgress(
  userId: string,
  challengeId: string,
  delta: number,
  _source: string,
): Promise<UserChallenge> {
  const { data, error } = await supabase.rpc('atomic_increment_challenge_progress', {
    p_user_id: userId,
    p_challenge_id: challengeId,
    p_delta: delta,
  });
  if (error) {
    // Fallback: fetch then update (non-atomic, but RPC preferred)
    const current = await fetchUserChallenge(userId, challengeId);
    if (!current) {
      throw new RepositoryError('addChallengeProgress', 'Challenge not found');
    }
    return updateUserChallenge(userId, challengeId, {
      currentValue: current.currentValue + delta,
    });
  }
  return UserChallengeSchema.parse(data);
}
