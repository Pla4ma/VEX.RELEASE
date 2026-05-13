/**
 * Social Repository — Supabase queries for friends, duels, victory cards, referrals
 */

import { getSupabaseClient } from '../../config/supabase';
import type { Friend, FriendProfile, DuelChallenge, VictoryCard, Referral } from './types';

const supabase = getSupabaseClient();

// ── Friends ──────────────────────────────────────────────────────────────────
// ── Duels ────────────────────────────────────────────────────────────────────
// ── Victory Cards ────────────────────────────────────────────────────────────
// ── Referrals ────────────────────────────────────────────────────────────────
// ── Mappers ──────────────────────────────────────────────────────────────────

function mapDuel(r: Record<string, unknown>): DuelChallenge {
  return {
    id: r.id as string, challengerId: r.challenger_id as string,
    challengerName: r.challenger_name as string, opponentId: r.opponent_id as string | null,
    opponentName: r.opponent_name as string | null, status: r.status as DuelChallenge['status'],
    mode: r.mode as DuelChallenge['mode'], durationMinutes: r.duration_minutes as number,
    challengerScore: r.challenger_score as number | null, opponentScore: r.opponent_score as number | null,
    winnerId: r.winner_id as string | null, shareCode: r.share_code as string,
    expiresAt: new Date(r.expires_at as string).getTime(),
    createdAt: new Date(r.created_at as string).getTime(),
    completedAt: r.completed_at ? new Date(r.completed_at as string).getTime() : null,
  };
}

function mapReferral(r: Record<string, unknown>): Referral {
  return {
    id: r.id as string, referrerId: r.referrer_id as string,
    referredId: r.referred_id as string | null, code: r.code as string,
    status: r.status as Referral['status'], rewardClaimed: r.reward_claimed as boolean,
    createdAt: new Date(r.created_at as string).getTime(),
    completedAt: r.completed_at ? new Date(r.completed_at as string).getTime() : null,
  };
}

export * from "./repository.part1";
