/**
 * Seasons Feature - Repository
 *
 * Supabase queries and storage access for seasons.
 */

import { getSupabaseClient } from '../../config/supabase';
import {
  SeasonHistorySchema,
  SeasonSchema,
  UserSeasonProgressSchema,
  type CreateSeasonInput,
  type Season,
  type SeasonHistory,
  type UpdateSeasonInput,
  type UserSeasonProgress,
} from './schemas';

const supabase = getSupabaseClient();

type UserBattlePassRow = {
  id: string;
  user_id: string;
  season_id: string;
  current_tier: number | null;
  tier_xp: number | null;
  total_xp: number | null;
  is_premium: boolean | null;
  premium_purchased_at: string | null;
  claimed_free_tiers: number[] | null;
  claimed_premium_tiers: number[] | null;
  created_at: string | null;
  updated_at: string | null;
};

export interface UserBattlePassRecord {
  id: string;
  userId: string;
  seasonId: string;
  currentTier: number;
  tierXp: number;
  totalXp: number;
  isPremium: boolean;
  premiumPurchasedAt: number | null;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
  createdAt: number;
  updatedAt: number;
}

export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${String(originalError)}`);
    this.name = 'RepositoryError';
  }
}

function toTimestamp(value: string | null): number | null {
  return value ? new Date(value).getTime() : null;
}

function mapSeasonRow(row: {
  id: string;
  name: string;
  description: string | null;
  theme: string | null;
  start_at: string;
  end_at: string;
  archived_at: string | null;
  tier_count: number;
  xp_per_tier: number;
  premium_price_gems: number;
  is_active: boolean | null;
  created_at: string | null;
}): Season {
  return SeasonSchema.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    theme: row.theme,
    startAt: new Date(row.start_at).getTime(),
    endAt: new Date(row.end_at).getTime(),
    archivedAt: toTimestamp(row.archived_at),
    tierCount: row.tier_count,
    xpPerTier: row.xp_per_tier,
    premiumPriceGems: row.premium_price_gems,
    isActive: row.is_active ?? false,
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
  });
}

function mapProgressRow(row: {
  id: string;
  user_id: string;
  season_id: string;
  current_tier: number | null;
  tier_xp: number | null;
  total_season_xp: number | null;
  is_premium: boolean | null;
  premium_purchased_at: string | null;
  claimed_tiers: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}): UserSeasonProgress {
  return UserSeasonProgressSchema.parse({
    id: row.id,
    userId: row.user_id,
    seasonId: row.season_id,
    currentTier: row.current_tier ?? 0,
    tierXp: row.tier_xp ?? 0,
    totalSeasonXp: row.total_season_xp ?? 0,
    isPremium: row.is_premium ?? false,
    premiumPurchasedAt: toTimestamp(row.premium_purchased_at),
    claimedTiers: row.claimed_tiers ?? [],
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
    updatedAt: toTimestamp(row.updated_at) ?? Date.now(),
  });
}

function mapSeasonHistoryRow(row: {
  id: string;
  user_id: string;
  season_id: string;
  final_tier: number;
  total_xp_earned: number;
  challenges_completed: number | null;
  rewards_claimed: number | null;
  was_premium: boolean | null;
  completed_at: string | null;
}): SeasonHistory {
  return SeasonHistorySchema.parse({
    id: row.id,
    userId: row.user_id,
    seasonId: row.season_id,
    finalTier: row.final_tier,
    totalXpEarned: row.total_xp_earned,
    challengesCompleted: row.challenges_completed ?? 0,
    rewardsClaimed: row.rewards_claimed ?? 0,
    wasPremium: row.was_premium ?? false,
    completedAt: toTimestamp(row.completed_at) ?? Date.now(),
  });
}

function mapUserBattlePassRow(row: UserBattlePassRow): UserBattlePassRecord {
  return {
    id: row.id,
    userId: row.user_id,
    seasonId: row.season_id,
    currentTier: row.current_tier ?? 0,
    tierXp: row.tier_xp ?? 0,
    totalXp: row.total_xp ?? 0,
    isPremium: row.is_premium ?? false,
    premiumPurchasedAt: toTimestamp(row.premium_purchased_at),
    claimedFreeTiers: row.claimed_free_tiers ?? [],
    claimedPremiumTiers: row.claimed_premium_tiers ?? [],
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
    updatedAt: toTimestamp(row.updated_at) ?? Date.now(),
  };
}

export async function fetchActiveSeason(): Promise<Season | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .lte('start_at', now)
    .gte('end_at', now)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchActiveSeason', error);
  }

  return mapSeasonRow(data);
}

export async function fetchSeasonById(seasonId: string): Promise<Season | null> {
  const { data, error } = await supabase.from('seasons').select('*').eq('id', seasonId).single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchSeasonById', error);
  }

  return mapSeasonRow(data);
}

export async function fetchSeasonsByPhase(
  phase: 'upcoming' | 'active' | 'ended' | 'archived'
): Promise<Season[]> {
  const now = new Date().toISOString();
  let query = supabase.from('seasons').select('*');

  if (phase === 'upcoming') {
    query = query.gt('start_at', now);
  }
  if (phase === 'active') {
    query = query.lte('start_at', now).gte('end_at', now).eq('is_active', true);
  }
  if (phase === 'ended') {
    query = query.lt('end_at', now).is('archived_at', null);
  }
  if (phase === 'archived') {
    query = query.not('archived_at', 'is', null);
  }

  const { data, error } = await query.order('start_at', { ascending: false });
  if (error) {
    throw new RepositoryError('fetchSeasonsByPhase', error);
  }

  return (data ?? []).map(mapSeasonRow);
}

export async function createSeason(input: CreateSeasonInput): Promise<Season> {
  const { data, error } = await supabase
    .from('seasons')
    .insert({
      name: input.name,
      description: input.description ?? null,
      theme: input.theme ?? null,
      start_at: new Date(input.startAt).toISOString(),
      end_at: new Date(input.endAt).toISOString(),
      tier_count: input.tierCount,
      xp_per_tier: input.xpPerTier,
      premium_price_gems: input.premiumPriceGems,
      is_active: false,
    })
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('createSeason', error);
  }

  return mapSeasonRow(data);
}

export async function updateSeason(seasonId: string, input: UpdateSeasonInput): Promise<Season> {
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) {updates.name = input.name;}
  if (input.description !== undefined) {updates.description = input.description;}
  if (input.theme !== undefined) {updates.theme = input.theme;}
  if (input.endAt !== undefined) {updates.end_at = new Date(input.endAt).toISOString();}
  if (input.isActive !== undefined) {updates.is_active = input.isActive;}

  const { data, error } = await supabase
    .from('seasons')
    .update(updates)
    .eq('id', seasonId)
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('updateSeason', error);
  }

  return mapSeasonRow(data);
}

export async function archiveSeason(seasonId: string): Promise<Season> {
  const { data, error } = await supabase
    .from('seasons')
    .update({ archived_at: new Date().toISOString(), is_active: false })
    .eq('id', seasonId)
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('archiveSeason', error);
  }

  return mapSeasonRow(data);
}

export async function fetchUserSeasonProgress(
  userId: string,
  seasonId: string
): Promise<UserSeasonProgress | null> {
  const { data, error } = await supabase
    .from('user_season_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchUserSeasonProgress', error);
  }

  return mapProgressRow(data);
}

export async function createUserSeasonProgress(
  userId: string,
  seasonId: string
): Promise<UserSeasonProgress> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('user_season_progress')
    .insert({
      user_id: userId,
      season_id: seasonId,
      current_tier: 0,
      tier_xp: 0,
      total_season_xp: 0,
      is_premium: false,
      premium_purchased_at: null,
      claimed_tiers: [],
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('createUserSeasonProgress', error);
  }

  return mapProgressRow(data);
}

export async function updateUserSeasonProgress(
  userId: string,
  seasonId: string,
  updates: Partial<Omit<UserSeasonProgress, 'id' | 'userId' | 'seasonId' | 'createdAt'>>
): Promise<UserSeasonProgress> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.currentTier !== undefined) {updateData.current_tier = updates.currentTier;}
  if (updates.tierXp !== undefined) {updateData.tier_xp = updates.tierXp;}
  if (updates.totalSeasonXp !== undefined) {updateData.total_season_xp = updates.totalSeasonXp;}
  if (updates.isPremium !== undefined) {updateData.is_premium = updates.isPremium;}
  if (updates.premiumPurchasedAt !== undefined) {
    updateData.premium_purchased_at = updates.premiumPurchasedAt
      ? new Date(updates.premiumPurchasedAt).toISOString()
      : null;
  }
  if (updates.claimedTiers !== undefined) {updateData.claimed_tiers = updates.claimedTiers;}

  const { data, error } = await supabase
    .from('user_season_progress')
    .update(updateData)
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('updateUserSeasonProgress', error);
  }

  return mapProgressRow(data);
}

export async function markTierClaimed(
  userId: string,
  seasonId: string,
  tierId: string
): Promise<UserSeasonProgress> {
  const existing = await fetchUserSeasonProgress(userId, seasonId);
  if (!existing) {
    throw new RepositoryError('markTierClaimed', 'User season progress not found');
  }

  const claimedTiers = existing.claimedTiers.includes(tierId)
    ? existing.claimedTiers
    : [...existing.claimedTiers, tierId];

  return updateUserSeasonProgress(userId, seasonId, { claimedTiers });
}

export async function fetchUserBattlePass(
  userId: string,
  seasonId: string
): Promise<UserBattlePassRecord | null> {
  const { data, error } = await supabase
    .from('user_battle_pass')
    .select('*')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchUserBattlePass', error);
  }

  return mapUserBattlePassRow(data as UserBattlePassRow);
}

export async function createUserBattlePass(
  userId: string,
  seasonId: string
): Promise<UserBattlePassRecord> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('user_battle_pass')
    .insert({
      user_id: userId,
      season_id: seasonId,
      current_tier: 0,
      tier_xp: 0,
      total_xp: 0,
      is_premium: false,
      premium_purchased_at: null,
      claimed_free_tiers: [],
      claimed_premium_tiers: [],
      created_at: nowIso,
      updated_at: nowIso,
    })
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('createUserBattlePass', error);
  }

  return mapUserBattlePassRow(data as UserBattlePassRow);
}

export async function updateUserBattlePass(
  userId: string,
  seasonId: string,
  updates: Partial<Omit<UserBattlePassRecord, 'id' | 'userId' | 'seasonId' | 'createdAt'>>
): Promise<UserBattlePassRecord> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.currentTier !== undefined) {updateData.current_tier = updates.currentTier;}
  if (updates.tierXp !== undefined) {updateData.tier_xp = updates.tierXp;}
  if (updates.totalXp !== undefined) {updateData.total_xp = updates.totalXp;}
  if (updates.isPremium !== undefined) {updateData.is_premium = updates.isPremium;}
  if (updates.premiumPurchasedAt !== undefined) {
    updateData.premium_purchased_at = updates.premiumPurchasedAt
      ? new Date(updates.premiumPurchasedAt).toISOString()
      : null;
  }
  if (updates.claimedFreeTiers !== undefined) {
    updateData.claimed_free_tiers = updates.claimedFreeTiers;
  }
  if (updates.claimedPremiumTiers !== undefined) {
    updateData.claimed_premium_tiers = updates.claimedPremiumTiers;
  }

  const { data, error } = await supabase
    .from('user_battle_pass')
    .update(updateData)
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('updateUserBattlePass', error);
  }

  return mapUserBattlePassRow(data as UserBattlePassRow);
}

export async function fetchSeasonTierId(seasonId: string, tierNumber: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('battle_pass_tiers')
    .select('id')
    .eq('season_id', seasonId)
    .eq('tier_number', tierNumber)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchSeasonTierId', error);
  }

  return data.id;
}

export async function fetchUserSeasonHistory(userId: string): Promise<SeasonHistory[]> {
  const { data, error } = await supabase
    .from('season_history')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    throw new RepositoryError('fetchUserSeasonHistory', error);
  }

  return (data ?? []).map(mapSeasonHistoryRow);
}

export async function createSeasonHistory(history: Omit<SeasonHistory, 'id'>): Promise<SeasonHistory> {
  const { data, error } = await supabase
    .from('season_history')
    .insert({
      user_id: history.userId,
      season_id: history.seasonId,
      final_tier: history.finalTier,
      total_xp_earned: history.totalXpEarned,
      challenges_completed: history.challengesCompleted,
      rewards_claimed: history.rewardsClaimed,
      was_premium: history.wasPremium,
      completed_at: new Date(history.completedAt).toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('createSeasonHistory', error);
  }

  return mapSeasonHistoryRow(data);
}

export async function fetchSeasonStats(seasonId: string): Promise<{
  totalParticipants: number;
  premiumParticipants: number;
  averageTier: number;
} | null> {
  const { data, error } = await supabase.rpc('get_season_stats', { p_season_id: seasonId });
  if (error) {
    throw new RepositoryError('fetchSeasonStats', error);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return null;
  }

  return {
    totalParticipants: row.total_participants ?? 0,
    premiumParticipants: row.premium_participants ?? 0,
    averageTier: row.average_tier ?? 0,
  };
}

export async function fetchSeasonLeaderboard(
  seasonId: string,
  limit = 100
): Promise<Array<{ userId: string; tier: number; xp: number }>> {
  const { data, error } = await supabase
    .from('user_season_progress')
    .select('user_id, current_tier, total_season_xp')
    .eq('season_id', seasonId)
    .order('current_tier', { ascending: false })
    .order('total_season_xp', { ascending: false })
    .limit(limit);

  if (error) {
    throw new RepositoryError('fetchSeasonLeaderboard', error);
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    tier: row.current_tier ?? 0,
    xp: row.total_season_xp ?? 0,
  }));
}
