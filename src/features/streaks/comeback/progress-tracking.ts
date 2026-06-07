/**
 * Comeback Quest Progress Tracking
 *
 * Functions to track quest progress and completion.
 */

import { createDebugger } from '../../../utils/debug';
import { COMEBACK_QUEST_CONFIG } from './config';
import {
  ComebackQuestSchema,
  ComebackQuestProgressSchema,
  type ComebackQuest,
  type ComebackQuestProgress,
  type ComebackQuestStage,
} from './schemas';
import { updateComebackQuestProgress } from '../repository/comeback';

const debug = createDebugger('streaks:comeback-quest');

/**
 * Check if a session completes a quest requirement
 */
export function checkQuestCompletion(
  quest: ComebackQuest,
  sessionDuration: number,
  grade: string,
): {
  questCompleted: ComebackQuestStage | null;
  progress: ComebackQuestProgress;
} {
  const gradeUpper = grade.toUpperCase();
  let questCompleted: ComebackQuestStage | null = null;

  // Check Quest 1 (15 minutes, all grades accepted)
  if (!quest.quest1Completed) {
    const quest1Met = sessionDuration >= COMEBACK_QUEST_CONFIG.quest1.duration;
    if (quest1Met) {
      questCompleted = 'QUEST_1';
    }
  }
  // Check Quest 2 (30 minutes, A grade)
  else if (!quest.quest2Completed) {
    const quest2Met =
      sessionDuration >= COMEBACK_QUEST_CONFIG.quest2.duration &&
      gradeUpper >= COMEBACK_QUEST_CONFIG.quest2.grade!;
    if (quest2Met) {
      questCompleted = 'QUEST_2';
    }
  }
  // Check Quest 3 (45 minutes, A grade)
  else if (!quest.quest3Completed) {
    const quest3Met =
      sessionDuration >= COMEBACK_QUEST_CONFIG.quest3.duration &&
      gradeUpper >= COMEBACK_QUEST_CONFIG.quest3.grade!;
    if (quest3Met) {
      questCompleted = 'QUEST_3';
    }
  }

  const progress = calculateQuestProgress(quest);
  return { questCompleted, progress };
}

/**
 * Calculate overall quest progress
 */
export function calculateQuestProgress(
  quest: ComebackQuest,
): ComebackQuestProgress {
  const completedQuests = [
    quest.quest1Completed,
    quest.quest2Completed,
    quest.quest3Completed,
  ].filter(Boolean).length;

  const overallProgress = (completedQuests / 3) * 100;
  const currentStage = getCurrentStage(quest);

  return ComebackQuestProgressSchema.parse({
    currentStage,
    quest1: {
      required: COMEBACK_QUEST_CONFIG.quest1,
      completed: quest.quest1Completed,
    },
    quest2: {
      required: COMEBACK_QUEST_CONFIG.quest2,
      completed: quest.quest2Completed,
    },
    quest3: {
      required: COMEBACK_QUEST_CONFIG.quest3,
      completed: quest.quest3Completed,
    },
    overallProgress,
    rewards: {
      streakRestored: quest.allQuestsCompleted,
      phoenixBadge: quest.phoenixBadgeEarned,
      coins: quest.allQuestsCompleted ? COMEBACK_QUEST_CONFIG.rewards.coins : 0,
      xpBonus: quest.allQuestsCompleted
        ? COMEBACK_QUEST_CONFIG.rewards.xpBonus
        : 0,
    },
  });
}

/**
 * Get current quest stage
 */
function getCurrentStage(quest: ComebackQuest): ComebackQuestStage {
  if (quest.allQuestsCompleted) {
    return 'COMPLETE';
  }
  if (quest.quest3Completed) {
    return 'QUEST_3';
  }
  if (quest.quest2Completed) {
    return 'QUEST_2';
  }
  if (quest.quest1Completed) {
    return 'QUEST_2';
  }
  return 'QUEST_1';
}

/**
 * Update quest progress after session completion
 */
export async function updateQuestProgress(
  questId: string,
  completedStage: ComebackQuestStage,
): Promise<ComebackQuest | null> {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    switch (completedStage) {
      case 'QUEST_1': {
        updateData.quest1_completed = true;
        updateData.stage = 'QUEST_2';
        break;
      }
      case 'QUEST_2': {
        updateData.quest2_completed = true;
        updateData.stage = 'QUEST_3';
        break;
      }
      case 'QUEST_3': {
        updateData.quest3_completed = true;
        updateData.stage = 'COMPLETE';
        updateData.all_quests_completed = true;
        updateData.rewards_claimed = false;
        updateData.phoenix_badge_earned = true;
        break;
      }
    }

    return await updateComebackQuestProgress(questId, updateData);
  } catch (error) {
    debug.error(
      'Error updating quest progress',
      error instanceof Error ? error : undefined,
    );
    return null;
  }
}
