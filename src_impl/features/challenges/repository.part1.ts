import { getSupabaseClient } from "../../config/supabase";
import { ChallengeDetailSchema, ChallengeSchema, ChallengeTemplateSchema, UserChallengeSchema, type Challenge, type ChallengeDetail, type ChallengeTemplate, type UserChallenge } from "./schemas";


export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(`Repository error in ${operation}: ${String(originalError)}`);
    this.name = 'RepositoryError';
  }
}

export async function fetchChallengeById(challengeId: string): Promise<Challenge | null> {
  const { data, error } = await supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle();
  if (error) {
    throw new RepositoryError('fetchChallengeById', error);
  }
  return data ? ChallengeSchema.parse(data) : null;
}

export async function fetchActiveChallenges(seasonId: string): Promise<Challenge[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('challenges').select('*').eq('season_id', seasonId).eq('is_active', true).lte('start_at', now).gte('end_at', now);
  if (error) {
    throw new RepositoryError('fetchActiveChallenges', error);
  }
  return (data ?? []).map((row) => ChallengeSchema.parse(row));
}

export async function fetchChallengesByType(seasonId: string, type: 'DAILY' | 'WEEKLY' | 'EVENT'): Promise<Challenge[]> {
  const { data, error } = await supabase.from('challenges').select('*').eq('season_id', seasonId).eq('type', type).eq('is_active', true).order('created_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchChallengesByType', error);
  }
  return (data ?? []).map((row) => ChallengeSchema.parse(row));
}

export async function fetchChallengeTemplates(): Promise<ChallengeTemplate[]> {
  const { data, error } = await supabase.from('challenge_templates').select('*').eq('is_active', true);
  if (error) {
    throw new RepositoryError('fetchChallengeTemplates', error);
  }
  return (data ?? []).map((row) => ChallengeTemplateSchema.parse(row));
}

export async function fetchUserChallenge(userId: string, challengeId: string): Promise<UserChallenge | null> {
  const { data, error } = await supabase.from('user_challenges').select('*').eq('user_id', userId).eq('challenge_id', challengeId).maybeSingle();
  if (error) {
    throw new RepositoryError('fetchUserChallenge', error);
  }
  return data ? UserChallengeSchema.parse(data) : null;
}

export async function fetchUserChallenges(userId: string, filters?: { status?: string }): Promise<UserChallenge[]> {
  let query = supabase.from('user_challenges').select('*').eq('user_id', userId);
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  const { data, error } = await query.order('assigned_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchUserChallenges', error);
  }
  return (data ?? []).map((row) => UserChallengeSchema.parse(row));
}

export async function fetchUserActiveChallenges(userId: string): Promise<UserChallenge[]> {
  const { data, error } = await supabase.from('user_challenges').select('*').eq('user_id', userId).in('status', ['ACTIVE', 'COMPLETED']).order('assigned_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchUserActiveChallenges', error);
  }
  return (data ?? []).map((row) => UserChallengeSchema.parse(row));
}

export async function fetchActiveChallengeDetails(userId: string): Promise<ChallengeDetail[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('user_challenges').select(baseJoinedSelect).eq('user_id', userId).in('status', ['ACTIVE', 'COMPLETED']).or(`expires_at.is.null,expires_at.gt.${now}`).order('assigned_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchActiveChallengeDetails', error);
  }
  return (data ?? []).map((row) => mapJoinedChallenge(row as Record<string, unknown>));
}

export async function fetchCompletedChallengeDetails(userId: string, limit: number): Promise<ChallengeDetail[]> {
  const { data, error } = await supabase.from('user_challenges').select(baseJoinedSelect).eq('user_id', userId).in('status', ['COMPLETED', 'CLAIMED']).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(limit);
  if (error) {
    throw new RepositoryError('fetchCompletedChallengeDetails', error);
  }
  return (data ?? []).map((row) => mapJoinedChallenge(row as Record<string, unknown>));
}

export async function createUserChallenge(userId: string, challengeId: string, expiresAt?: number): Promise<UserChallenge> {
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
    .select('*')
    .single();
  if (error) {
    throw new RepositoryError('createUserChallenge', error);
  }
  return UserChallengeSchema.parse(data);
}

export async function updateUserChallenge(userId: string, challengeId: string, updates: Partial<Omit<UserChallenge, 'id' | 'userId' | 'challengeId' | 'createdAt'>>): Promise<UserChallenge> {
  const payload: Record<string, unknown> = {};
  if (updates.currentValue !== undefined) {
    payload.current_value = updates.currentValue;
  }
  if (updates.status !== undefined) {
    payload.status = updates.status;
  }
  if (updates.completedAt !== undefined) {
    payload.completed_at = updates.completedAt ? new Date(updates.completedAt).toISOString() : null;
  }
  if (updates.claimedAt !== undefined) {
    payload.claimed_at = updates.claimedAt ? new Date(updates.claimedAt).toISOString() : null;
  }
  if (updates.expiresAt !== undefined) {
    payload.expires_at = updates.expiresAt ? new Date(updates.expiresAt).toISOString() : null;
  }
  if (updates.rerollCount !== undefined) {
    payload.reroll_count = updates.rerollCount;
  }
  const { data, error } = await supabase.from('user_challenges').update(payload).eq('user_id', userId).eq('challenge_id', challengeId).select('*').single();
  if (error) {
    throw new RepositoryError('updateUserChallenge', error);
  }
  return UserChallengeSchema.parse(data);
}

export async function addChallengeProgress(userId: string, challengeId: string, delta: number, _source: string): Promise<UserChallenge> {
  const current = await fetchUserChallenge(userId, challengeId);
  if (!current) {
    throw new RepositoryError('addChallengeProgress', 'Challenge not found');
  }
  return updateUserChallenge(userId, challengeId, { currentValue: current.currentValue + delta });
}

export async function recordReroll(userId: string, originalChallengeId: string, newChallengeId: string, rerollType: 'FREE' | 'PAID', gemsSpent: number): Promise<void> {
  const { error } = await supabase.from('challenge_rerolls').insert({
    user_id: userId,
    original_challenge_id: originalChallengeId,
    new_challenge_id: newChallengeId,
    reroll_type: rerollType,
    gems_spent: gemsSpent,
    rerolled_at: new Date().toISOString(),
  });
  if (error) {
    throw new RepositoryError('recordReroll', error);
  }
}

export async function getRerollCountToday(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase.from('challenge_rerolls').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('rerolled_at', today);
  if (error) {
    throw new RepositoryError('getRerollCountToday', error);
  }
  return count ?? 0;
}