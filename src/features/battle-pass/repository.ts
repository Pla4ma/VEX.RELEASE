/**
 * Battle Pass Feature - Repository
 */

import { getSupabaseClient } from '../../config/supabase';
import {
  BattlePassSchema,
  BattlePassTierSchema,
  UserBattlePassSchema,
  type BattlePass,
  type BattlePassTier,
  type UserBattlePass,
} from './schemas';

const supabase = getSupabaseClient();

export class RepositoryError extends Error {
  constructor(public operation: string, public originalError: unknown) {
    super(`Repository error in ${operation}: ${String(originalError)}`);
    this.name = 'RepositoryError';
  }
}

export async function fetchBattlePassBySeason(seasonId: string): Promise<BattlePass | null> {
  const { data, error } = await supabase
    .from('battle_passes')
    .select('*')
    .eq('season_id', seasonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {return null;}
    throw new RepositoryError('fetchBattlePassBySeason', error);
  }

  return BattlePassSchema.parse(data);
}

export async function fetchBattlePassTiers(seasonId: string): Promise<BattlePassTier[]> {
  const { data, error } = await supabase
    .from('battle_pass_tiers')
    .select('*')
    .eq('season_id', seasonId)
    .order('tier_number', { ascending: true });

  if (error) {throw new RepositoryError('fetchBattlePassTiers', error);}
  return BattlePassTierSchema.array().parse(data || []);
}

export async function fetchUserBattlePass(userId: string, seasonId: string): Promise<UserBattlePass | null> {
  const { data, error } = await supabase
    .from('user_battle_pass')
    .select('*')
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {return null;}
    throw new RepositoryError('fetchUserBattlePass', error);
  }

  return UserBattlePassSchema.parse(data);
}

export async function createUserBattlePass(userId: string, seasonId: string): Promise<UserBattlePass> {
  const now = Date.now();
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
      created_at: new Date(now).toISOString(),
      updated_at: new Date(now).toISOString(),
    })
    .select()
    .single();

  if (error) {throw new RepositoryError('createUserBattlePass', error);}
  return UserBattlePassSchema.parse(data);
}

export async function updateUserBattlePass(
  userId: string,
  seasonId: string,
  updates: Partial<Omit<UserBattlePass, 'id' | 'userId' | 'seasonId' | 'createdAt'>>
): Promise<UserBattlePass> {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.currentTier !== undefined) {updateData.current_tier = updates.currentTier;}
  if (updates.tierXp !== undefined) {updateData.tier_xp = updates.tierXp;}
  if (updates.totalXp !== undefined) {updateData.total_xp = updates.totalXp;}
  if (updates.isPremium !== undefined) {updateData.is_premium = updates.isPremium;}
  if (updates.premiumPurchasedAt !== undefined) {
    updateData.premium_purchased_at = updates.premiumPurchasedAt ? new Date(updates.premiumPurchasedAt).toISOString() : null;
  }
  if (updates.claimedFreeTiers !== undefined) {updateData.claimed_free_tiers = updates.claimedFreeTiers;}
  if (updates.claimedPremiumTiers !== undefined) {updateData.claimed_premium_tiers = updates.claimedPremiumTiers;}

  const { data, error } = await supabase
    .from('user_battle_pass')
    .update(updateData)
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .select()
    .single();

  if (error) {throw new RepositoryError('updateUserBattlePass', error);}
  return UserBattlePassSchema.parse(data);
}

export async function markTierClaimed(
  userId: string,
  seasonId: string,
  tierNumber: number,
  track: 'FREE' | 'PREMIUM'
): Promise<void> {
  const column = track === 'FREE' ? 'claimed_free_tiers' : 'claimed_premium_tiers';

  const { data: existing, error: fetchError } = await supabase
    .from('user_battle_pass')
    .select(column)
    .eq('user_id', userId)
    .eq('season_id', seasonId)
    .single();

  if (fetchError) {throw new RepositoryError('markTierClaimed-fetch', fetchError);}

  const claimed = [...((existing as Record<string, number[]> | undefined)?.[column] || []), tierNumber];

  const { error } = await supabase
    .from('user_battle_pass')
    .update({ [column]: claimed, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('season_id', seasonId);

  if (error) {throw new RepositoryError('markTierClaimed-update', error);}
}

export async function purchasePremium(userId: string, seasonId: string, gemsDeducted: number): Promise<UserBattlePass> {
  const { data, error } = await supabase.rpc('purchase_battle_pass_premium', {
    p_user_id: userId,
    p_season_id: seasonId,
    p_gems_deducted: gemsDeducted,
  });

  if (error) {throw new RepositoryError('purchasePremium', error);}
  return UserBattlePassSchema.parse(data);
}
