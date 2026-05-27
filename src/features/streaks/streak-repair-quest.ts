import { eventBus } from "../../events";
import { v4 } from "../../utils/uuid";
import * as repository from "./repository";
import type { Streak } from "./schemas";
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
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "ABANDONED";
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
    status: "ACTIVE" as const,
    sessionIds: [],
    completedAt: null,
  };
  await repository.saveRepairQuest(quest);
  eventBus.publish("streak:repair_quest_created", {
    userId,
    questId: quest.id,
    daysToRecover: targetRestoreDays,
    deadline: quest.expiresAt,
  });
  eventBus.publish("notification:send", {
    userId,
    type: "STREAK_REPAIR_QUEST",
    title: "🔥 Streak Repair Quest Started!",
    body: `Complete 3 sessions in 24h to restore your ${previousStreak}-day streak to ${targetRestoreDays} days!`,
    data: { questId: quest.id, action: "VIEW_REPAIR_QUEST" },
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
  if (!quest || quest.status !== "ACTIVE") {
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
  eventBus.publish("notification:send", {
    userId,
    type: "STREAK_REPAIR_PROGRESS",
    title: `🔥 Repair Quest: ${sessionsCompleted}/3 Complete`,
    body: `${remainingSessions} more session${remainingSessions === 1 ? "" : "s"} to restore your streak!`,
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
async function completeRepairQuest(
  userId: string,
  quest: StreakRepairQuest,
): Promise<void> {
  await repository.updateRepairQuest(userId, quest.id, {
    status: "COMPLETED",
    completedAt: Date.now(),
  });
  await repository.updateStreak(userId, {
    currentDays: quest.targetRestoreDays,
    lastQualifyingSessionAt: Date.now(),
  });
  eventBus.publish("streak:repaired", {
    userId,
    questId: quest.id,
    daysRecovered: quest.targetRestoreDays,
  });
  eventBus.publish("notification:send", {
    userId,
    type: "STREAK_REPAIR_COMPLETE",
    title: "🎉 Streak Restored!",
    body: `Amazing! You restored your streak to ${quest.targetRestoreDays} days. Your dedication paid off!`,
    data: {
      restoredDays: quest.targetRestoreDays,
      previousStreak: quest.previousStreak,
    },
  });
}
async function expireRepairQuest(
  userId: string,
  questId: string,
): Promise<void> {
  await repository.updateRepairQuest(userId, questId, { status: "EXPIRED" });
  eventBus.publish("streak:repair_quest_expired", {
    userId,
    questId,
    daysLost: 0,
  });
}
export async function getRepairQuestStatus(
  userId: string,
): Promise<RepairQuestStatus> {
  const streak = await repository.fetchStreak(userId);
  const quest = await repository.fetchActiveRepairQuest(userId);
  if (!quest) {
    const canStart =
      streak !== null &&
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
        ? Math.floor(
            (streak?.longestDays || 0) *
              REPAIR_QUEST_CONFIG.restoredStreakPercentage,
          )
        : 0,
    };
  }
  const hoursRemaining = Math.max(
    0,
    (quest.expiresAt - Date.now()) / (60 * 60 * 1000),
  );
  const progressPercent =
    (quest.sessionsCompleted / REPAIR_QUEST_CONFIG.sessionsRequired) * 100;
  return {
    hasActiveQuest: true,
    quest,
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
    if (quest.status === "ACTIVE" && Date.now() > quest.expiresAt) {
      await expireRepairQuest(quest.userId, quest.id);
      processedUserIds.push(quest.userId);
      eventBus.publish("notification:send", {
        userId: quest.userId,
        type: "STREAK_REPAIR_EXPIRED",
        title: "Streak Repair Quest Expired",
        body: "Don't worry! Every expert was once a beginner. Start a new streak today!",
        data: {
          previousStreak: quest.previousStreak,
          action: "START_NEW_STREAK",
        },
      });
    }
  }
  return processedUserIds;
}
