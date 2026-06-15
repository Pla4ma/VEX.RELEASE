/**
 * First Week Progression Service Implementation
 *
 * Core logic for progressing through the first week arc.
 */

import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import {
  FirstWeekProgressSchema,
  type FirstWeekProgress,
  type FirstWeekSession,
} from './schemas';
import { FIRST_WEEK_CONFIG, getNextSession, getSessionNumber } from './config';
import { calculateLevelProgress } from './progression-helpers';
import { tableColumns } from '../../../lib/repository/tableColumns';

export {
  calculateLevelProgress,
  getSessionUnlocks,
  getSessionXpReward,
  getCompanionReaction,
  getTutorialSteps,
  isInFirstWeek,
  getFirstWeekCompletion,
} from './progression-helpers';

const debug = createDebugger('progression:first-week-impl');

/**
 * Progress to the next session in the first week
 */
export async function progressToNextSession(
  userId: string,
  completedSession: FirstWeekSession,
  xpEarned: number,
  _sessionData?: Record<string, unknown>,
): Promise<FirstWeekProgress> {
  try {
    const supabase = getSupabaseClient();

    // Get current progress
    const { data: currentProgress, error: fetchError } = await supabase
      .from('first_week_progress')
      .select('user_id,current_session,sessions_completed,unlocked_features,next_unlock,total_xp_earned,level_progress,companion_unlocked,streak_explained,first_reward_earned,ai_coach_unlocked,weekly_milestone_earned,started_at,last_session_at')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      debug.error('Failed to fetch current progress', fetchError);
      throw new Error(
        `Failed to fetch current progress: ${fetchError.message}`,
      );
    }

    if (!currentProgress) {
      throw new Error('No first week progress found for user');
    }

    const nextSession = getNextSession(currentProgress.current_session);
    if (!nextSession) {
      // Already completed first week
      return FirstWeekProgressSchema.parse(currentProgress);
    }

    const sessionNumber = getSessionNumber(completedSession);
    const sessionUnlocks =
      FIRST_WEEK_CONFIG.sessionUnlocks[completedSession] || [];
    const _xpReward = FIRST_WEEK_CONFIG.xpRewards[completedSession] || 0;

    // Calculate new progress
    const newSessionsCompleted = currentProgress.sessions_completed + 1;
    const newTotalXp = currentProgress.total_xp_earned + xpEarned;
    const newLevelProgress = calculateLevelProgress(newTotalXp);

    // Check for unlocks
    const newUnlockedFeatures = [...currentProgress.unlocked_features];
    let nextUnlock = null;

    const newunlockedfeatureSet = new Set(newUnlockedFeatures);
    for (const unlock of sessionUnlocks) {
      if (!newUnlockedFeatures.includes(unlock.title)) {
      if (!newunlockedfeatureSet.has(unlock.title)) {
        if (!nextUnlock) {
          nextUnlock = unlock.title;
        }
      }
    }

    // Update state based on session
    const companionUnlocked =
      currentProgress.companion_unlocked || sessionNumber >= 1;
    const streakExplained =
      currentProgress.streak_explained || sessionNumber >= 2;
    const firstRewardEarned =
      currentProgress.first_reward_earned || sessionNumber >= 3;
    const aiCoachUnlocked =
      currentProgress.ai_coach_unlocked || sessionNumber >= 5;
    const weeklyMilestoneEarned =
      currentProgress.weekly_milestone_earned || sessionNumber >= 7;

    const updateData = {
      current_session: nextSession,
      sessions_completed: newSessionsCompleted,
      unlocked_features: newUnlockedFeatures,
      next_unlock: nextUnlock,
      total_xp_earned: newTotalXp,
      level_progress: newLevelProgress,
      companion_unlocked: companionUnlocked,
      streak_explained: streakExplained,
      first_reward_earned: firstRewardEarned,
      ai_coach_unlocked: aiCoachUnlocked,
      weekly_milestone_earned: weeklyMilestoneEarned,
      last_session_at: Date.now(),
    };

    const { data, error } = await supabase
      .from('first_week_progress')
      .update(updateData)
      .eq('user_id', userId)
      .select(tableColumns('first_week_progress'))
      .single();

    if (error) {
      debug.error('Failed to progress first week', error);
      throw new Error(`Failed to progress first week: ${error.message}`);
    }

    debug.info('Progressed to next session', {
      userId,
      from: currentProgress.current_session,
      to: nextSession,
      sessionNumber,
      unlocks: newUnlockedFeatures.length,
    });

    return FirstWeekProgressSchema.parse(data);
  } catch (error) {
    debug.error(
      'Error progressing first week',
      error instanceof Error ? error : undefined,
    );
    throw error;
  }
}
