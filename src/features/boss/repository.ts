/**
 * Boss Repository
 * Supabase queries for boss data
 */

import { getSupabaseClient } from '../../config/supabase';
import {
  BossTemplateSchema,
  BossEncounterSchema,
  type BossTemplate,
  type BossEncounter,
} from './schemas';

// ============================================================================
// Error Handling
// ============================================================================

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

// ============================================================================
// Boss Templates
// ============================================================================

export async function fetchBossTemplates(): Promise<BossTemplate[]> {
  const { data, error } = await supabase
    .from('boss_templates')
    .select('*')
    .order('tier', { ascending: true });

  if (error) {
    throw new RepositoryError('fetchBossTemplates', error);
  }

  return BossTemplateSchema.array().parse(data || []);
}

export async function fetchBossTemplate(bossId: string): Promise<BossTemplate | null> {
  const { data, error } = await supabase
    .from('boss_templates')
    .select('*')
    .eq('id', bossId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchBossTemplate', error);
  }

  return BossTemplateSchema.parse(data);
}

// ============================================================================
// Boss Encounters
// ============================================================================

export async function fetchActiveEncounter(
  userId: string,
  squadId?: string
): Promise<BossEncounter | null> {
  let query = supabase
    .from('boss_encounters')
    .select('*')
    .eq('status', 'ACTIVE');

  if (squadId) {
    query = query.eq('squad_id', squadId);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new RepositoryError('fetchActiveEncounter', error);
  }

  if (!data) {return null;}
  return BossEncounterSchema.parse(data);
}

export async function fetchEncounterById(
  encounterId: string
): Promise<BossEncounter | null> {
  const { data, error } = await supabase
    .from('boss_encounters')
    .select('*')
    .eq('id', encounterId)
    .maybeSingle();

  if (error) {
    throw new RepositoryError('fetchEncounterById', error);
  }

  if (!data) {return null;}
  return BossEncounterSchema.parse(data);
}

export async function createEncounter(
  bossId: string,
  userId: string | null,
  squadId: string | null,
  maxHealth: number,
  timeLimit: number
): Promise<BossEncounter> {
  const now = Date.now();
  const newEncounter = {
    id: crypto.randomUUID(),
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

  const { data, error } = await supabase
    .from('boss_encounters')
    .insert(newEncounter)
    .select()
    .single();

  if (error) {
    throw new RepositoryError('createEncounter', error);
  }

  return BossEncounterSchema.parse(data);
}

export async function updateEncounterHealth(
  encounterId: string,
  healthRemaining: number,
  damageDealt: number,
  sessionId: string
): Promise<BossEncounter> {
  const { data: current, error: fetchError } = await supabase
    .from('boss_encounters')
    .select('contributing_session_ids')
    .eq('id', encounterId)
    .single();

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

export async function markEncounterDefeated(
  encounterId: string
): Promise<BossEncounter> {
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

export async function markEncounterTimeout(
  encounterId: string
): Promise<BossEncounter> {
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

// ============================================================================
// Boss Defeat History
// ============================================================================

export async function recordBossDefeat(
  userId: string,
  bossId: string,
  encounterId: string,
  damageDealt: number
): Promise<void> {
  const { error } = await supabase
    .from('boss_defeat_history')
    .insert({
      id: crypto.randomUUID(),
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

export async function hasDefeatedBoss(userId: string, bossId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('boss_defeat_history')
    .select('id')
    .eq('user_id', userId)
    .eq('boss_id', bossId)
    .maybeSingle();

  if (error) {
    throw new RepositoryError('hasDefeatedBoss', error);
  }

  return !!data;
}

// ============================================================================
// Boss Cooldowns
// ============================================================================

export async function setBossCooldown(
  userId: string,
  bossId: string,
  durationMs: number,
  reason: 'TIMEOUT' | 'MANUAL'
): Promise<void> {
  const expiresAt = Date.now() + durationMs;

  const { error } = await supabase
    .from('boss_cooldowns')
    .upsert({
      user_id: userId,
      boss_id: bossId,
      expires_at: expiresAt,
      reason,
      updated_at: Date.now(),
    }, {
      onConflict: 'user_id,boss_id',
    });

  if (error) {
    throw new RepositoryError('setBossCooldown', error);
  }
}

export async function isOnCooldown(userId: string, bossId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('boss_cooldowns')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('boss_id', bossId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return false;
    }
    throw new RepositoryError('isOnCooldown', error);
  }

  return data ? data.expires_at > Date.now() : false;
}
