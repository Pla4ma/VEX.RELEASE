/**
 * Level-Up History Queries
 * Record and retrieve level-up events.
 */

import { v4 } from '../../utils/uuid';
import { RepositoryError, supabase } from './progression-queries';

// ============================================================================
// Record Level Up
// ============================================================================

export async function recordLevelUp(
  userId: string,
  level: number,
  xpAtLevel: number
): Promise<void> {
  const { error } = await supabase.from('level_up_history').insert({
    id: v4(),
    user_id: userId,
    level,
    achieved_at: Date.now(),
    xp_at_level: xpAtLevel,
  });

  if (error) {
    throw new RepositoryError('recordLevelUp', error);
  }
}

// ============================================================================
// Fetch History
// ============================================================================

export interface LevelUpRecordRow {
  level: number;
  achievedAt: number;
  xpAtLevel: number;
}

export async function fetchLevelUpHistory(
  userId: string
): Promise<LevelUpRecordRow[]> {
  const { data, error } = await supabase
    .from('level_up_history')
    .select('level, achieved_at, xp_at_level')
    .eq('user_id', userId)
    .order('level', { ascending: true });

  if (error) {
    throw new RepositoryError('fetchLevelUpHistory', error);
  }

  return (data || []).map(
    (row: { level: number; achieved_at: number; xp_at_level: number }) => ({
      level: row.level,
      achievedAt: row.achieved_at,
      xpAtLevel: row.xp_at_level,
    })
  );
}
