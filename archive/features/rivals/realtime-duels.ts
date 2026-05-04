/**
 * Real-time Duels System - VEX 10/10 Transformation
 *
 * Head-to-head competitive focus sessions:
 * - Challenge rival to synchronized session
 * - Same boss, first to defeat wins
 * - Real-time damage tracking
 * - Betting system with coins
 * - Spectator mode for friends/squad
 *
 * @phase 4 - Social Dependency
 */

import { z } from 'zod';

// ============================================================================
// Duel Types
// ============================================================================

export const DuelStatusSchema = z.enum([
  'PENDING',      // Challenge sent, waiting for acceptance
  'ACCEPTED',     // Both players ready
  'IN_PROGRESS',  // Sessions active
  'VICTORY',      // Challenger won
  'DEFEAT',       // Challenger lost
  'DRAW',         // Both defeated boss or both failed
  'CANCELLED',    // Challenge declined or timeout
  'FORFEIT',      // One player didn't start
]);

export type DuelStatus = z.infer<typeof DuelStatusSchema>;

export const DuelModeSchema = z.enum(['STANDARD', 'HIGH_STAKES', 'FRIENDLY']);
export type DuelMode = z.infer<typeof DuelModeSchema>;

// ============================================================================
// Duel Configuration
// ============================================================================

export interface DuelConfig {
  mode: DuelMode;
  duration: number; // Session duration in minutes
  bossId: string;
  bossHealth: number;
  betAmount: number; // 0 for friendly
  spectatorAllowed: boolean;
  timeToAccept: number; // Seconds to accept challenge
  timeToStart: number; // Seconds to start session after acceptance
}

export const DUEL_PRESETS: Record<DuelMode, Omit<DuelConfig, 'bossId'>> = {
  STANDARD: {
    mode: 'STANDARD',
    duration: 25,
    bossHealth: 500,
    betAmount: 100,
    spectatorAllowed: true,
    timeToAccept: 60,
    timeToStart: 120,
  },
  HIGH_STAKES: {
    mode: 'HIGH_STAKES',
    duration: 45,
    bossHealth: 1000,
    betAmount: 500,
    spectatorAllowed: true,
    timeToAccept: 30,
    timeToStart: 60,
  },
  FRIENDLY: {
    mode: 'FRIENDLY',
    duration: 25,
    bossHealth: 500,
    betAmount: 0,
    spectatorAllowed: false,
    timeToAccept: 300,
    timeToStart: 300,
  },
};

// ============================================================================
// Active Duel State
// ============================================================================

export interface RealtimeDuel {
  id: string;

  // Players
  challenger: DuelPlayer;
  opponent: DuelPlayer;

  // Configuration
  config: DuelConfig;
  status: DuelStatus;

  // Timeline
  createdAt: number;
  acceptedAt: number | null;
  startedAt: number | null;
  endedAt: number | null;

  // Boss state (shared)
  bossHealthRemaining: number;
  bossMaxHealth: number;

  // Real-time tracking
  events: DuelEvent[];
  currentLeader: string | null; // userId of current leader
  leadChanges: number;

  // Results
  winner: string | null; // userId
  winReason: 'BOSS_DEFEATED' | 'OPPONENT_FORFEIT' | 'HIGHER_DAMAGE' | 'TIMEOUT' | null;

  // Spectators
  spectators: string[];
}

export interface DuelPlayer {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  masteryLevel: number;
  currentStreak: number;

  // Duel status
  accepted: boolean;
  ready: boolean;
  sessionStarted: boolean;
  sessionCompleted: boolean;

  // Session data
  sessionId: string | null;
  sessionStartTime: number | null;
  sessionEndTime: number | null;
  damageDealt: number;
  purityScore: number;
  pauses: number;

  // Forfeits if doesn't start in time
  forfeitRisk: boolean;
}

export type DuelEvent =
  | { type: 'CHALLENGE_SENT'; timestamp: number }
  | { type: 'CHALLENGE_ACCEPTED'; timestamp: number; by: string }
  | { type: 'CHALLENGE_DECLINED'; timestamp: number; by: string }
  | { type: 'PLAYER_READY'; timestamp: number; userId: string }
  | { type: 'SESSION_STARTED'; timestamp: number; userId: string; sessionId: string }
  | { type: 'DAMAGE_DEALT'; timestamp: number; userId: string; damage: number; bossHealthAfter: number }
  | { type: 'PAUSE'; timestamp: number; userId: string; duration: number }
  | { type: 'LEAD_CHANGE'; timestamp: number; newLeader: string; previousLeader: string | null }
  | { type: 'BOSS_DEFEATED'; timestamp: number; by: string }
  | { type: 'SESSION_COMPLETED'; timestamp: number; userId: string; success: boolean }
  | { type: 'FORFEIT'; timestamp: number; userId: string; reason: string }
  | { type: 'DUEL_ENDED'; timestamp: number; winner: string | null; reason: string };

// ============================================================================
// Challenge System
// ============================================================================

export interface DuelChallenge {
  duelId: string;
  challenger: {
    userId: string;
    displayName: string;
    avatarUrl?: string;
    winRate: number;
    recentForm: 'WIN' | 'LOSS' | 'DRAW' | null; // Last duel result
  };
  config: DuelConfig;
  sentAt: number;
  expiresAt: number;
  message?: string;
}

export function canChallengePlayer(
  playerId: string,
  lastDuelTime: number | null,
  playerCooldownMinutes: number = 5
): { canChallenge: boolean; reason: string | null; cooldownRemaining: number } {
  if (lastDuelTime) {
    const cooldownMs = playerCooldownMinutes * 60 * 1000;
    const timeSinceLastDuel = Date.now() - lastDuelTime;

    if (timeSinceLastDuel < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastDuel) / (60 * 1000));
      return {
        canChallenge: false,
        reason: `Wait ${remainingMinutes} minutes between duels with same player`,
        cooldownRemaining: remainingMinutes,
      };
    }
  }

  return { canChallenge: true, reason: null, cooldownRemaining: 0 };
}

export function createDuelChallenge(
  challengerId: string,
  challengerName: string,
  opponentId: string,
  opponentName: string,
  mode: DuelMode,
  bossId: string,
  challengerStreak: number,
  opponentStreak: number,
  challengerLevel: number,
  opponentLevel: number,
  _message?: string
): RealtimeDuel {
  const preset = DUEL_PRESETS[mode];
  const now = Date.now();

  return {
    id: `duel_${now}_${challengerId}_${opponentId}`,
    challenger: {
      userId: challengerId,
      displayName: challengerName,
      masteryLevel: challengerLevel,
      currentStreak: challengerStreak,
      accepted: true,
      ready: false,
      sessionStarted: false,
      sessionCompleted: false,
      sessionId: null,
      sessionStartTime: null,
      sessionEndTime: null,
      damageDealt: 0,
      purityScore: 0,
      pauses: 0,
      forfeitRisk: false,
    },
    opponent: {
      userId: opponentId,
      displayName: opponentName,
      masteryLevel: opponentLevel,
      currentStreak: opponentStreak,
      accepted: false,
      ready: false,
      sessionStarted: false,
      sessionCompleted: false,
      sessionId: null,
      sessionStartTime: null,
      sessionEndTime: null,
      damageDealt: 0,
      purityScore: 0,
      pauses: 0,
      forfeitRisk: false,
    },
    config: {
      ...preset,
      bossId,
    },
    status: 'PENDING',
    createdAt: now,
    acceptedAt: null,
    startedAt: null,
    endedAt: null,
    bossHealthRemaining: preset.bossHealth,
    bossMaxHealth: preset.bossHealth,
    events: [{ type: 'CHALLENGE_SENT', timestamp: now }],
    currentLeader: null,
    leadChanges: 0,
    winner: null,
    winReason: null,
    spectators: [],
  };
}

// ============================================================================
// Duel Logic
// ============================================================================

export interface DamageUpdate {
  userId: string;
  damage: number;
  source: 'SESSION_TIME' | 'PURITY_BONUS' | 'STREAK_BONUS';
  timestamp: number;
}

export function calculateDuelDamage(
  player: DuelPlayer,
  deltaTimeSeconds: number,
  currentPurity: number
): DamageUpdate[] {
  const updates: DamageUpdate[] = [];

  // Base damage from time
  const baseDamage = deltaTimeSeconds * 0.5;
  updates.push({
    userId: player.userId,
    damage: baseDamage,
    source: 'SESSION_TIME',
    timestamp: Date.now(),
  });

  // Purity bonus (if maintaining 80%+)
  if (currentPurity >= 80) {
    updates.push({
      userId: player.userId,
      damage: baseDamage * 0.3, // 30% bonus
      source: 'PURITY_BONUS',
      timestamp: Date.now(),
    });
  }

  // Streak bonus
  if (player.currentStreak >= 7) {
    updates.push({
      userId: player.userId,
      damage: baseDamage * 0.2, // 20% bonus
      source: 'STREAK_BONUS',
      timestamp: Date.now(),
    });
  }

  return updates;
}

export function processDamageUpdate(
  duel: RealtimeDuel,
  update: DamageUpdate
): { newDuel: RealtimeDuel; bossDefeated: boolean; leadChanged: boolean } {
  const newDuel = { ...duel };
  const isChallenger = update.userId === duel.challenger.userId;
  const player = isChallenger ? newDuel.challenger : newDuel.opponent;

  // Apply damage
  player.damageDealt += update.damage;
  newDuel.bossHealthRemaining = Math.max(0, newDuel.bossHealthRemaining - update.damage);

  // Log event
  newDuel.events.push({
    type: 'DAMAGE_DEALT',
    timestamp: update.timestamp,
    userId: update.userId,
    damage: update.damage,
    bossHealthAfter: newDuel.bossHealthRemaining,
  });

  // Check for lead change
  const otherPlayer = isChallenger ? newDuel.opponent : newDuel.challenger;
  const previousLeader = newDuel.currentLeader;
  let leadChanged = false;

  if (player.damageDealt > otherPlayer.damageDealt) {
    if (newDuel.currentLeader !== player.userId) {
      newDuel.currentLeader = player.userId;
      newDuel.leadChanges++;
      leadChanged = true;

      newDuel.events.push({
        type: 'LEAD_CHANGE',
        timestamp: update.timestamp,
        newLeader: player.userId,
        previousLeader,
      });
    }
  }

  // Check for boss defeat
  const bossDefeated = newDuel.bossHealthRemaining === 0;
  if (bossDefeated) {
    newDuel.events.push({
      type: 'BOSS_DEFEATED',
      timestamp: update.timestamp,
      by: update.userId,
    });
  }

  return { newDuel, bossDefeated, leadChanged };
}

export function determineDuelWinner(duel: RealtimeDuel): {
  winner: string | null;
  reason: RealtimeDuel['winReason'];
  status: DuelStatus;
} {
  const { challenger, opponent } = duel;

  // Both defeated boss - compare damage
  if (challenger.sessionCompleted && opponent.sessionCompleted) {
    if (challenger.damageDealt > opponent.damageDealt) {
      return { winner: challenger.userId, reason: 'HIGHER_DAMAGE', status: 'VICTORY' };
    }
    if (opponent.damageDealt > challenger.damageDealt) {
      return { winner: opponent.userId, reason: 'HIGHER_DAMAGE', status: 'DEFEAT' };
    }
    return { winner: null, reason: null, status: 'DRAW' };
  }

  // One defeated boss, other didn't
  if (challenger.sessionCompleted && !opponent.sessionCompleted) {
    return { winner: challenger.userId, reason: 'BOSS_DEFEATED', status: 'VICTORY' };
  }
  if (!challenger.sessionCompleted && opponent.sessionCompleted) {
    return { winner: opponent.userId, reason: 'BOSS_DEFEATED', status: 'DEFEAT' };
  }

  // Neither completed - forfeit check
  if (challenger.forfeitRisk && !opponent.forfeitRisk) {
    return { winner: opponent.userId, reason: 'OPPONENT_FORFEIT', status: 'FORFEIT' };
  }
  if (!challenger.forfeitRisk && opponent.forfeitRisk) {
    return { winner: challenger.userId, reason: 'OPPONENT_FORFEIT', status: 'VICTORY' };
  }

  // Both forfeited
  if (challenger.forfeitRisk && opponent.forfeitRisk) {
    return { winner: null, reason: 'TIMEOUT', status: 'DRAW' };
  }

  // Still in progress
  return { winner: null, reason: null, status: 'IN_PROGRESS' };
}

// ============================================================================
// Betting System
// ============================================================================

export interface BetResult {
  winnerReceives: number;
  houseTax: number;
  totalPool: number;
}

export function calculateBetPayout(betAmount: number): BetResult {
  const houseTaxPercent = 5; // 5% house tax
  const totalPool = betAmount * 2; // Both players bet
  const houseTax = Math.floor(totalPool * (houseTaxPercent / 100));
  const winnerReceives = totalPool - houseTax;

  return {
    winnerReceives,
    houseTax,
    totalPool,
  };
}

// ============================================================================
// Notifications
// ============================================================================

export function getDuelNotification(
  type: 'CHALLENGE_RECEIVED' | 'CHALLENGE_ACCEPTED' | 'DUEL_STARTING' | 'DUEL_ENDED' | 'LEAD_LOST',
  duel: RealtimeDuel,
  userId: string
): { title: string; body: string; priority: 'low' | 'normal' | 'high' | 'critical' } {
  const isChallenger = userId === duel.challenger.userId;
  const opponent = isChallenger ? duel.opponent : duel.challenger;

  switch (type) {
    case 'CHALLENGE_RECEIVED':
      return {
        title: `Duel Challenge from ${opponent.displayName}!`,
        body: `${opponent.displayName} wants to duel you. Bet: ${duel.config.betAmount} coins`,
        priority: 'high',
      };
    case 'CHALLENGE_ACCEPTED':
      return {
        title: 'Challenge Accepted!',
        body: `${opponent.displayName} accepted your duel. Get ready!`,
        priority: 'high',
      };
    case 'DUEL_STARTING':
      return {
        title: 'Duel Starting Now!',
        body: `Your session must start within ${duel.config.timeToStart} seconds!`,
        priority: 'critical',
      };
    case 'DUEL_ENDED':
      if (duel.winner === userId) {
        return {
          title: 'Victory! 🏆',
          body: `You defeated ${opponent.displayName}! Won ${calculateBetPayout(duel.config.betAmount).winnerReceives} coins`,
          priority: 'high',
        };
      } else if (duel.winner === null) {
        return {
          title: 'Duel Ended - Draw',
          body: 'It was a close match! No winner this time.',
          priority: 'normal',
        };
      } else {
        return {
          title: 'Defeat',
          body: `${opponent.displayName} won this round. Train harder!`,
          priority: 'normal',
        };
      }
    case 'LEAD_LOST':
      return {
        title: 'Lead Lost!',
        body: `${opponent.displayName} just passed your damage. Focus!`,
        priority: 'high',
      };
    default:
      return { title: '', body: '', priority: 'low' };
  }
}

// ============================================================================
// Analytics Events
// ============================================================================

export const DuelEvents = {
  DUEL_CREATED: 'duel:created',
  DUEL_ACCEPTED: 'duel:accepted',
  DUEL_STARTED: 'duel:started',
  DUEL_COMPLETED: 'duel:completed',
  DAMAGE_DEALT: 'duel:damage',
  LEAD_CHANGE: 'duel:lead_change',
  BOSS_DEFEATED: 'duel:boss_defeated',
} as const;

// ============================================================================
// Spectator System
// ============================================================================

export interface DuelSpectatorView {
  duelId: string;
  challenger: { name: string; avatar?: string; damage: number; purity: number };
  opponent: { name: string; avatar?: string; damage: number; purity: number };
  bossHealthPercent: number;
  timeElapsed: number;
  currentLeader: string;
  leadChanges: number;
  recentEvents: string[];
  canCheer: boolean;
}

export function createSpectatorView(duel: RealtimeDuel): DuelSpectatorView {
  return {
    duelId: duel.id,
    challenger: {
      name: duel.challenger.displayName,
      avatar: duel.challenger.avatarUrl,
      damage: duel.challenger.damageDealt,
      purity: duel.challenger.purityScore,
    },
    opponent: {
      name: duel.opponent.displayName,
      avatar: duel.opponent.avatarUrl,
      damage: duel.opponent.damageDealt,
      purity: duel.opponent.purityScore,
    },
    bossHealthPercent: Math.floor((duel.bossHealthRemaining / duel.bossMaxHealth) * 100),
    timeElapsed: duel.startedAt ? Date.now() - duel.startedAt : 0,
    currentLeader: duel.currentLeader === duel.challenger.userId
      ? duel.challenger.displayName
      : duel.opponent.displayName,
    leadChanges: duel.leadChanges,
    recentEvents: duel.events.slice(-5).map(e => {
      if (e.type === 'DAMAGE_DEALT') {
        return `${e.userId === duel.challenger.userId ? duel.challenger.displayName : duel.opponent.displayName} dealt ${Math.floor(e.damage)} damage!`;
      }
      if (e.type === 'LEAD_CHANGE') {
        return 'Lead changed!';
      }
      return e.type;
    }),
    canCheer: true,
  };
}
