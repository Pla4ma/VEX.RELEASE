import { v4 as uuidv4 } from "../../utils/uuid";
import { getSupabaseClient } from "../../config/supabase";
import { eventBus } from "../../events";
import type { Squad, SquadMember, SquadSession, CreateSquadInput, CreateSquadSessionInput } from "./types";
import { SQUAD_LIMITS } from "./types";
import { CreateSquadInputSchema, CreateSquadSessionInputSchema } from "./schemas";


export async function createSquad(userId: string, input: CreateSquadInput): Promise<Squad> {
  const validated = CreateSquadInputSchema.parse(input);
  const existingMember = await getMemberSquad(userId);
  if (existingMember) {throw new Error('Already in a squad');}
  const now = Date.now();
  const { data, error } = await supabase.from('squads').insert({
    name: validated.name, description: validated.description ?? null,
    member_count: 1, max_members: validated.maxMembers ?? SQUAD_LIMITS.MAX_MEMBERS,
    synergy_level: 1, focus_multiplier_bonus: 0, total_focus_minutes: 0,
    created_at: now, created_by: userId, updated_at: now,
  }).select().single();
  if (error) {throw new Error(`Failed to create squad: ${error.message}`);}
  await supabase.from('squad_members').insert({
    squad_id: data.id, user_id: userId, joined_at: now, last_active_at: now, weekly_focus_minutes: 0,
  });
  eventBus.publish('squad.created', { squadId: data.id, userId, timestamp: now });
  return mapSquad(data);
}

export async function getSquad(squadId: string): Promise<Squad | null> {
  const { data } = await supabase.from('squads').select('*').eq('id', squadId).single();
  return data ? mapSquad(data) : null;
}

export async function joinSquad(userId: string, squadId: string): Promise<SquadMember> {
  const squad = await getSquad(squadId);
  if (!squad) {throw new Error('Squad not found');}
  if (squad.memberCount >= squad.maxMembers) {throw new Error('Squad is full');}
  const existing = await getMemberSquad(userId);
  if (existing) {throw new Error('Already in a squad');}
  const now = Date.now();
  const { error } = await supabase.from('squad_members').insert({
    squad_id: squadId, user_id: userId, joined_at: now, last_active_at: now, weekly_focus_minutes: 0,
  });
  if (error) {throw new Error(`Failed to join: ${error.message}`);}
  await supabase.from('squads').update({
    member_count: squad.memberCount + 1, updated_at: now,
  }).eq('id', squadId);
  eventBus.publish('squad.member_joined', { squadId, userId, timestamp: now });
  return {
    id: uuidv4(), squadId, userId, displayName: '', level: 1, joinedAt: now, lastActiveAt: now, weeklyFocusMinutes: 0,
  };
}

export async function leaveSquad(userId: string, squadId: string): Promise<void> {
  await supabase.from('squad_members').delete().eq('squad_id', squadId).eq('user_id', userId);
  const { data: squad } = await supabase.from('squads').select('member_count').eq('id', squadId).single();
  const count = squad?.member_count ?? 1;
  await supabase.from('squads').update({ member_count: Math.max(0, count - 1), updated_at: Date.now() }).eq('id', squadId);
}

export async function getMemberSquad(userId: string): Promise<SquadMember | null> {
  const { data } = await supabase.from('squad_members').select('*').eq('user_id', userId).single();
  return data ? mapMember(data) : null;
}

export async function getSquadMembers(squadId: string): Promise<SquadMember[]> {
  const { data } = await supabase.from('squad_members').select('*, profiles:user_id (display_name, level)').eq('squad_id', squadId);
  if (!data) {return [];}
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string, squadId: r.squad_id as string, userId: r.user_id as string,
    displayName: (r.profiles as Record<string, unknown>)?.display_name as string ?? 'Unknown',
    level: (r.profiles as Record<string, unknown>)?.level as number ?? 1,
    joinedAt: r.joined_at as number, lastActiveAt: r.last_active_at as number,
    weeklyFocusMinutes: r.weekly_focus_minutes as number ?? 0,
  }));
}

export async function updateMemberActivity(userId: string): Promise<void> {
  const member = await getMemberSquad(userId);
  if (!member) {return;}
  await supabase.from('squad_members').update({ last_active_at: Date.now() }).eq('id', member.id);
}

export async function createSquadSession(input: CreateSquadSessionInput): Promise<SquadSession> {
  const validated = CreateSquadSessionInputSchema.parse(input);
  const squad = await getSquad(validated.squadId);
  if (!squad) {throw new Error('Squad not found');}
  const now = Date.now();
  const session: SquadSession = {
    id: uuidv4(),
    squadId: validated.squadId,
    name: validated.name,
    durationMinutes: validated.durationMinutes,
    status: 'SCHEDULED',
    startedAt: null,
    completedAt: null,
    participantIds: [],
    activeParticipantIds: [],
    totalFocusMinutes: 0,
    synergyBonus: squad.focusMultiplierBonus,
    createdAt: now,
  };
  const { data, error } = await supabase.from('squad_sessions').insert({
    id: session.id, squad_id: session.squadId, name: session.name,
    duration_minutes: session.durationMinutes, status: session.status,
    participant_ids: [], active_participant_ids: [], total_focus_minutes: 0,
    synergy_bonus: session.synergyBonus, created_at: now,
  }).select().single();
  if (error) {throw new Error(`Failed to create session: ${error.message}`);}
  eventBus.publish('squad.session_created', {
    squadId: session.squadId, sessionId: session.id, timestamp: now,
  });
  return mapSession(data);
}

export async function joinSquadSession(sessionId: string, userId: string): Promise<SquadSession> {
  const { data, error } = await supabase.from('squad_sessions').select('*').eq('id', sessionId).single();
  if (error || !data) {throw new Error('Session not found');}
  const session = mapSession(data);
  if (session.status !== 'ACTIVE' && session.status !== 'SCHEDULED') {throw new Error('Session not available');}
  if (session.participantIds.includes(userId)) {return session;}
  session.participantIds = [...session.participantIds, userId];
  session.activeParticipantIds = [...session.activeParticipantIds, userId];
  await supabase.from('squad_sessions').update({
    participant_ids: session.participantIds,
    active_participant_ids: session.activeParticipantIds,
  }).eq('id', sessionId);
  eventBus.publish('squad.session_joined', { sessionId, userId, squadId: session.squadId, timestamp: Date.now() });
  return session;
}

export async function completeSquadSession(sessionId: string, focusMinutes: number): Promise<void> {
  const { data } = await supabase.from('squad_sessions').select('*').eq('id', sessionId).single();
  if (!data) {return;}
  const session = mapSession(data);
  const now = Date.now();
  await supabase.from('squad_sessions').update({
    status: 'COMPLETED', completed_at: now,
    total_focus_minutes: session.totalFocusMinutes + focusMinutes,
    active_participant_ids: [],
  }).eq('id', sessionId);
  const { data: squad } = await supabase.from('squads').select('total_focus_minutes').eq('id', session.squadId).single();
  const newTotal = (squad?.total_focus_minutes ?? 0) + focusMinutes;
  await supabase.from('squads').update({ total_focus_minutes: newTotal, updated_at: now }).eq('id', session.squadId);
  eventBus.publish('squad.session_completed', { sessionId, squadId: session.squadId, focusMinutes, timestamp: now });
}