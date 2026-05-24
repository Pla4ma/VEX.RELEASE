import { getSupabaseClient } from '../../config/supabase';
import {
  SeasonRowSchema,
  SeasonSchema,
  UserSeasonProgressRowSchema,
  UserSeasonProgressSchema,
  type Season,
  type UserSeasonProgress,
} from './schemas';

export class RepositoryError extends Error {
  constructor(operation: string, originalError: unknown) {
    super(`Seasons repository failed ${operation}: ${String(originalError)}`);
    this.name = 'RepositoryError';
  }
}

function timestamp(value: string | null): number {
  return value ? new Date(value).getTime() : Date.now();
}

function mapSeason(row: unknown): Season {
  const parsed = SeasonRowSchema.parse(row);
  return SeasonSchema.parse({
    id: parsed.id,
    name: parsed.name,
    description: parsed.description,
    theme: parsed.theme,
    startAt: new Date(parsed.start_at).getTime(),
    endAt: new Date(parsed.end_at).getTime(),
    tierCount: parsed.tier_count,
    xpPerTier: parsed.xp_per_tier,
    premiumPriceGems: parsed.premium_price_gems,
    isActive: parsed.is_active ?? false,
    createdAt: timestamp(parsed.created_at),
  });
}

function mapProgress(row: unknown): UserSeasonProgress {
  const parsed = UserSeasonProgressRowSchema.parse(row);
  return UserSeasonProgressSchema.parse({
    id: parsed.id,
    userId: parsed.user_id,
    seasonId: parsed.season_id,
    currentTier: parsed.current_tier ?? 0,
    tierXp: parsed.tier_xp ?? 0,
    totalSeasonXp: parsed.total_season_xp ?? 0,
    isPremium: parsed.is_premium ?? false,
    premiumPurchasedAt: parsed.premium_purchased_at ? timestamp(parsed.premium_purchased_at) : null,
    claimedTiers: parsed.claimed_tiers ?? [],
    createdAt: timestamp(parsed.created_at),
    updatedAt: timestamp(parsed.updated_at),
  });
}

export async function fetchActiveSeason(): Promise<Season | null> {
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseClient()
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .lte('start_at', now)
    .gte('end_at', now)
    .maybeSingle();

  if (error) {
    throw new RepositoryError('fetchActiveSeason', error);
  }
  return data ? mapSeason(data) : null;
}

export async function fetchUpcomingSeasons(): Promise<Season[]> {
  const { data, error } = await getSupabaseClient()
    .from('seasons')
    .select('*')
    .gt('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(3);

  if (error) {
    throw new RepositoryError('fetchUpcomingSeasons', error);
  }
  return (data ?? []).map(mapSeason);
}

export async function fetchUserSeasonProgress(userId: string, seasonId: string): Promise<UserSeasonProgress | null> {
  const { data, error } = await getSupabaseClient()
    .from('user_season_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .maybeSingle();

  if (error) {
    throw new RepositoryError('fetchUserSeasonProgress', error);
  }
  return data ? mapProgress(data) : null;
}

export async function updateUserSeasonProgress(
  userId: string,
  seasonId: string,
  updates: Pick<UserSeasonProgress, 'currentTier' | 'tierXp' | 'totalSeasonXp'>
): Promise<UserSeasonProgress> {
  const { data, error } = await getSupabaseClient()
    .from('user_season_progress')
    .update({
      current_tier: updates.currentTier,
      tier_xp: updates.tierXp,
      total_season_xp: updates.totalSeasonXp,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .select('*')
    .single();

  if (error) {
    throw new RepositoryError('updateUserSeasonProgress', error);
  }
  return mapProgress(data);
}
