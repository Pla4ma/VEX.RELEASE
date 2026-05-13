/**
 * Social System — Minimal, Strong, Zero-Population Ready
 *
 * 4 mechanics that work at ANY scale:
 * 1. Friends — accountability (works with 1 friend)
 * 2. Async Duels — rivalry via shareable link (works via iMessage)
 * 3. Victory Cards — viral moments shared externally
 * 4. Referrals — grows the population
 */

// ============================================================================
// Friends — Accountability
// ============================================================================

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: number;
}

export interface FriendProfile {
  userId: string;
  displayName: string;
  level: number;
  currentStreak: number;
  weeklyFocusMinutes: number;
  lastActiveAt: number;
}

// ============================================================================
// Async Duels — Rivalry via Link
// ============================================================================

export type DuelStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'EXPIRED';

export type DuelMode = 'SPRINT' | 'FOCUS' | 'DEEP';

export interface DuelChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  opponentId: string | null;
  opponentName: string | null;
  status: DuelStatus;
  mode: DuelMode;
  durationMinutes: number;
  challengerScore: number | null;
  opponentScore: number | null;
  winnerId: string | null;
  shareCode: string;
  expiresAt: number;
  createdAt: number;
  completedAt: number | null;
}

export interface DuelResult {
  duelId: string;
  winnerId: string | null;
  challengerScore: number;
  opponentScore: number;
  xpEarned: number;
  coinsEarned: number;
}

// ============================================================================
// Victory Cards — Viral Moments
// ============================================================================

export type VictoryCardType =
  | 'DUEL_WIN'
  | 'BOSS_DEFEAT'
  | 'STREAK_MILESTONE'
  | 'LEVEL_UP'
  | 'PERFECT_SESSION';

export interface VictoryCard {
  id: string;
  userId: string;
  type: VictoryCardType;
  title: string;
  subtitle: string;
  stats: Array<{ label: string; value: string }>;
  accentColor: string;
  shareText: string;
  createdAt: number;
}

// ============================================================================
// Referrals — Population Growth
// ============================================================================

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string | null;
  code: string;
  status: 'PENDING' | 'COMPLETED';
  rewardClaimed: boolean;
  createdAt: number;
  completedAt: number | null;
}

// ============================================================================
// Accountability Nudges — Retention Layer
// ============================================================================

export type NudgeType = 'FRIEND_STARTED_SESSION' | 'FRIEND_ON_STREAK' | 'DUEL_INVITE' | 'WEEKLY_RANK_DROP' | 'SQUAD_MEMBER_ACTIVE';

// ============================================================================
// Constants
// ============================================================================

export const SOCIAL_LIMITS = {
  MAX_FRIENDS: 50,
  MAX_PENDING_REQUESTS: 10,
  MAX_ACTIVE_DUELS: 5,
  DUEL_EXPIRY_HOURS: 48,
  DUEL_CHALLENGE_EXPIRY_HOURS: 72,
} as const;

export const DUEL_REWARDS = {
  WIN: { xp: 100, coins: 50 },
  LOSS: { xp: 30, coins: 10 },
  DRAW: { xp: 50, coins: 25 },
} as const;

export const REFERRAL_REWARDS = {
  REFERRER: { xp: 200, coins: 100 },
  REFERRED: { xp: 150, coins: 75 },
} as const;

export const VICTORY_CARD_COLORS: Record<VictoryCardType, string> = {
  DUEL_WIN: 'theme.colors.error.DEFAULT',
  BOSS_DEFEAT: 'theme.colors.error.DEFAULT',
  STREAK_MILESTONE: 'theme.colors.error.DEFAULT',
  LEVEL_UP: 'theme.colors.primary[500]',
  PERFECT_SESSION: 'theme.colors.primary[500]',
};
