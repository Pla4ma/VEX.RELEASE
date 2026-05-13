import { supabase } from "../../supabase/client";
import type { StreakInsurance, StreakGamble, ComebackToken } from "./streak-insurance";


export async function fetchActiveInsurance(userId: string): Promise<StreakInsurance | null> {
  const { data, error } = await supabase
    .from(INSURANCE_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('purchased_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data ? dbToInsurance(data) : null;
}

export async function createInsurance(
  userId: string,
  streakDays: number,
  cost: number
): Promise<StreakInsurance> {
  const { data, error } = await supabase
    .from(INSURANCE_TABLE)
    .insert({
      user_id: userId,
      streak_days_protected: streakDays,
      cost,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dbToInsurance(data);
}

export async function markInsuranceUsed(insuranceId: string): Promise<void> {
  const { error } = await supabase
    .from(INSURANCE_TABLE)
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', insuranceId);

  if (error) {
    throw error;
  }
}

export async function fetchActiveGamble(userId: string): Promise<StreakGamble | null> {
  const { data, error } = await supabase
    .from(GAMBLE_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'ACTIVE')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data ? dbToGamble(data) : null;
}

export async function createGamble(
  userId: string,
  streakDays: number,
  requiredGrade: string,
  bonusXp: number
): Promise<StreakGamble> {
  const { data, error } = await supabase
    .from(GAMBLE_TABLE)
    .insert({
      user_id: userId,
      streak_days_at_risk: streakDays,
      required_grade: requiredGrade,
      bonus_xp_if_won: bonusXp,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dbToGamble(data);
}

export async function settleGamble(
  gambleId: string,
  status: 'WON' | 'LOST',
  actualGrade: string
): Promise<void> {
  const { error } = await supabase
    .from(GAMBLE_TABLE)
    .update({
      status,
      actual_grade: actualGrade,
      settled_at: new Date().toISOString(),
    })
    .eq('id', gambleId);

  if (error) {
    throw error;
  }
}

export async function fetchAvailableTokens(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from(TOKEN_TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('used', false);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function createComebackToken(
  userId: string,
  sourceStreak: number
): Promise<ComebackToken> {
  const { data, error } = await supabase
    .from(TOKEN_TABLE)
    .insert({
      user_id: userId,
      source_streak: sourceStreak,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dbToToken(data);
}

export async function useComebackToken(tokenId: string): Promise<void> {
  const { error } = await supabase
    .from(TOKEN_TABLE)
    .update({ used: true })
    .eq('id', tokenId);

  if (error) {
    throw error;
  }
}