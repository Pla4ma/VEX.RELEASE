import { getSupabaseClient } from "../../config/supabase";
import { BossTemplateSchema, BossEncounterSchema, type BossTemplate, type BossEncounter } from "./schemas";
import { v4 } from "../../utils/uuid";


export async function hasDefeatedBoss(userId: string, bossId: string): Promise<boolean> {
  const { data, error } = await supabase.from('boss_defeat_history').select('id').eq('user_id', userId).eq('boss_id', bossId).maybeSingle();

  if (error) {
    throw new RepositoryError('hasDefeatedBoss', error);
  }

  return !!data;
}

export async function setBossCooldown(userId: string, bossId: string, durationMs: number, reason: 'TIMEOUT' | 'MANUAL'): Promise<void> {
  const expiresAt = Date.now() + durationMs;

  const { error } = await supabase.from('boss_cooldowns').upsert(
    {
      user_id: userId,
      boss_id: bossId,
      expires_at: expiresAt,
      reason,
      updated_at: Date.now(),
    },
    {
      onConflict: 'user_id,boss_id',
    },
  );

  if (error) {
    throw new RepositoryError('setBossCooldown', error);
  }
}

export async function isOnCooldown(userId: string, bossId: string): Promise<boolean> {
  const { data, error } = await supabase.from('boss_cooldowns').select('expires_at').eq('user_id', userId).eq('boss_id', bossId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return false;
    }
    throw new RepositoryError('isOnCooldown', error);
  }

  return data ? data.expires_at > Date.now() : false;
}