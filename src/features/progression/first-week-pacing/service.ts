/**
 * First Week Pacing Service
 *
 * Manages the first 7-session progression arc with proper pacing and unlocks.
 */

import { createDebugger } from '../../../utils/debug';
import * as Sentry from '@sentry/react-native';
import { FirstWeekProgressSchema, type FirstWeekProgress } from './schemas';
import {
  fetchFirstWeekProgress,
  createFirstWeekProgress,
} from './repository';
import {
  progressToNextSession as progressToNextSessionImpl,
  getSessionUnlocks,
  getSessionXpReward,
  getCompanionReaction,
  getTutorialSteps,
  isInFirstWeek,
  getFirstWeekCompletion,
} from './progression-service';
import { hashUserId } from '../../../utils/sentry-privacy';

const debug = createDebugger('progression:first-week');

// ============================================================================
// Helper Functions
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

function mapRowToProgress(row: FirstWeekProgressRow): FirstWeekProgress {
  return FirstWeekProgressSchema.parse({
    userId: row.user_id,
    currentSession: row.current_session,
    sessionsCompleted: row.sessions_completed,
    unlockedFeatures: row.unlocked_features || [],
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
// Core Service Functions
// ============================================================================

/**
 * Get or create first week progress for a user
 */
export async function getFirstWeekProgress(
  userId: string,
): Promise<FirstWeekProgress | null> {
  try {
    const existing = await fetchFirstWeekProgress(userId);

    if (existing) {
      return mapRowToProgress(existing);
    }

    // Create new first week progress
    const now = Date.now();
    const newRow = {
      user_id: userId,
      current_session: 'SESSION_1',
      sessions_completed: 0,
      unlocked_features: [] as string[],
      next_unlock: 'Focus Score Movement',
      total_xp_earned: 0,
      level_progress: 0,
      companion_unlocked: false,
      streak_explained: false,
      first_reward_earned: false,
      ai_coach_unlocked: false,
      weekly_milestone_earned: false,
      started_at: now,
      last_session_at: null as number | null,
    };

    return await createFirstWeekProgress(newRow);
  } catch (error) {
    debug.error(
      'Error getting first week progress',
      error instanceof Error ? error : undefined,
    );
    Sentry.captureException(error, {
      tags: { feature: 'first-week-pacing' },
      extra: { userId: hashUserId(userId) },
    });
    return null;
  }
}

// Re-export functions from the implementation file
export { progressToNextSessionImpl as progressToNextSession };
export {
  getSessionUnlocks,
  getSessionXpReward,
  getCompanionReaction,
  getTutorialSteps,
};
export { isInFirstWeek, getFirstWeekCompletion };
