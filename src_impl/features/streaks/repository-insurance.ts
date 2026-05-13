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
// ============================================================================
// Gambles
// ============================================================================
// ============================================================================
// Comeback Tokens
// ============================================================================
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

export * from "./repository-insurance.part1";
