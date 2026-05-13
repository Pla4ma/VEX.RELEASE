import { eventBus } from "../../events";
import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import type { Streak } from "./schemas";


export async function createRepairQuest(
  userId: string,
  previousStreak: number
): Promise<StreakRepairQuest | null> {
  if (previousStreak < REPAIR_QUEST_CONFIG.minPreviousStreak) {
    return null; // Don't offer repair for short streaks
  }

  const existingQuest = await repository.fetchActiveRepairQuest(userId);
  if (existingQuest) {
    return existingQuest as any; // Don't create duplicate
  }

  const now = Date.now();
  const targetRestoreDays = Math.floor(previousStreak * REPAIR_QUEST_CONFIG.restoredStreakPercentage);

  const quest: StreakRepairQuest = {
    id: v4(),
    userId,
    previousStreak,
    targetRestoreDays,
    sessionsCompleted: 0,
    sessionsRequired: REPAIR_QUEST_CONFIG.sessionsRequired,
    startedAt: now,
    expiresAt: now + REPAIR_QUEST_CONFIG.timeWindowHours * 60 * 60 * 1000,
    status: 'ACTIVE',
    sessionIds: [],
  };

  await repository.saveRepairQuest(quest);

  // Publish event for notifications
  (eventBus as any).publish('streak:repair_quest_started', {
    userId,
    questId: quest.id,
    previousStreak,
    targetRestoreDays,
    sessionsRequired: REPAIR_QUEST_CONFIG.sessionsRequired,
  });

  // Send notification
  (eventBus as any).publish('notification:send', {
    userId,
    type: 'STREAK_REPAIR_QUEST',
    title: '🔥 Streak Repair Quest Started!',
    body: `Complete 3 sessions in 24h to restore your ${previousStreak}-day streak to ${targetRestoreDays} days!`,
    data: {
      questId: quest.id,
      action: 'VIEW_REPAIR_QUEST',
    },
  });

  return quest;
}

export async function recordRepairQuestSession(
  userId: string,
  sessionId: string,
  sessionDuration: number,
  qualityScore: number
): Promise<{
  questUpdated: boolean;
  questCompleted: boolean;
  streakRestored: boolean;
  restoredToDays: number;
}> {
  const quest = await repository.fetchActiveRepairQuest(userId);

  if (!quest || quest.status !== 'ACTIVE') {
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }

  // Check if quest expired
  if (Date.now() > quest.expiresAt) {
    await expireRepairQuest(userId, quest.id);
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }

  // Validate session quality (must be good enough)
  const minDuration = 10 * 60; // 10 minutes
  const minQuality = 60; // Slightly higher than normal

  if (sessionDuration < minDuration || qualityScore < minQuality) {
    // Session doesn't count toward repair
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }

  // Check for duplicate session
  if (quest.sessionIds.includes(sessionId)) {
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }

  // Update quest progress
  const updatedSessions = [...quest.sessionIds, sessionId];
  const sessionsCompleted = updatedSessions.length;

  await repository.updateRepairQuest(userId, quest.id, {
    sessionsCompleted,
    sessionIds: updatedSessions,
  });

  // Check if quest completed
  if (sessionsCompleted >= REPAIR_QUEST_CONFIG.sessionsRequired) {
    await (completeRepairQuest as any)(userId, quest);
    return {
      questUpdated: true,
      questCompleted: true,
      streakRestored: true,
      restoredToDays: quest.targetRestoreDays,
    };
  }

  // Send progress notification
  const remainingSessions = REPAIR_QUEST_CONFIG.sessionsRequired - sessionsCompleted;
  (eventBus as any).publish('notification:send', {
    userId,
    type: 'STREAK_REPAIR_PROGRESS',
    title: `🔥 Repair Quest: ${sessionsCompleted}/3 Complete`,
    body: `${remainingSessions} more session${remainingSessions === 1 ? '' : 's'} to restore your streak!`,
    data: {
      questId: quest.id,
      sessionsCompleted,
      sessionsRequired: REPAIR_QUEST_CONFIG.sessionsRequired,
    },
  });

  return {
    questUpdated: true,
    questCompleted: false,
    streakRestored: false,
    restoredToDays: 0,
  };
}