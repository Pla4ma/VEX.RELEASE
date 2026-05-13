/**
 * Squads Service — Simplified: create, join, focus together, get bonus
 */

import { v4 as uuidv4 } from '../../utils/uuid';
import { getSupabaseClient } from '../../config/supabase';
import { eventBus } from '../../events';
import type { Squad, SquadMember, SquadSession, CreateSquadInput, CreateSquadSessionInput } from './types';
import { SQUAD_LIMITS } from './types';
import { CreateSquadInputSchema, CreateSquadSessionInputSchema } from './schemas';

const supabase = getSupabaseClient();

// ── Squad CRUD ───────────────────────────────────────────────────────────────
// ── Squad Sessions ───────────────────────────────────────────────────────────
// ── Mappers ──────────────────────────────────────────────────────────────────

function mapSquad(r: Record<string, unknown>): Squad {
  return {
    id: r.id as string, name: r.name as string, description: r.description as string | null,
    memberCount: r.member_count as number, maxMembers: r.max_members as number,
    synergyLevel: r.synergy_level as number ?? 1,
    focusMultiplierBonus: r.focus_multiplier_bonus as number ?? 0,
    totalFocusMinutes: r.total_focus_minutes as number ?? 0,
    createdAt: r.created_at as number, createdBy: r.created_by as string,
    updatedAt: r.updated_at as number,
  };
}

function mapMember(r: Record<string, unknown>): SquadMember {
  return {
    id: r.id as string, squadId: r.squad_id as string, userId: r.user_id as string,
    displayName: '', level: 1,
    joinedAt: r.joined_at as number, lastActiveAt: r.last_active_at as number,
    weeklyFocusMinutes: r.weekly_focus_minutes as number ?? 0,
  };
}

function mapSession(r: Record<string, unknown>): SquadSession {
  return {
    id: r.id as string, squadId: r.squad_id as string, name: r.name as string,
    durationMinutes: r.duration_minutes as number,
    status: r.status as SquadSession['status'],
    startedAt: r.started_at as number | null,
    completedAt: r.completed_at as number | null,
    participantIds: r.participant_ids as string[] ?? [],
    activeParticipantIds: r.active_participant_ids as string[] ?? [],
    totalFocusMinutes: r.total_focus_minutes as number ?? 0,
    synergyBonus: r.synergy_bonus as number ?? 0,
    createdAt: r.created_at as number,
  };
}

export * from "./service.part1";
