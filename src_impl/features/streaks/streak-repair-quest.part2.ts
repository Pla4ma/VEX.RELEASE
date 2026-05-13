import { eventBus } from "../../events";
import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import type { Streak } from "./schemas";


export async function getRepairQuestStatus(userId: string): Promise<RepairQuestStatus> {
  const streak = await repository.fetchStreak(userId);
  const quest = await repository.fetchActiveRepairQuest(userId);

  if (!quest) {
    // Check if user just broke a streak and can start a quest
    const canStart = streak !== null &&
                     streak.currentDays === 0 &&
                     streak.longestDays >= REPAIR_QUEST_CONFIG.minPreviousStreak;

    return {
      hasActiveQuest: false,
      quest: null,
      progressPercent: 0,
      hoursRemaining: 0,
      canStartQuest: canStart,
      previousStreak: streak?.longestDays || 0,
      potentialRestoreDays: canStart
        ? Math.floor((streak?.longestDays || 0) * REPAIR_QUEST_CONFIG.restoredStreakPercentage)
        : 0,
    };
  }

  const hoursRemaining = Math.max(0, (quest.expiresAt - Date.now()) / (60 * 60 * 1000));
  const progressPercent = (quest.sessionsCompleted / REPAIR_QUEST_CONFIG.sessionsRequired) * 100;

  return {
    hasActiveQuest: true,
    quest: quest as any,
    progressPercent,
    hoursRemaining,
    canStartQuest: false,
    previousStreak: quest.previousStreak,
    potentialRestoreDays: quest.targetRestoreDays,
  };
}

export async function processExpiredRepairQuests(): Promise<string[]> {
  const expiredQuests = await repository.fetchExpiredRepairQuests();
  const processedUserIds: string[] = [];

  for (const quest of expiredQuests) {
    if (quest.status === 'ACTIVE' && Date.now() > quest.expiresAt) {
      await expireRepairQuest(quest.userId, quest.id);
      processedUserIds.push(quest.userId);

      // Send "quest failed" notification with encouragement
      (eventBus as any).publish('notification:send', {
        userId: quest.userId,
        type: 'STREAK_REPAIR_EXPIRED',
        title: 'Streak Repair Quest Expired',
        body: "Don't worry! Every expert was once a beginner. Start a new streak today!",
        data: {
          previousStreak: quest.previousStreak,
          action: 'START_NEW_STREAK',
        },
      });
    }
  }

  return processedUserIds;
}