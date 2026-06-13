/**
 * Unified Mastery Repository
 * Supabase integration for 5-track mastery system
 */
import { z } from 'zod';
import { supabase } from '../../../config/supabase';
import { RepositoryError } from '../../../lib/repository/error-handling';
import type { UnifiedMasteryState, MasteryRank } from '../unified-mastery';
import { createStarterMasteryState } from './starter-mastery';
export { incrementTrackXp, updateMasteryTrack } from './unified-write';

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

const DEFAULT_RANK: MasteryRank = 'APPRENTICE';

type MasteryTrackRow = z.infer<typeof MasteryTrackRowSchema>;

function isMissingMasteryColumns(error: { code?: string; message?: string }): boolean {
  return error.code === '42703' || /column .* does not exist/i.test(error.message ?? '');
}

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
    overallRank: (row.overall_rank as MasteryRank) ?? DEFAULT_RANK,
    prestigeLevel: 0,
    prestigeBonuses: [],
    lastUpdated: new Date(row.updated_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
  };
}

function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
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
    if (isMissingMasteryColumns(error)) {
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
    if (isMissingMasteryColumns(error)) {
      return createStarterMasteryState(userId);
    }
    throw new RepositoryError('createMasteryTrack', error);
  }
  const parsed = MasteryTrackRowSchema.parse(data);
  return dbToState(parsed);
}

