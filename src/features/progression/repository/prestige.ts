/**
 * Prestige Repository
 * Supabase integration for prestige system
 */

import { supabase } from '../../../config/supabase';
import type { PrestigeState } from '../prestige-system';
import { tableColumns } from '../../../lib/repository/tableColumns';

const TABLE = 'prestige_states';

export async function fetchPrestigeState(
  userId: string,
): Promise<PrestigeState | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_id,prestige_level,total_prestiges,first_prestige_at,last_prestige_at,active_bonuses,fastest_prestige_days,most_xp_at_prestige,nightmare_unlocked,nightmare_completions')
    .eq('user_id', userId)
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

  return dbToState(data);
}

export async function createPrestigeState(
  userId: string,
): Promise<PrestigeState> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId })
    .select(tableColumns(TABLE))
    .single();

  if (error) {
    throw error;
  }
  return dbToState(data);
}

export async function updatePrestigeState(
  userId: string,
  state: PrestigeState,
): Promise<void> {
  const updates = stateToDb(state);

  const { error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function incrementNightmareCompletions(
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      nightmare_completions: supabase.rpc('increment', { x: 1 }),
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

function dbToState(row: Record<string, unknown>): PrestigeState {
  return {
    prestigeLevel: row.prestige_level as number,
    totalPrestiges: row.total_prestiges as number,
    firstPrestigeAt: row.first_prestige_at
      ? new Date(row.first_prestige_at as string).getTime()
      : null,
    lastPrestigeAt: row.last_prestige_at
      ? new Date(row.last_prestige_at as string).getTime()
      : null,
    activeBonuses: (row.active_bonuses as string[]) || [],
    fastestPrestige: row.fastest_prestige_days as number | null,
    mostXpAtPrestige: row.most_xp_at_prestige as number | null,
    nightmareUnlocked: row.nightmare_unlocked as boolean,
    nightmareCompletions: row.nightmare_completions as number,
  };
}

function stateToDb(state: PrestigeState): Record<string, unknown> {
  return {
    prestige_level: state.prestigeLevel,
    total_prestiges: state.totalPrestiges,
    first_prestige_at: state.firstPrestigeAt
      ? new Date(state.firstPrestigeAt).toISOString()
      : null,
    last_prestige_at: state.lastPrestigeAt
      ? new Date(state.lastPrestigeAt).toISOString()
      : null,
    active_bonuses: state.activeBonuses,
    fastest_prestige_days: state.fastestPrestige,
    most_xp_at_prestige: state.mostXpAtPrestige,
    nightmare_unlocked: state.nightmareUnlocked,
    nightmare_completions: state.nightmareCompletions,
  };
}
