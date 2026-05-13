import { getSupabaseClient } from "../../config/supabase";
import { BossTemplateSchema, BossEncounterSchema, type BossTemplate, type BossEncounter } from "./schemas";
import { v4 } from "../../utils/uuid";


export async function fetchBossTemplates(): Promise<BossTemplate[]> {
  const { data, error } = await supabase.from('boss_templates').select('*').order('tier', { ascending: true });

  if (error) {
    throw new RepositoryError('fetchBossTemplates', error);
  }

  return BossTemplateSchema.array().parse(data || []);
}

export async function fetchBossTemplate(bossId: string): Promise<BossTemplate | null> {
  const { data, error } = await supabase.from('boss_templates').select('*').eq('id', bossId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchBossTemplate', error);
  }

  return BossTemplateSchema.parse(data);
}

export async function fetchActiveEncounter(userId: string, squadId?: string): Promise<BossEncounter | null> {
  let query = supabase.from('boss_encounters').select('*').eq('status', 'ACTIVE');

  if (squadId) {
    query = query.eq('squad_id', squadId);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new RepositoryError('fetchActiveEncounter', error);
  }

  if (!data) {
    return null;
  }
  return BossEncounterSchema.parse(data);
}

export async function fetchEncounterById(encounterId: string): Promise<BossEncounter | null> {
  const { data, error } = await supabase.from('boss_encounters').select('*').eq('id', encounterId).maybeSingle();

  if (error) {
    throw new RepositoryError('fetchEncounterById', error);
  }

  if (!data) {
    return null;
  }
  return BossEncounterSchema.parse(data);
}

export async function createEncounter(bossId: string, userId: string | null, squadId: string | null, maxHealth: number, timeLimit: number): Promise<BossEncounter> {
  const now = Date.now();
  const newEncounter = {
    id: v4(),
    boss_id: bossId,
    user_id: userId,
    squad_id: squadId,
    health_remaining: maxHealth,
    max_health: maxHealth,
    damage_dealt: 0,
    status: 'ACTIVE',
    started_at: now,
    expires_at: now + timeLimit * 1000,
    defeated_at: null,
    contributing_session_ids: [],
    created_at: now,
  };

  const { data, error } = await supabase.from('boss_encounters').insert(newEncounter).select().single();

  if (error) {
    throw new RepositoryError('createEncounter', error);
  }

  return BossEncounterSchema.parse(data);
}

export async function updateEncounterHealth(encounterId: string, healthRemaining: number, damageDealt: number, sessionId: string): Promise<BossEncounter> {
  const { data: current, error: fetchError } = await supabase.from('boss_encounters').select('contributing_session_ids').eq('id', encounterId).single();

  if (fetchError) {
    throw new RepositoryError('updateEncounterHealth:fetch', fetchError);
  }

  const sessionIds = [...(current?.contributing_session_ids || []), sessionId];

  const { data, error } = await supabase
    .from('boss_encounters')
    .update({
      health_remaining: healthRemaining,
      damage_dealt: damageDealt,
      contributing_session_ids: sessionIds,
      updated_at: Date.now(),
    })
    .eq('id', encounterId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('updateEncounterHealth', error);
  }

  return BossEncounterSchema.parse(data);
}

export async function markEncounterDefeated(encounterId: string): Promise<BossEncounter> {
  const { data, error } = await supabase
    .from('boss_encounters')
    .update({
      status: 'DEFEATED',
      defeated_at: Date.now(),
      updated_at: Date.now(),
    })
    .eq('id', encounterId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('markEncounterDefeated', error);
  }

  return BossEncounterSchema.parse(data);
}

export async function markEncounterTimeout(encounterId: string): Promise<BossEncounter> {
  const { data, error } = await supabase
    .from('boss_encounters')
    .update({
      status: 'TIMEOUT',
      updated_at: Date.now(),
    })
    .eq('id', encounterId)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('markEncounterTimeout', error);
  }

  return BossEncounterSchema.parse(data);
}

export async function recordBossDefeat(userId: string, bossId: string, encounterId: string, damageDealt: number): Promise<void> {
  const { error } = await supabase.from('boss_defeat_history').insert({
    id: v4(),
    user_id: userId,
    boss_id: bossId,
    encounter_id: encounterId,
    damage_dealt: damageDealt,
    defeated_at: Date.now(),
  });

  if (error) {
    throw new RepositoryError('recordBossDefeat', error);
  }
}