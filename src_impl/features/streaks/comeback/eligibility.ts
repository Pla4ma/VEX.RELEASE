/**
 * Comeback Quest Eligibility
 *
 * Functions to check if user qualifies for comeback quest.
 */

import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import { COMEBACK_QUEST_CONFIG } from './config';

const debug = createDebugger('streaks:comeback-quest');

/**
 * Check if user qualifies for comeback quest
 */
export async function checkComebackEligibility(userId: string): Promise<{
  eligible: boolean;
  daysAbsent: number;
  streakBeforeBreak: number;
}> {
  try {
    // Get user's last session
    const { data: lastSession, error: sessionError } = await getSupabaseClient()
      .from('sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !lastSession) {
      // No previous sessions - not a comeback
      return { eligible: false, daysAbsent: 0, streakBeforeBreak: 0 };
    }

    // Calculate days absent
    const lastSessionDate = new Date(lastSession.completed_at);
    const now = new Date();
    const diffMs = now.getTime() - lastSessionDate.getTime();
    const daysAbsent = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysAbsent < COMEBACK_QUEST_CONFIG.minDaysAbsent) {
      return { eligible: false, daysAbsent, streakBeforeBreak: 0 };
    }

    // Get streak before break
    const { data: streakData, error: streakError } = await getSupabaseClient()
      .from('user_streaks')
      .select('streak_before_break')
      .eq('user_id', userId)
      .single();

    const streakBeforeBreak = streakError ? 0 : (streakData?.streak_before_break ?? 0);

    return { eligible: true, daysAbsent, streakBeforeBreak };
  } catch (error) {
    debug.error('Error checking comeback eligibility', error instanceof Error ? error : undefined);
    return { eligible: false, daysAbsent: 0, streakBeforeBreak: 0 };
  }
}