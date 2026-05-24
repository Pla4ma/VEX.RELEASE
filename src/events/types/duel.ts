/**
 * Duel Events
 */

export interface DuelEventDefinitions {
  'duel:accepted': {
    duelId: string;
    challengerId: string;
    challengedId: string;
  };
  'duel:started': {
    duelId: string;
    challengerId: string;
    challengedId: string;
  };
  'duel:session_started': {
    duelId: string;
    userId: string;
    sessionId: string;
    challengerId?: string;
    challengedId?: string;
    config?: {
      duelId: string;
      duration: number;
      category: string;
      startedAt: number;
    };
  };
  'duel:forfeited': { duelId: string; winnerId: string; forfeitBy: string };
  'duel:completed': {
    duelId: string;
    winnerId: string | null;
    challengerId: string;
    challengedId: string;
    score1: number;
    score2: number;
  };
  'duel:resolved': {
    duelId: string;
    winnerId: string | null;
    challengerId: string;
    challengedId: string;
    challengerScore: number;
    challengedScore: number;
    challengerDelta: number;
    challengedDelta: number;
  };
  'duel:tier_changed': { userId: string; newTier: string; oldTier: string };
  'duel:matched': {
    duelId: string;
    challengerId: string;
    challengedId: string;
  };
  'duel:beaten': { winnerId: string; loserId: string; duelId: string };
  'duel:created': { duelId: string; challengerId: string; challengedId: string };
  'duel:declined': { duelId: string; challengerId: string; challengedId: string };
  'duel:expired': { duelId: string };
  'duel:damage': {
    duelId: string;
    userId: string;
    damage: number;
    timestamp: number;
  };
  'duel:participant_ready': {
    duelId: string;
    userId: string;
    timestamp: number;
  };
}
