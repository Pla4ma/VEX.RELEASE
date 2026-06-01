import { eventBus } from '../../events';
import { v4 } from '../../utils/uuid';
import * as repository from './repository';
import { expireRepairQuest, completeRepairQuest } from './streak-repair-lifecycle';

export {
  expireRepairQuest,
  completeRepairQuest,
  getRepairQuestStatus,
  processExpiredRepairQuests,
} from './streak-repair-lifecycle';

const REPAIR_QUEST_CONFIG = {
  sessionsRequired: 3,
  timeWindowHours: 24,
  restoredStreakPercentage: 0.8,
  minPreviousStreak: 3,
} as const;

export interface StreakRepairQuest {
  id: string;
  userId: string;
  previousStreak: number;
  targetRestoreDays: number;
  sessionsCompleted: number;
  sessionsRequired: number;
  startedAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';
  sessionIds: string[];
  completedAt: number | null;
}

export interface RepairQuestStatus {
  hasActiveQuest: boolean;
  quest: StreakRepairQuest | null;
  progressPercent: number;
  hoursRemaining: number;
  canStartQuest: boolean;
  previousStreak: number;
  potentialRestoreDays: number;
}

export async function createRepairQuest(
  userId: string,
  previousStreak: number,
): Promise<StreakRepairQuest | null> {
  if (previousStreak < REPAIR_QUEST_CONFIG.minPreviousStreak) {
    return null;
  }
  const existingQuest = await repository.fetchActiveRepairQuest(userId);
  if (existingQuest) {
    return existingQuest;
  }
  const now = Date.now();
  const targetRestoreDays = Math.floor(
    previousStreak * REPAIR_QUEST_CONFIG.restoredStreakPercentage,
  );
  const quest: StreakRepairQuest = {
    id: v4(),
    userId,
    previousStreak,
    targetRestoreDays,
    sessionsCompleted: 0,
    sessionsRequired: REPAIR_QUEST_CONFIG.sessionsRequired,
    startedAt: now,
    expiresAt: now + REPAIR_QUEST_CONFIG.timeWindowHours * 60 * 60 * 1000,
    status: 'ACTIVE' as const,
    sessionIds: [],
    completedAt: null,
  };
  await repository.saveRepairQuest(quest);
  eventBus.publish('streak:repair_quest_created', {
    userId,
    questId: quest.id,
    daysToRecover: targetRestoreDays,
    deadline: quest.expiresAt,
  });
  eventBus.publish('notification:send', {
    userId,
    type: 'STREAK_REPAIR_QUEST',
    title: '🔥 Streak Repair Quest Started!',
    body: `Complete 3 sessions in 24h to restore your ${previousStreak}-day streak to ${targetRestoreDays} days!`,
    data: { questId: quest.id, action: 'VIEW_REPAIR_QUEST' },
  });
  return quest;
}

export async function recordRepairQuestSession(
  userId: string,
  sessionId: string,
  sessionDuration: number,
  qualityScore: number,
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
  if (Date.now() > quest.expiresAt) {
    await expireRepairQuest(userId, quest.id);
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }
  const minDuration = 10 * 60;
  const minQuality = 60;
  if (sessionDuration < minDuration || qualityScore < minQuality) {
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }
  if (quest.sessionIds.includes(sessionId)) {
    return {
      questUpdated: false,
      questCompleted: false,
      streakRestored: false,
      restoredToDays: 0,
    };
  }
  const updatedSessions = [...quest.sessionIds, sessionId];
  const sessionsCompleted = updatedSessions.length;
  await repository.updateRepairQuest(userId, quest.id, {
    sessionsCompleted,
    sessionIds: updatedSessions,
  });
  if (sessionsCompleted >= REPAIR_QUEST_CONFIG.sessionsRequired) {
    await completeRepairQuest(userId, quest);
    return {
      questUpdated: true,
      questCompleted: true,
      streakRestored: true,
      restoredToDays: quest.targetRestoreDays,
    };
  }
  const remainingSessions =
    REPAIR_QUEST_CONFIG.sessionsRequired - sessionsCompleted;
  eventBus.publish('notification:send', {
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
