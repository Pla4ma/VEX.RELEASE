/**
 * Social Service — Friends, Duels, Victory Cards, Referrals
 *
 * Every function works at zero population:
 * - Friends: accountability with 1+ friend
 * - Duels: async via shareable code (iMessage link)
 * - Victory cards: external share = viral growth
 * - Referrals: the ONLY mechanic that grows population
 */

import * as repo from './repository';
import { eventBus } from '../../events';
import type {
  Friend, FriendProfile, DuelChallenge, DuelResult, DuelMode,
  VictoryCard, VictoryCardType, Referral,
} from './types';
import { DUEL_REWARDS, REFERRAL_REWARDS, SOCIAL_LIMITS, VICTORY_CARD_COLORS } from './types';
import { v4 as uuidv4 } from '../../utils/uuid';

// ── Friends ──────────────────────────────────────────────────────────────────
// ── Async Duels ──────────────────────────────────────────────────────────────

async function completeDuel(duel: DuelChallenge): Promise<DuelResult> {
  const challengerScore = duel.challengerScore!;
  const opponentScore = duel.opponentScore!;
  let winnerId: string | null = null;
  if (challengerScore > opponentScore) {winnerId = duel.challengerId;}
  else if (opponentScore > challengerScore) {winnerId = duel.opponentId;}
  duel.winnerId = winnerId;
  duel.status = 'COMPLETED';
  duel.completedAt = Date.now();
  await repo.updateDuel(duel);
  const challengerReward = winnerId === duel.challengerId ? DUEL_REWARDS.WIN
    : winnerId === null ? DUEL_REWARDS.DRAW : DUEL_REWARDS.LOSS;
  const opponentReward = winnerId === duel.opponentId ? DUEL_REWARDS.WIN
    : winnerId === null ? DUEL_REWARDS.DRAW : DUEL_REWARDS.LOSS;
  eventBus.publish('social:duel_completed', {
    duelId: duel.id,
    winnerId,
    challengerId: duel.challengerId,
    opponentId: duel.opponentId!,
    challengerScore,
    opponentScore,
    timestamp: Date.now(),
  });
  return {
    duelId: duel.id,
    winnerId,
    challengerScore,
    opponentScore,
    xpEarned: challengerReward.xp,
    coinsEarned: challengerReward.coins,
  };
}

// ── Victory Cards ────────────────────────────────────────────────────────────
// ── Referrals ────────────────────────────────────────────────────────────────
// ── Helpers ──────────────────────────────────────────────────────────────────

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function buildShareText(
  type: VictoryCardType,
  title: string,
  subtitle: string,
  stats: Array<{ label: string; value: string }>,
): string {
  const emoji = type === 'DUEL_WIN' ? '\u2694\uFE0F' : type === 'BOSS_DEFEAT' ? '\uD83D\uDC80'
    : type === 'STREAK_MILESTONE' ? '\uD83D\uDD25' : type === 'LEVEL_UP' ? '\u2B50' : '\u2728';
  const statsText = stats.map((s) => `${s.label}: ${s.value}`).join(' | ');
  return `${emoji} ${title}\n${subtitle}\n${statsText}\n\nFocus with me on VEX!`;
}

export * from "./service.part1";
export * from "./service.part2";
