/**
 * Streak Insurance Repository
 * Supabase integration for insurance, gambles, comeback tokens
 */

import { supabase } from '../../supabase/client';
import type { StreakInsurance, StreakGamble, ComebackToken } from './streak-insurance';

const INSURANCE_TABLE = 'streak_insurance';
const GAMBLE_TABLE = 'streak_gambles';
const TOKEN_TABLE = 'comeback_tokens';

// ============================================================================
// Insurance
// ============================================================================

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

// ============================================================================
// Gambles
// ============================================================================

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

// ============================================================================
// Comeback Tokens
// ============================================================================

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

// ============================================================================
// Helpers
// ============================================================================

function dbToInsurance(row: Record<string, unknown>): StreakInsurance {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    streakDaysProtected: row.streak_days_protected as number,
    cost: row.cost as number,
    purchasedAt: new Date(row.purchased_at as string).getTime(),
    expiresAt: new Date(row.expires_at as string).getTime(),
    used: row.used as boolean,
    usedAt: row.used_at ? new Date(row.used_at as string).getTime() : undefined,
  };
}

function dbToGamble(row: Record<string, unknown>): StreakGamble {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    streakDaysAtRisk: row.streak_days_at_risk as number,
    startedAt: new Date(row.started_at as string).getTime(),
    sessionId: row.session_id as string,
    status: row.status as StreakGamble['status'],
    requiredGrade: row.required_grade as 'S' | 'A' | 'B',
    actualGrade: row.actual_grade as string | undefined,
    bonusXpIfWon: row.bonus_xp_if_won as number,
    settledAt: row.settled_at ? new Date(row.settled_at as string).getTime() : undefined,
  };
}

function dbToToken(row: Record<string, unknown>): ComebackToken {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    sourceStreak: row.source_streak as number,
    earnedAt: new Date(row.earned_at as string).getTime(),
    used: row.used as boolean,
    restoreValue: row.restore_value as number,
  };
}
