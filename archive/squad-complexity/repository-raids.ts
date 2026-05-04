/**
 * Squad Raids Repository
 */

import { supabase } from '../../supabase/client';
import type { SquadRaid, RaidParticipant } from './squad-raids';

const RAID_TABLE = 'squad_raids';
const PARTICIPANT_TABLE = 'raid_participants';

export async function fetchActiveRaidForSquad(squadId: string): Promise<SquadRaid | null> {
  const { data, error } = await supabase
    .from(RAID_TABLE)
    .select('*')
    .eq('squad_id', squadId)
    .in('status', ['SCHEDULED', 'IN_PROGRESS'])
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  // Fetch participants
  const { data: participants, error: pError } = await supabase
    .from(PARTICIPANT_TABLE)
    .select('*')
    .eq('raid_id', data.id);

  if (pError) {
    throw pError;
  }

  const raid = dbToRaid(data);
  raid.participants = (participants || []).map(dbToParticipant);
  return raid;
}

export async function fetchRaidById(raidId: string): Promise<SquadRaid | null> {
  const { data, error } = await supabase
    .from(RAID_TABLE)
    .select('*')
    .eq('id', raidId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  // Fetch participants
  const { data: participants, error: pError } = await supabase
    .from(PARTICIPANT_TABLE)
    .select('*')
    .eq('raid_id', data.id);

  if (pError) {
    throw pError;
  }

  const raid = dbToRaid(data);
  raid.participants = (participants || []).map(dbToParticipant);
  return raid;
}

export async function createRaid(
  templateId: string,
  squadId: string,
  timeSlot: string,
  scheduledFor: number,
  bossHealth: number
): Promise<SquadRaid> {
  const { data, error } = await supabase
    .from(RAID_TABLE)
    .insert({
      template_id: templateId,
      squad_id: squadId,
      time_slot: timeSlot,
      scheduled_for: new Date(scheduledFor).toISOString(),
      boss_health: bossHealth,
      boss_max_health: bossHealth,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return dbToRaid(data);
}

export async function addParticipant(
  raidId: string,
  userId: string,
  displayName: string,
  avatarUrl?: string
): Promise<void> {
  const { error } = await supabase
    .from(PARTICIPANT_TABLE)
    .insert({
      raid_id: raidId,
      user_id: userId,
    });

  if (error) {
    // Ignore duplicate key errors (user already joined)
    if (error.code !== '23505') {
      throw error;
    }
  }
}

export async function updateParticipant(
  raidId: string,
  userId: string,
  updates: Partial<RaidParticipant>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.isReady !== undefined) {
    dbUpdates.is_ready = updates.isReady;
  }
  if (updates.isPresent !== undefined) {
    dbUpdates.is_present = updates.isPresent;
  }
  if (updates.sessionId !== undefined) {
    dbUpdates.session_id = updates.sessionId;
  }
  if (updates.sessionStartedAt !== undefined) {
    dbUpdates.session_started_at = updates.sessionStartedAt
      ? new Date(updates.sessionStartedAt).toISOString()
      : null;
  }
  if (updates.sessionEndedAt !== undefined) {
    dbUpdates.session_ended_at = updates.sessionEndedAt
      ? new Date(updates.sessionEndedAt).toISOString()
      : null;
  }
  if (updates.damageDealt !== undefined) {
    dbUpdates.damage_dealt = updates.damageDealt;
  }
  if (updates.purityScore !== undefined) {
    dbUpdates.purity_score = updates.purityScore;
  }
  if (updates.sessionDuration !== undefined) {
    dbUpdates.session_duration = updates.sessionDuration;
  }
  if (updates.completedSession !== undefined) {
    dbUpdates.completed_session = updates.completedSession;
  }
  if (updates.rewardsReceived !== undefined) {
    dbUpdates.rewards_received = updates.rewardsReceived;
  }

  const { error } = await supabase
    .from(PARTICIPANT_TABLE)
    .update(dbUpdates)
    .eq('raid_id', raidId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function updateRaid(
  raidId: string,
  updates: Partial<SquadRaid>
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    dbUpdates.status = updates.status;
  }
  if (updates.bossHealth !== undefined) {
    dbUpdates.boss_health = updates.bossHealth;
  }
  if (updates.bossPhase !== undefined) {
    dbUpdates.boss_phase = updates.bossPhase;
  }
  if (updates.totalDamageDealt !== undefined) {
    dbUpdates.total_damage_dealt = updates.totalDamageDealt;
  }
  if (updates.damageLog !== undefined) {
    dbUpdates.damage_log = updates.damageLog;
  }
  if (updates.startedAt !== undefined) {
    dbUpdates.started_at = updates.startedAt
      ? new Date(updates.startedAt).toISOString()
      : null;
  }
  if (updates.endedAt !== undefined) {
    dbUpdates.ended_at = updates.endedAt
      ? new Date(updates.endedAt).toISOString()
      : null;
  }

  const { error } = await supabase
    .from(RAID_TABLE)
    .update(dbUpdates)
    .eq('id', raidId);

  if (error) {
    throw error;
  }
}

function dbToRaid(row: Record<string, unknown>): SquadRaid {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    squadId: row.squad_id as string,
    scheduledFor: new Date(row.scheduled_for as string).getTime(),
    timeSlot: row.time_slot as SquadRaid['timeSlot'],
    startedAt: row.started_at ? new Date(row.started_at as string).getTime() : null,
    endedAt: row.ended_at ? new Date(row.ended_at as string).getTime() : null,
    status: row.status as SquadRaid['status'],
    bossHealth: row.boss_health as number,
    bossMaxHealth: row.boss_max_health as number,
    bossPhase: row.boss_phase as SquadRaid['bossPhase'],
    participants: [],
    totalDamageDealt: row.total_damage_dealt as number,
    damageLog: ((row.damage_log as any) as Array<{
      timestamp: number;
      userId: string;
      damage: number;
      source: "SESSION" | "CRITICAL" | "SYNERGY" | "MECHANIC";
      bossHealthAfter: number;
    }>) || [],
    minParticipantsRequired: (row.min_participants_required as number) || 1,
  };
}

function dbToParticipant(row: Record<string, unknown>): RaidParticipant {
  return {
    userId: row.user_id as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string,
    joinedAt: new Date(row.joined_at as string).getTime(),
    isReady: row.is_ready as boolean,
    isPresent: row.is_present as boolean,
    sessionId: row.session_id as string | null,
    sessionStartedAt: row.session_started_at
      ? new Date(row.session_started_at as string).getTime()
      : null,
    sessionEndedAt: row.session_ended_at
      ? new Date(row.session_ended_at as string).getTime()
      : null,
    damageDealt: row.damage_dealt as number,
    purityScore: row.purity_score as number,
    sessionDuration: row.session_duration as number,
    completedSession: row.completed_session as boolean,
    rewardsReceived: (row.rewards_received as string[]) || [],
  };
}
