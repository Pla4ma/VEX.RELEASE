/**
 * Squads — Minimal cooperative focus system
 *
 * What matters at small scale:
 * 1. Create a squad, invite by code
 * 2. See who's in your squad
 * 3. Focus together in real-time (synergy bonus)
 *
 * No role hierarchy, no challenges, no analytics. Just: focus together, get bonus.
 */

// ── Core ─────────────────────────────────────────────────────────────────────

export interface Squad {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  synergyLevel: number; // 1-10, higher = bigger focus bonus
  focusMultiplierBonus: number; // (synergyLevel - 1) * 0.05
  totalFocusMinutes: number;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
}

export interface SquadMember {
  id: string;
  squadId: string;
  userId: string;
  displayName: string;
  level: number;
  joinedAt: number;
  lastActiveAt: number;
  weeklyFocusMinutes: number;
}

// ── Squad Sessions ───────────────────────────────────────────────────────────

export type SquadSessionStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface SquadSession {
  id: string;
  squadId: string;
  name: string;
  durationMinutes: number;
  status: SquadSessionStatus;
  startedAt: number | null;
  completedAt: number | null;
  participantIds: string[];
  activeParticipantIds: string[]; // Updated via Realtime
  totalFocusMinutes: number;
  synergyBonus: number;
  createdAt: number;
}

// ── Input / Output ───────────────────────────────────────────────────────────

export interface CreateSquadInput {
  name: string;
  description?: string | null;
  maxMembers?: number;
}

export interface CreateSquadSessionInput {
  squadId: string;
  name: string;
  durationMinutes: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const SQUAD_LIMITS = {
  MAX_MEMBERS: 20,
  SYNERGY_BONUS_PER_LEVEL: 0.05, // 5% per synergy level
  SYNERGY_POINTS_PER_LEVEL: [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7250, 9250],
} as const;
