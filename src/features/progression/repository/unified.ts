/**
 * Unified Mastery Repository
 * Supabase integration for 5-track mastery system
 */
import { supabase } from '../../../config/supabase';
import type { UnifiedMasteryState, MasteryTrack } from '../unified-mastery';
import { tableColumns } from '../../../lib/repository/tableColumns';
const TABLE = 'mastery_tracks';
export async function fetchMasteryTrack(
  userId: string,
): Promise<UnifiedMasteryState | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_id,duration_level,duration_xp,duration_total_xp,purity_level,purity_xp,purity_total_xp,consistency_level,consistency_xp,consistency_total_xp,comeback_level,comeback_xp,comeback_total_xp,boss_level,boss_xp,boss_total_xp,overall_level,overall_rank,updated_at,created_at')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    } // No rows found
    throw error;
  }
  if (!data) {
    return null;
  }
  return dbToState(data);
}
export async function createMasteryTrack(
  userId: string,
): Promise<UnifiedMasteryState> {
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
export async function updateMasteryTrack(
  userId: string,
  state: UnifiedMasteryState,
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
export async function incrementTrackXp(
  userId: string,
  track: MasteryTrack,
  xpAmount: number,
): Promise<void> {
  const trackKey = track.toLowerCase();
  const { error } = await supabase.rpc('increment_track_xp', {
    p_user_id: userId,
    p_track: trackKey,
    p_amount: xpAmount,
  });
  if (error) {
    // Fallback if RPC doesn't exist
    const { data } = await supabase
      .from(TABLE)
      .select('user_id,duration_level,duration_xp,duration_total_xp,purity_level,purity_xp,purity_total_xp,consistency_level,consistency_xp,consistency_total_xp,comeback_level,comeback_xp,comeback_total_xp,boss_level,boss_xp,boss_total_xp,overall_level,overall_rank,updated_at,created_at')
      .eq('user_id', userId)
      .single();
    if (data) {
      await updateTrackXpFallback(userId, track, data, xpAmount);
    }
  }
}
async function updateTrackXpFallback(
  userId: string,
  track: MasteryTrack,
  row: Record<string, unknown>,
  xpAmount: number,
): Promise<void> {
  const updates = buildTrackXpUpdate(track, row, xpAmount);
  await supabase.from(TABLE).update(updates).eq('user_id', userId);
}
function valueToNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}
function buildTrackXpUpdate(
  track: MasteryTrack,
  row: Record<string, unknown>,
  xpAmount: number,
): Record<string, number> {
  switch (track) {
    case 'DURATION':
      return {
        duration_xp: valueToNumber(row.duration_xp) + xpAmount,
        duration_total_xp: valueToNumber(row.duration_total_xp) + xpAmount,
      };
    case 'PURITY':
      return {
        purity_xp: valueToNumber(row.purity_xp) + xpAmount,
        purity_total_xp: valueToNumber(row.purity_total_xp) + xpAmount,
      };
    case 'CONSISTENCY':
      return {
        consistency_xp: valueToNumber(row.consistency_xp) + xpAmount,
        consistency_total_xp:
          valueToNumber(row.consistency_total_xp) + xpAmount,
      };
    case 'COMEBACK':
      return {
        comeback_xp: valueToNumber(row.comeback_xp) + xpAmount,
        comeback_total_xp: valueToNumber(row.comeback_total_xp) + xpAmount,
      };
    case 'BOSS':
      return {
        boss_xp: valueToNumber(row.boss_xp) + xpAmount,
        boss_total_xp: valueToNumber(row.boss_total_xp) + xpAmount,
      };
  }
}
// DB row to domain state
function dbToState(row: Record<string, unknown>): UnifiedMasteryState {
  return {
    userId: row.user_id as string,
    tracks: {
      DURATION: {
        level: row.duration_level as number,
        xp: row.duration_xp as number,
        xpToNext: calculateXpForLevel((row.duration_level as number) + 1),
        totalXp: row.duration_total_xp as number,
        milestonesCompleted: [],
      },
      PURITY: {
        level: row.purity_level as number,
        xp: row.purity_xp as number,
        xpToNext: calculateXpForLevel((row.purity_level as number) + 1),
        totalXp: row.purity_total_xp as number,
        milestonesCompleted: [],
      },
      CONSISTENCY: {
        level: row.consistency_level as number,
        xp: row.consistency_xp as number,
        xpToNext: calculateXpForLevel((row.consistency_level as number) + 1),
        totalXp: row.consistency_total_xp as number,
        milestonesCompleted: [],
      },
      COMEBACK: {
        level: row.comeback_level as number,
        xp: row.comeback_xp as number,
        xpToNext: calculateXpForLevel((row.comeback_level as number) + 1),
        totalXp: row.comeback_total_xp as number,
        milestonesCompleted: [],
      },
      BOSS: {
        level: row.boss_level as number,
        xp: row.boss_xp as number,
        xpToNext: calculateXpForLevel((row.boss_level as number) + 1),
        totalXp: row.boss_total_xp as number,
        milestonesCompleted: [],
      },
    },
    overallLevel: row.overall_level as number,
    overallRank: row.overall_rank as UnifiedMasteryState['overallRank'],
    prestigeLevel: 0, // From separate table
    prestigeBonuses: [],
    lastUpdated: new Date(row.updated_at as string).getTime(),
    createdAt: new Date(row.created_at as string).getTime(),
  };
}
// Domain state to DB row
function stateToDb(state: UnifiedMasteryState): Record<string, unknown> {
  return {
    duration_level: state.tracks.DURATION.level,
    duration_xp: state.tracks.DURATION.xp,
    duration_total_xp: state.tracks.DURATION.totalXp,
    purity_level: state.tracks.PURITY.level,
    purity_xp: state.tracks.PURITY.xp,
    purity_total_xp: state.tracks.PURITY.totalXp,
    consistency_level: state.tracks.CONSISTENCY.level,
    consistency_xp: state.tracks.CONSISTENCY.xp,
    consistency_total_xp: state.tracks.CONSISTENCY.totalXp,
    comeback_level: state.tracks.COMEBACK.level,
    comeback_xp: state.tracks.COMEBACK.xp,
    comeback_total_xp: state.tracks.COMEBACK.totalXp,
    boss_level: state.tracks.BOSS.level,
    boss_xp: state.tracks.BOSS.xp,
    boss_total_xp: state.tracks.BOSS.totalXp,
    overall_level: state.overallLevel,
    overall_rank: state.overallRank,
  };
}
function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}
