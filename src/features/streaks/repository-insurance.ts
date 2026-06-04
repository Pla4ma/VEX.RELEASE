import { supabase } from '../../supabase/client';
import type {
  StreakInsurance,
  StreakGamble,
  ComebackToken,
} from './streak-insurance';
import { z } from 'zod';
import { tableColumns } from '../../lib/repository/tableColumns';
const INSURANCE_TABLE = 'streak_insurance';
const GAMBLE_TABLE = 'streak_gambles';
const TOKEN_TABLE = 'comeback_tokens';
export async function fetchActiveInsurance(
  userId: string,
): Promise<StreakInsurance | null> {
  const { data, error } = await supabase
    .from(INSURANCE_TABLE)
    .select(
      'id, user_id, streak_days_protected, cost, purchased_at, expires_at, used, used_at'
    )
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
  cost: number,
): Promise<StreakInsurance> {
  const { data, error } = await supabase
    .from(INSURANCE_TABLE)
    .insert({
      user_id: userId,
      streak_days_protected: streakDays,
      cost,
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    })
    .select(tableColumns(INSURANCE_TABLE))
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
export async function fetchActiveGamble(
  userId: string,
): Promise<StreakGamble | null> {
  const { data, error } = await supabase
    .from(GAMBLE_TABLE)
    .select(
      'id, user_id, streak_days_at_risk, started_at, session_id, status, required_grade, actual_grade, bonus_xp_if_won, settled_at'
    )
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
  bonusXp: number,
): Promise<StreakGamble> {
  const { data, error } = await supabase
    .from(GAMBLE_TABLE)
    .insert({
      user_id: userId,
      streak_days_at_risk: streakDays,
      required_grade: requiredGrade,
      bonus_xp_if_won: bonusXp,
    })
    .select(tableColumns(GAMBLE_TABLE))
    .single();
  if (error) {
    throw error;
  }
  return dbToGamble(data);
}
export async function settleGamble(
  gambleId: string,
  status: 'WON' | 'LOST',
  actualGrade: string,
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
  sourceStreak: number,
): Promise<ComebackToken> {
  const { data, error } = await supabase
    .from(TOKEN_TABLE)
    .insert({ user_id: userId, source_streak: sourceStreak })
    .select(tableColumns(TOKEN_TABLE))
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
const RawInsuranceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  streak_days_protected: z.number(),
  cost: z.number(),
  purchased_at: z.string(),
  expires_at: z.string(),
  used: z.boolean(),
  used_at: z.string().nullable().optional(),
});

const RawGambleSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  streak_days_at_risk: z.number(),
  started_at: z.string(),
  session_id: z.string(),
  status: z.enum(['ACTIVE', 'WON', 'LOST']),
  required_grade: z.enum(['S', 'A', 'B']),
  actual_grade: z.enum(['S', 'A', 'B']).nullable().optional(),
  bonus_xp_if_won: z.number(),
  settled_at: z.string().nullable().optional(),
});

const RawTokenSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  source_streak: z.number(),
  earned_at: z.string(),
  used: z.boolean(),
  restore_value: z.number(),
});

function dbToInsurance(row: unknown): StreakInsurance {
  const r = RawInsuranceSchema.parse(row);
  return { id: r.id, userId: r.user_id, streakDaysProtected: r.streak_days_protected, cost: r.cost, purchasedAt: new Date(r.purchased_at).getTime(), expiresAt: new Date(r.expires_at).getTime(), used: r.used, usedAt: r.used_at ? new Date(r.used_at).getTime() : undefined };
}

function dbToGamble(row: unknown): StreakGamble {
  const r = RawGambleSchema.parse(row);
  return { id: r.id, userId: r.user_id, streakDaysAtRisk: r.streak_days_at_risk, startedAt: new Date(r.started_at).getTime(), sessionId: r.session_id, status: r.status, requiredGrade: r.required_grade, actualGrade: r.actual_grade ?? undefined, bonusXpIfWon: r.bonus_xp_if_won, settledAt: r.settled_at ? new Date(r.settled_at).getTime() : undefined };
}

function dbToToken(row: unknown): ComebackToken {
  const r = RawTokenSchema.parse(row);
  return { id: r.id, userId: r.user_id, sourceStreak: r.source_streak, earnedAt: new Date(r.earned_at).getTime(), used: r.used, restoreValue: r.restore_value };
}
