/**
 * Unified Mastery Repository
 * Supabase integration for 5-track mastery system
 */
import { z } from 'zod';
import { supabase } from '../../../config/supabase';
import { RepositoryError } from '../../../lib/repository/error-handling';
import type { UnifiedMasteryState, MasteryTrack } from '../unified-mastery';

const TABLE = 'mastery_tracks';

const MasteryTrackRowSchema = z.object({
  user_id: z.string(),
  duration_level: z.number(),
  duration_xp: z.number(),
  duration_total_xp: z.number(),
  purity_level: z.number(),
  purity_xp: z.number(),
  purity_total_xp: z.number(),
  consistency_level: z.number(),
  consistency_xp: z.number(),
  consistency_total_xp: z.number(),
  comeback_level: z.number(),
  comeback_xp: z.number(),
  comeback_total_xp: z.number(),
  boss_level: z.number(),
  boss_xp: z.number(),
  boss_total_xp: z.number(),
  overall_level: z.number(),
  overall_rank: z.string().nullable().optional(),
  updated_at: z.string(),
  created_at: z.string(),
});

type MasteryTrackRow = z.infer<typeof MasteryTrackRowSchema>;

function dbToState(row: MasteryTrackRow): UnifiedMasteryState {
  return {
    userId: row.user_id,
    tracks: {
      DURATION: {
        level: row.duration_level,
        xp: row.duration_xp,
        xpToNext: calculateXpForLevel(row.duration_level + 1),
        totalXp: row.duration_total_xp,
        milestonesCompleted: [],
      },
      PURITY: {
        level: row.purity_level,
        xp: row.purity_xp,
        xpToNext: calculateXpForLevel(row.purity_level + 1),
        totalXp: row.purity_total_xp,
        milestonesCompleted: [],
      },
      CONSISTENCY: {
        level: row.consistency_level,
        xp: row.consistency_xp,
        xpToNext: calculateXpForLevel(row.consistency_level + 1),
        totalXp: row.consistency_total_xp,
        milestonesCompleted: [],
      },
      COMEBACK: {
        level: row.comeback_level,
        xp: row.comeback_xp,
        xpToNext: calculateXpForLevel(row.comeback_level + 1),
        totalXp: row.comeback_total_xp,
        milestonesCompleted: [],
      },
      BOSS: {
        level: row.boss_level,
        xp: row.boss_xp,
        xpToNext: calculateXpForLevel(row.boss_level + 1),
        totalXp: row.boss_total_xp,
        milestonesCompleted: [],
      },
    },
    overallLevel: row.overall_level,
    overallRank: row.overall_rank ?? 'NOVICE',
    prestigeLevel: 0,
    prestigeBonuses: [],
    lastUpdated: new Date(row.updated_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
  };
}

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

function valueToNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

function buildTrackXpUpdate(
  track: MasteryTrack,
  row: MasteryTrackRow,
  xpAmount: number,
): Record<string, number> {
  switch (track) {
    case 'DURATION':
      return {
        duration_xp: row.duration_xp + xpAmount,
        duration_total_xp: row.duration_total_xp + xpAmount,
      };
    case 'PURITY':
      return {
        purity_xp: row.purity_xp + xpAmount,
        purity_total_xp: row.purity_total_xp + xpAmount,
      };
    case 'CONSISTENCY':
      return {
        consistency_xp: row.consistency_xp + xpAmount,
        consistency_total_xp: row.consistency_total_xp + xpAmount,
      };
    case 'COMEBACK':
      return {
        comeback_xp: row.comeback_xp + xpAmount,
        comeback_total_xp: row.comeback_total_xp + xpAmount,
      };
    case 'BOSS':
      return {
        boss_xp: row.boss_xp + xpAmount,
        boss_total_xp: row.boss_total_xp + xpAmount,
      };
  }
}

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
    }
    throw new RepositoryError('fetchMasteryTrack', error);
  }
  if (!data) {
    return null;
  }
  const parsed = MasteryTrackRowSchema.parse(data);
  return dbToState(parsed);
}

export async function createMasteryTrack(
  userId: string,
): Promise<UnifiedMasteryState> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId })
    .select('boss_level,boss_total_xp,boss_xp,comeback_level,comeback_total_xp,comeback_xp,consistency_level,consistency_total_xp,consistency_xp,created_at,duration_level,duration_total_xp,duration_xp,id,overall_level,overall_rank,purity_level,purity_total_xp,purity_xp,updated_at,user_id')
    .single();
  if (error) {
    throw new RepositoryError('createMasteryTrack', error);
  }
  const parsed = MasteryTrackRowSchema.parse(data);
  return dbToState(parsed);
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
    throw new RepositoryError('updateMasteryTrack', error);
  }
}

async function updateTrackXpFallback(
  userId: string,
  track: MasteryTrack,
  row: MasteryTrackRow,
  xpAmount: number,
): Promise<void> {
  const updates = buildTrackXpUpdate(track, row, xpAmount);
  const { error } = await supabase.from(TABLE).update(updates).eq('user_id', userId);
  if (error) {
    throw new RepositoryError('updateTrackXpFallback', error);
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
    const { data } = await supabase
      .from(TABLE)
      .select('user_id,duration_level,duration_xp,duration_total_xp,purity_level,purity_xp,purity_total_xp,consistency_level,consistency_xp,consistency_total_xp,comeback_level,comeback_xp,comeback_total_xp,boss_level,boss_xp,boss_total_xp,overall_level,overall_rank,updated_at,created_at')
      .eq('user_id', userId)
      .single();
    if (data) {
      const parsed = MasteryTrackRowSchema.parse(data);
      await updateTrackXpFallback(userId, track, parsed, xpAmount);
    }
  }
}
