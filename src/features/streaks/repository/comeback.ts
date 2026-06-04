import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import { ComebackQuestSchema, type ComebackQuest } from '../comeback/schemas';

const debug = createDebugger('streaks:comeback-repo');
const supabase = getSupabaseClient();

export async function fetchExistingComebackQuest(
  userId: string,
): Promise<ComebackQuest | null> {
  const { data, error } = await supabase
    .from('comeback_quests')
    .select('id,user_id,stage,days_absent,streak_before_break,quest1_completed,quest2_completed,quest3_completed,all_quests_completed,rewards_claimed,phoenix_badge_earned,created_at,updated_at')
    .eq('user_id', userId)
    .eq('all_quests_completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    debug.warn('Error checking existing quest', error);
    return null;
  }
  if (!data) {return null;}
  return ComebackQuestSchema.parse({
    id: data.id,
    userId: data.user_id,
    stage: data.stage,
    daysAbsent: data.days_absent,
    streakBeforeBreak: data.streak_before_break,
    quest1Completed: data.quest1_completed,
    quest2Completed: data.quest2_completed,
    quest3Completed: data.quest3_completed,
    allQuestsCompleted: data.all_quests_completed,
    rewardsClaimed: data.rewards_claimed,
    phoenixBadgeEarned: data.phoenix_badge_earned,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  });
}

export async function insertComebackQuest(
  userId: string,
  daysAbsent: number,
  streakBeforeBreak: number,
): Promise<ComebackQuest> {
  const { data, error } = await supabase
    .from('comeback_quests')
    .insert({
      user_id: userId,
      stage: 'QUEST_1',
      days_absent: daysAbsent,
      streak_before_break: streakBeforeBreak,
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
  if (error || !data) {
    throw new Error(`Failed to create comeback quest: ${error?.message}`);
  }
  return ComebackQuestSchema.parse({
    id: data.id,
    userId: data.user_id,
    stage: data.stage,
    daysAbsent: data.days_absent,
    streakBeforeBreak: data.streak_before_break,
    quest1Completed: data.quest1_completed,
    quest2Completed: data.quest2_completed,
    quest3Completed: data.quest3_completed,
    allQuestsCompleted: data.all_quests_completed,
    rewardsClaimed: data.rewards_claimed,
    phoenixBadgeEarned: data.phoenix_badge_earned,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  });
}

export async function fetchLastCompletedSession(
  userId: string,
): Promise<{ completed_at: string } | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'COMPLETED')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) {return null;}
  return data as { completed_at: string };
}

export async function fetchUserStreakBeforeBreak(
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('streak_before_break')
    .eq('user_id', userId)
    .single();
  if (error) {return 0;}
  return (data?.streak_before_break ?? 0) as number;
}

export async function updateComebackQuestProgress(
  questId: string,
  updateData: Record<string, unknown>,
): Promise<ComebackQuest> {
  const { data, error } = await supabase
    .from('comeback_quests')
    .update(updateData)
    .eq('id', questId)
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Failed to update quest progress: ${error?.message}`);
  }
  return ComebackQuestSchema.parse({
    id: data.id,
    userId: data.user_id,
    stage: data.stage,
    daysAbsent: data.days_absent,
    streakBeforeBreak: data.streak_before_break,
    quest1Completed: data.quest1_completed,
    quest2Completed: data.quest2_completed,
    quest3Completed: data.quest3_completed,
    allQuestsCompleted: data.all_quests_completed,
    rewardsClaimed: data.rewards_claimed,
    phoenixBadgeEarned: data.phoenix_badge_earned,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  });
}
