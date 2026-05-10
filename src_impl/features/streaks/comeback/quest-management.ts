/**
 * Comeback Quest Management
 *
 * Functions to create, update, and manage comeback quests.
 */

import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import { checkComebackEligibility } from './eligibility';
import { ComebackQuestSchema, type ComebackQuest } from './schemas';

const debug = createDebugger('streaks:comeback-quest');

/**
 * Create comeback quest for user
 */
export async function createComebackQuest(userId: string): Promise<ComebackQuest | null> {
  try {
    const eligibility = await checkComebackEligibility(userId);

    if (!eligibility.eligible) {
      return null;
    }

    // Check if active quest already exists
    const { data: existingQuest, error: checkError } = await getSupabaseClient()
      .from('comeback_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('all_quests_completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      debug.warn('Error checking existing quest', checkError);
    }

    if (existingQuest) {
      // Return existing quest
      return ComebackQuestSchema.parse({
        id: existingQuest.id,
        userId: existingQuest.user_id,
        stage: existingQuest.stage,
        daysAbsent: existingQuest.days_absent,
        streakBeforeBreak: existingQuest.streak_before_break,
        quest1Completed: existingQuest.quest1_completed,
        quest2Completed: existingQuest.quest2_completed,
        quest3Completed: existingQuest.quest3_completed,
        allQuestsCompleted: existingQuest.all_quests_completed,
        rewardsClaimed: existingQuest.rewards_claimed,
        phoenixBadgeEarned: existingQuest.phoenix_badge_earned,
        createdAt: new Date(existingQuest.created_at).getTime(),
        updatedAt: new Date(existingQuest.updated_at).getTime(),
      });
    }

    // Create new quest
    const { data: newQuest, error: insertError } = await getSupabaseClient()
      .from('comeback_quests')
      .insert({
        user_id: userId,
        stage: 'QUEST_1',
        days_absent: eligibility.daysAbsent,
        streak_before_break: eligibility.streakBeforeBreak,
        quest1_completed: false,
        quest2_completed: false,
        quest3_completed: false,
        all_quests_completed: false,
        rewards_claimed: false,
        phoenix_badge_earned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !newQuest) {
      debug.error('Failed to create comeback quest', insertError ?? undefined);
      return null;
    }

    debug.info('Created comeback quest', { userId, daysAbsent: eligibility.daysAbsent });

    return ComebackQuestSchema.parse({
      id: newQuest.id,
      userId: newQuest.user_id,
      stage: newQuest.stage,
      daysAbsent: newQuest.days_absent,
      streakBeforeBreak: newQuest.streak_before_break,
      quest1Completed: newQuest.quest1_completed,
      quest2Completed: newQuest.quest2_completed,
      quest3Completed: newQuest.quest3_completed,
      allQuestsCompleted: newQuest.all_quests_completed,
      rewardsClaimed: newQuest.rewards_claimed,
      phoenixBadgeEarned: newQuest.phoenix_badge_earned,
      createdAt: new Date(newQuest.created_at).getTime(),
      updatedAt: new Date(newQuest.updated_at).getTime(),
    });
  } catch (error) {
    debug.error('Error creating comeback quest', error instanceof Error ? error : undefined);
    return null;
  }
}
