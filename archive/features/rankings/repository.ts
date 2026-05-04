/**
 * Rankings Repository
 *
 * Supabase queries for ranking operations.
 */

import { getSupabaseClient } from '../../config/supabase';
import { z } from 'zod';
import {
  LeaderboardSchema,
  LeaderboardEntrySchema,
  RankTierSchema,
  UserRankingSchema,
  SeasonSummarySchema,
  type Leaderboard,
  type LeaderboardEntry,
  type RankTier,
  type UserRanking,
  type SeasonSummary,
  type LeaderboardType,
  type LeaderboardScope,
  type LeaderboardPeriod,
} from './schemas';

class RepositoryError extends Error {
  constructor(public operation: string, public originalError: unknown) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

export const UserSeasonDataSchema = z.object({
  name: z.string(),
  rank: z.number().int().min(1),
  tier: z.string(),
  totalParticipants: z.number().int().min(1),
  xpGained: z.number(),
  sessionsCompleted: z.number().int().min(0),
  totalFocusTime: z.number().min(0),
  streakHigh: z.number().int().min(0),
  duelsWon: z.number().int().min(0),
  duelsPlayed: z.number().int().min(0),
}).strict();

export type UserSeasonData = z.infer<typeof UserSeasonDataSchema>;

const JoinedUserSchema = z.object({
  display_name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  level: z.number().nullable().optional(),
  title: z.string().nullable().optional(),
}).nullable().optional();

const LeaderboardEntryRowSchema = z.object({
  user_id: z.string(),
  rank: z.number(),
  previous_rank: z.number().nullable().optional(),
  value: z.number(),
  display_value: z.string().nullable().optional(),
  rank_change: z.number().nullable().optional(),
  value_change: z.number().nullable().optional(),
  users: JoinedUserSchema,
}).passthrough();

const LeaderboardRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  scope: z.string(),
  period: z.string(),
  starts_at: z.union([z.string(), z.number()]).nullable().optional(),
  ends_at: z.union([z.string(), z.number()]).nullable().optional(),
  total_participants: z.number().nullable().optional(),
  updated_at: z.union([z.string(), z.number()]).nullable().optional(),
  frozen: z.boolean().nullable().optional(),
}).passthrough();

function timestampFromValue(value: string | number | null | undefined, fallback: number): number {
  if (typeof value === 'number') {return value;}
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function mapLeaderboardRow(row: unknown, fallback: {
  type: LeaderboardType;
  scope: LeaderboardScope;
  period: LeaderboardPeriod;
}): Leaderboard {
  const parsed = LeaderboardRowSchema.parse(row);
  const now = Date.now();
  return LeaderboardSchema.parse({
    id: parsed.id,
    type: fallback.type,
    scope: fallback.scope,
    period: fallback.period,
    startsAt: timestampFromValue(parsed.starts_at, now),
    endsAt: timestampFromValue(parsed.ends_at, now + getPeriodDuration(fallback.period)),
    entries: [],
    totalParticipants: parsed.total_participants ?? 0,
    updatedAt: timestampFromValue(parsed.updated_at, now),
    frozen: parsed.frozen ?? false,
  });
}

function mapLeaderboardEntryRow(row: unknown): LeaderboardEntry {
  const parsed = LeaderboardEntryRowSchema.parse(row);
  const joinedUser = parsed.users;
  const displayName =
    joinedUser?.display_name?.trim() ||
    joinedUser?.username?.trim() ||
    parsed.user_id.slice(0, 8);

  return LeaderboardEntrySchema.parse({
    userId: parsed.user_id,
    rank: parsed.rank,
    previousRank: parsed.previous_rank ?? null,
    value: parsed.value,
    displayValue: parsed.display_value ?? parsed.value.toLocaleString(),
    rankChange: parsed.rank_change ?? 0,
    valueChange: parsed.value_change ?? 0,
    displayName,
    avatarUrl: joinedUser?.avatar_url ?? null,
    level: joinedUser?.level ?? 1,
    title: joinedUser?.title ?? null,
  });
}

// Leaderboards
export async function fetchLeaderboard(
  type: LeaderboardType,
  scope: LeaderboardScope,
  period: LeaderboardPeriod,
  options: { squadId?: string; guildId?: string; limit?: number } = {}
): Promise<Leaderboard> {
  const { limit = 50, squadId, guildId } = options;

  let query = supabase.from('leaderboards').select('*').eq('type', type).eq('scope', scope).eq('period', period);

  if (squadId) {query = query.eq('squad_id', squadId);}
  if (guildId) {query = query.eq('guild_id', guildId);}

  const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (error) {throw new RepositoryError('fetchLeaderboard', error);}

  if (data) {return mapLeaderboardRow(data, { type, scope, period });}

  // Return empty leaderboard if none exists
  return {
    id: crypto.randomUUID(),
    type,
    scope,
    period,
    startsAt: Date.now(),
    endsAt: Date.now() + getPeriodDuration(period),
    entries: [],
    totalParticipants: 0,
    updatedAt: Date.now(),
    frozen: false,
  };
}

export async function fetchLeaderboardEntries(
  leaderboardId: string,
  options: { nearUserId?: string; limit?: number } = {}
): Promise<LeaderboardEntry[]> {
  const { nearUserId, limit = 50 } = options;

  let query = supabase.from('leaderboard_entries').select('*, users:user_id (display_name, avatar_url, level, title)').eq('leaderboard_id', leaderboardId);

  if (nearUserId) {
    // Get user's rank and fetch nearby entries
    const { data: userEntry, error: userEntryError } = await supabase.from('leaderboard_entries').select('rank').eq('leaderboard_id', leaderboardId).eq('user_id', nearUserId).maybeSingle();
    if (userEntryError) {throw new RepositoryError('fetchLeaderboardEntries.userRank', userEntryError);}
    const parsedUserEntry = z.object({ rank: z.number() }).safeParse(userEntry);
    if (parsedUserEntry.success) {
      const userRank = parsedUserEntry.data.rank;
      query = query.gte('rank', Math.max(1, userRank - 10)).lte('rank', userRank + 10);
    }
  } else {
    query = query.order('rank', { ascending: true }).limit(limit);
  }

  const { data, error } = await query;
  if (error) {throw new RepositoryError('fetchLeaderboardEntries', error);}

  return (data ?? []).map(mapLeaderboardEntryRow);
}

export async function fetchUserRank(
  userId: string,
  type: LeaderboardType,
  scope: LeaderboardScope,
  period: LeaderboardPeriod
): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase.from('leaderboard_entries').select('*, users:user_id (display_name, avatar_url, level, title)').eq('user_id', userId).eq('type', type).eq('scope', scope).eq('period', period).single();
  if (error) { if (error.code === 'PGRST116') {return null;} throw new RepositoryError('fetchUserRank', error); }
  if (!data) {return null;}
  return mapLeaderboardEntryRow(data);
}

// Rank Tiers
export async function fetchRankTiers(): Promise<RankTier[]> {
  const { data, error } = await supabase.from('rank_tiers').select('*').order('level', { ascending: true });
  if (error) {throw new RepositoryError('fetchRankTiers', error);}
  return RankTierSchema.array().parse(data || []);
}

export async function fetchRankTierByLevel(level: number): Promise<RankTier | null> {
  const { data, error } = await supabase.from('rank_tiers').select('*').eq('level', level).single();
  if (error) { if (error.code === 'PGRST116') {return null;} throw new RepositoryError('fetchRankTierByLevel', error); }
  return RankTierSchema.parse(data);
}

// User Rankings
export async function fetchUserRanking(userId: string): Promise<UserRanking | null> {
  const { data, error } = await supabase.from('user_rankings').select('*').eq('user_id', userId).single();
  if (error) { if (error.code === 'PGRST116') {return null;} throw new RepositoryError('fetchUserRanking', error); }
  return UserRankingSchema.parse(data);
}

export async function updateUserRanking(userId: string, updates: Partial<UserRanking>): Promise<void> {
  const { error } = await supabase.from('user_rankings').update({ ...updates, updated_at: Date.now() }).eq('user_id', userId);
  if (error) {throw new RepositoryError('updateUserRanking', error);}
}

// Season Summaries
export async function fetchSeasonSummary(userId: string, seasonId?: string): Promise<SeasonSummary | null> {
  let query = supabase.from('season_summaries').select('*').eq('user_id', userId);
  if (seasonId) {query = query.eq('season_id', seasonId);}
  else {query = query.order('generated_at', { ascending: false }).limit(1);}

  const { data, error } = await query.maybeSingle();
  if (error) {throw new RepositoryError('fetchSeasonSummary', error);}
  return data ? SeasonSummarySchema.parse(data) : null;
}

export async function fetchSeasonHistory(userId: string, limit: number = 5): Promise<SeasonSummary[]> {
  const { data, error } = await supabase.from('season_summaries').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(limit);
  if (error) {throw new RepositoryError('fetchSeasonHistory', error);}
  return SeasonSummarySchema.array().parse(data || []);
}

// Update Leaderboard Entry
export async function updateLeaderboardEntry(
  leaderboardId: string,
  userId: string,
  value: number,
  displayValue: string
): Promise<void> {
  const { error } = await supabase.rpc('update_leaderboard_entry', {
    p_leaderboard_id: leaderboardId,
    p_user_id: userId,
    p_value: value,
    p_display_value: displayValue,
  });
  if (error) {throw new RepositoryError('updateLeaderboardEntry', error);}
}

export async function fetchUserSeasonData(userId: string, seasonId: string): Promise<UserSeasonData> {
  const [progressResult, seasonResult] = await Promise.all([
    supabase
      .from('user_season_progress')
      .select('total_season_xp, current_tier, updated_at')
      .eq('user_id', userId)
      .eq('season_id', seasonId)
      .maybeSingle(),
    supabase
      .from('seasons')
      .select('name, tier_count')
      .eq('id', seasonId)
      .maybeSingle(),
  ]);

  if (progressResult.error) {throw new RepositoryError('fetchUserSeasonData.progress', progressResult.error);}
  if (seasonResult.error) {throw new RepositoryError('fetchUserSeasonData.season', seasonResult.error);}

  const progress = z.object({
    total_season_xp: z.number().nullable().optional(),
    current_tier: z.number().nullable().optional(),
  }).nullable().parse(progressResult.data);
  const season = z.object({
    name: z.string(),
    tier_count: z.number().nullable().optional(),
  }).nullable().parse(seasonResult.data);

  if (!season) {throw new RepositoryError('fetchUserSeasonData', new Error('Season not found'));}

  const currentTier = progress?.current_tier ?? 1;
  const tierNames = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Legend'] as const;
  const tierIndex = Math.max(0, Math.min(tierNames.length - 1, currentTier - 1));

  return UserSeasonDataSchema.parse({
    name: season.name,
    rank: 1,
    tier: tierNames[tierIndex],
    totalParticipants: 1,
    xpGained: progress?.total_season_xp ?? 0,
    sessionsCompleted: 0,
    totalFocusTime: 0,
    streakHigh: 0,
    duelsWon: 0,
    duelsPlayed: 0,
  });
}

// Helper
function getPeriodDuration(period: LeaderboardPeriod): number {
  switch (period) {
    case 'DAILY': return 24 * 60 * 60 * 1000;
    case 'WEEKLY': return 7 * 24 * 60 * 60 * 1000;
    case 'MONTHLY': return 30 * 24 * 60 * 60 * 1000;
    case 'SEASONAL': return 90 * 24 * 60 * 60 * 1000;
    case 'ALL_TIME': return 365 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}
