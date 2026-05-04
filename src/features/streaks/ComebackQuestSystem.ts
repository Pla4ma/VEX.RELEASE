/**
 * ComebackQuestSystem
 *
 * 3-session quest chain for users returning after 3+ days absence.
 * Creates structured re-engagement instead of just a 2× XP bonus.
 *
 * @phase 11.4
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('streaks:comeback-quest');

// ============================================================================
// Schemas
// ============================================================================

export const ComebackQuestStageSchema = z.enum(['QUEST_1', 'QUEST_2', 'QUEST_3', 'COMPLETE']);
export type ComebackQuestStage = z.infer<typeof ComebackQuestStageSchema>;

export const ComebackQuestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stage: ComebackQuestStageSchema,
  daysAbsent: z.number(),
  streakBeforeBreak: z.number(),
  quest1Completed: z.boolean().default(false),
  quest2Completed: z.boolean().default(false),
  quest3Completed: z.boolean().default(false),
  allQuestsCompleted: z.boolean().default(false),
  rewardsClaimed: z.boolean().default(false),
  phoenixBadgeEarned: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ComebackQuest = z.infer<typeof ComebackQuestSchema>;

export const ComebackQuestProgressSchema = z.object({
  currentStage: ComebackQuestStageSchema,
  quest1: z.object({
    required: z.object({ duration: z.number(), grade: z.string().optional() }),
    completed: z.boolean(),
  }),
  quest2: z.object({
    required: z.object({ duration: z.number(), grade: z.string() }),
    completed: z.boolean(),
  }),
  quest3: z.object({
    required: z.object({ duration: z.number(), grade: z.string() }),
    completed: z.boolean(),
  }),
  overallProgress: z.number(), // 0-100
  rewards: z.object({
    streakRestored: z.boolean(),
    phoenixBadge: z.boolean(),
    coins: z.number(),
    xpBonus: z.number(),
  }),
});

export type ComebackQuestProgress = z.infer<typeof ComebackQuestProgressSchema>;

// ============================================================================
// Quest Configuration
// ============================================================================

export const COMEBACK_QUEST_CONFIG = {
  minDaysAbsent: 3, // Must be absent 3+ days to trigger
  quest1: {
    name: 'First Step',
    description: 'Welcome back! Complete any session to begin your comeback.',
    duration: 15, // minutes
    grade: undefined, // any grade
  },
  quest2: {
    name: 'Getting Back Into It',
    description: 'You\'re finding your rhythm. Complete a 30-minute session with an A grade or better.',
    duration: 30,
    grade: 'A',
  },
  quest3: {
    name: 'Full Comeback',
    description: 'You\'re back! Complete a 45-minute session at A grade.',
    duration: 45,
    grade: 'A',
  },
  rewards: {
    streakRestored: 1, // Fresh start at day 1
    coins: 250,
    xpBonus: 100,
    phoenixBadge: 'Phoenix Rising', // Cosmetic badge name
  },
} as const;

// ============================================================================
// Core Functions
// ============================================================================

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

/**
 * Check if a session completes a quest requirement
 */
export function checkQuestCompletion(
  quest: ComebackQuest,
  sessionDuration: number,
  grade: string
): { questCompleted: ComebackQuestStage | null; progress: ComebackQuestProgress } {
  const gradeUpper = grade.toUpperCase();
  let questCompleted: ComebackQuestStage | null = null;

  // Check Quest 1
  if (!quest.quest1Completed) {
    if (sessionDuration >= COMEBACK_QUEST_CONFIG.quest1.duration) {
      questCompleted = 'QUEST_1';
    }
  }
  // Check Quest 2
  else if (!quest.quest2Completed) {
    if (
      sessionDuration >= COMEBACK_QUEST_CONFIG.quest2.duration &&
      gradeUpper >= COMEBACK_QUEST_CONFIG.quest2.grade
    ) {
      questCompleted = 'QUEST_2';
    }
  }
  // Check Quest 3
  else if (!quest.quest3Completed) {
    if (
      sessionDuration >= COMEBACK_QUEST_CONFIG.quest3.duration &&
      gradeUpper >= COMEBACK_QUEST_CONFIG.quest3.grade
    ) {
      questCompleted = 'QUEST_3';
    }
  }

  // Calculate progress
  const progress = calculateQuestProgress(quest, sessionDuration, grade);

  return { questCompleted, progress };
}

/**
 * Calculate quest progress
 */
export function calculateQuestProgress(
  quest: ComebackQuest,
  currentSessionDuration = 0,
  currentGrade = 'C'
): ComebackQuestProgress {
  const gradeUpper = currentGrade.toUpperCase();

  // Determine current stage
  let currentStage: ComebackQuestStage = 'QUEST_1';
  if (quest.quest3Completed) {currentStage = 'COMPLETE';}
  else if (quest.quest2Completed) {currentStage = 'QUEST_3';}
  else if (quest.quest1Completed) {currentStage = 'QUEST_2';}

  // Calculate overall progress
  let completedCount = 0;
  if (quest.quest1Completed) {completedCount++;}
  if (quest.quest2Completed) {completedCount++;}
  if (quest.quest3Completed) {completedCount++;}
  const overallProgress = (completedCount / 3) * 100;

  return {
    currentStage,
    quest1: {
      required: { duration: COMEBACK_QUEST_CONFIG.quest1.duration },
      completed: quest.quest1Completed,
    },
    quest2: {
      required: { duration: COMEBACK_QUEST_CONFIG.quest2.duration, grade: COMEBACK_QUEST_CONFIG.quest2.grade },
      completed: quest.quest2Completed,
    },
    quest3: {
      required: { duration: COMEBACK_QUEST_CONFIG.quest3.duration, grade: COMEBACK_QUEST_CONFIG.quest3.grade },
      completed: quest.quest3Completed,
    },
    overallProgress,
    rewards: {
      streakRestored: quest.allQuestsCompleted,
      phoenixBadge: quest.phoenixBadgeEarned,
      coins: COMEBACK_QUEST_CONFIG.rewards.coins,
      xpBonus: COMEBACK_QUEST_CONFIG.rewards.xpBonus,
    },
  };
}

/**
 * Update quest progress after session completion
 */
export async function updateQuestProgress(
  questId: string,
  sessionDuration: number,
  grade: string
): Promise<{ questCompleted: ComebackQuestStage | null; allComplete: boolean }> {
  try {
    // Get current quest state
    const { data: quest, error: fetchError } = await getSupabaseClient()
      .from('comeback_quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (fetchError || !quest) {
      debug.error('Failed to fetch quest', fetchError ?? undefined);
      return { questCompleted: null, allComplete: false };
    }

    const parsedQuest = ComebackQuestSchema.parse({
      id: quest.id,
      userId: quest.user_id,
      stage: quest.stage,
      daysAbsent: quest.days_absent,
      streakBeforeBreak: quest.streak_before_break,
      quest1Completed: quest.quest1_completed,
      quest2Completed: quest.quest2_completed,
      quest3Completed: quest.quest3_completed,
      allQuestsCompleted: quest.all_quests_completed,
      rewardsClaimed: quest.rewards_claimed,
      phoenixBadgeEarned: quest.phoenix_badge_earned,
      createdAt: new Date(quest.created_at).getTime(),
      updatedAt: new Date(quest.updated_at).getTime(),
    });

    const { questCompleted } = checkQuestCompletion(parsedQuest, sessionDuration, grade);

    if (!questCompleted) {
      return { questCompleted: null, allComplete: false };
    }

    // Update quest based on which one was completed
    const updates: Record<string, boolean | string> = {
      updated_at: new Date().toISOString(),
    };

    let newStage: ComebackQuestStage = parsedQuest.stage;
    let allComplete = false;

    if (questCompleted === 'QUEST_1') {
      updates.quest1_completed = true;
      updates.stage = 'QUEST_2';
      newStage = 'QUEST_2';
    } else if (questCompleted === 'QUEST_2') {
      updates.quest2_completed = true;
      updates.stage = 'QUEST_3';
      newStage = 'QUEST_3';
    } else if (questCompleted === 'QUEST_3') {
      updates.quest3_completed = true;
      updates.all_quests_completed = true;
      updates.phoenix_badge_earned = true;
      updates.stage = 'COMPLETE';
      newStage = 'COMPLETE';
      allComplete = true;
    }

    // Update database
    const { error: updateError } = await getSupabaseClient()
      .from('comeback_quests')
      .update(updates)
      .eq('id', questId);

    if (updateError) {
      debug.error('Failed to update quest', updateError);
      return { questCompleted: null, allComplete: false };
    }

    debug.info('Quest progress updated', { questId, questCompleted, allComplete });

    // If all complete, grant rewards
    if (allComplete) {
      await grantComebackRewards(parsedQuest.userId);
    }

    return { questCompleted, allComplete };
  } catch (error) {
    debug.error('Error updating quest progress', error instanceof Error ? error : undefined);
    return { questCompleted: null, allComplete: false };
  }
}

/**
 * Grant comeback rewards
 */
async function grantComebackRewards(userId: string): Promise<void> {
  try {
    // Restore streak to 1 (fresh start)
    await getSupabaseClient()
      .from('user_streaks')
      .update({
        current_streak: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Grant coins
    await getSupabaseClient()
      .from('user_balances')
      .update({
        coins: getSupabaseClient().rpc('increment', { amount: COMEBACK_QUEST_CONFIG.rewards.coins }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Add Phoenix badge to inventory
    await getSupabaseClient().from('user_inventory').insert({
      user_id: userId,
      item_type: 'BADGE',
      item_id: 'phoenix_rising',
      name: COMEBACK_QUEST_CONFIG.rewards.phoenixBadge,
      acquired_at: new Date().toISOString(),
    });

    // Mark rewards as claimed
    await getSupabaseClient()
      .from('comeback_quests')
      .update({
        rewards_claimed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('all_quests_completed', true)
      .eq('rewards_claimed', false);

    debug.info('Granted comeback rewards', { userId });
  } catch (error) {
    debug.error('Error granting comeback rewards', error instanceof Error ? error : undefined);
  }
}

/**
 * Get active comeback quest for user
 */
export async function getActiveComebackQuest(userId: string): Promise<ComebackQuest | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('comeback_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('all_quests_completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {return null;}

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
  } catch (error) {
    debug.error('Error fetching comeback quest', error instanceof Error ? error : undefined);
    return null;
  }
}

// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface UseComebackQuestResult {
  quest: ComebackQuest | null;
  progress: ComebackQuestProgress | null;
  isLoading: boolean;
  refresh: () => void;
  checkEligibility: () => Promise<boolean>;
}

/**
 * Hook to manage comeback quest
 */
export function useComebackQuest(userId: string | undefined): UseComebackQuestResult {
  const [quest, setQuest] = useState<ComebackQuest | null>(null);
  const [progress, setProgress] = useState<ComebackQuestProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const activeQuest = await getActiveComebackQuest(userId);
    setQuest(activeQuest);

    if (activeQuest) {
      setProgress(calculateQuestProgress(activeQuest));
    }

    setIsLoading(false);
  }, [userId]);

  const checkEligibility = useCallback(async (): Promise<boolean> => {
    if (!userId) {return false;}

    const { eligible } = await checkComebackEligibility(userId);

    if (eligible) {
      const newQuest = await createComebackQuest(userId);
      if (newQuest) {
        setQuest(newQuest);
        setProgress(calculateQuestProgress(newQuest));
        return true;
      }
    }

    return false;
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quest, progress, isLoading, refresh, checkEligibility };
}

export default {
  checkComebackEligibility,
  createComebackQuest,
  getActiveComebackQuest,
  updateQuestProgress,
  calculateQuestProgress,
  useComebackQuest,
  COMEBACK_QUEST_CONFIG,
};
