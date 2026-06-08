/**
 * First Week Pacing Repository
 *
 * All Supabase queries for the first week progression feature.
 * Data flow: Component → Hook → Service → Repository → Supabase
 */

import { getSupabaseClient } from '../../../config/supabase';
import {
  RepositoryError,
  classifyError,
} from '../../../lib/repository/error-handling';
import { FirstWeekProgressSchema } from './schemas';
import type { FirstWeekProgress } from './schemas';

// ============================================================================
// Row type — mirrors the Supabase table columns used by this repository
// ============================================================================

type FirstWeekProgressRow = {
  user_id: string;
  current_session: string;
  sessions_completed: number;
  unlocked_features: string[] | null;
  next_unlock: string | null;
  total_xp_earned: number;
  level_progress: number;
  companion_unlocked: boolean;
  streak_explained: boolean;
  first_reward_earned: boolean;
  ai_coach_unlocked: boolean;
  weekly_milestone_earned: boolean;
  started_at: number;
  last_session_at: number | null;
};

// ============================================================================
// Mapping
// ============================================================================

function mapRowToProgress(row: FirstWeekProgressRow): FirstWeekProgress {
  return FirstWeekProgressSchema.parse({
    userId: row.user_id,
    currentSession: row.current_session,
    sessionsCompleted: row.sessions_completed,
    unlockedFeatures: row.unlocked_features ?? [],
    nextUnlock: row.next_unlock,
    totalXpEarned: row.total_xp_earned,
    levelProgress: row.level_progress,
    companionUnlocked: row.companion_unlocked,
    streakExplained: row.streak_explained,
    firstRewardEarned: row.first_reward_earned,
    aiCoachUnlocked: row.ai_coach_unlocked,
    weeklyMilestoneEarned: row.weekly_milestone_earned,
    startedAt: row.started_at,
    lastSessionAt: row.last_session_at,
  });
}

// ============================================================================
// Queries
// ============================================================================

const SELECT_COLUMNS =
  'user_id,current_session,sessions_completed,unlocked_features,next_unlock,total_xp_earned,level_progress,companion_unlocked,streak_explained,first_reward_earned,ai_coach_unlocked,weekly_milestone_earned,started_at,last_session_at';

/**
 * Fetch first week progress for a user.
 * Returns null if no row exists yet (PGRST116).
 * Throws RepositoryError on any other error.
 */
export async function fetchFirstWeekProgress(
  userId: string,
): Promise<FirstWeekProgressRow | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('first_week_progress')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchFirstWeekProgress', error, classifyError(error));
  }

  return data as FirstWeekProgressRow;
}

/**
 * Insert a new first week progress row for a user.
 * Returns the created row mapped to FirstWeekProgress.
 * Throws RepositoryError on failure.
 */
export async function createFirstWeekProgress(
  row: FirstWeekProgressRow,
): Promise<FirstWeekProgress> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('first_week_progress')
    .insert(row)
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    throw new RepositoryError('createFirstWeekProgress', error, classifyError(error));
  }

  return mapRowToProgress(data as FirstWeekProgressRow);
}
