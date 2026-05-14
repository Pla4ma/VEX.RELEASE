/**
 * Streak Repair Quest System
 * When a streak breaks, offer a 3-session quest to restore it
 * Creates a "second chance" that reduces churn from broken streaks
 */

import { eventBus } from '../../events';
import { v4 } from '../../utils/uuid';
import * as repository from './repository';
import type { Streak } from './schemas';

// ============================================================================
// Constants
// ============================================================================

const REPAIR_QUEST_CONFIG = {
  sessionsRequired: 3,
  timeWindowHours: 24, // Must complete all 3 sessions within 24 hours
  restoredStreakPercentage: 0.8, // Restore to 80% of previous streak (rewards effort without fully erasing consequence)
  minPreviousStreak: 3, // Only offer repair for streaks of 3+ days
} as const;

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Quest Management
// ============================================================================

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

async function completeRepairQuest(userId: string, quest: StreakRepairQuest): Promise<void> {
  // Update quest status
  await repository.updateRepairQuest(userId, quest.id, {
    status: 'COMPLETED',
    completedAt: Date.now(),
  });

  // Restore the streak
  await repository.updateStreak(userId, {
    currentDays: quest.targetRestoreDays,
    lastQualifyingSessionAt: Date.now(),
  });

  // Publish events
  (eventBus as any).publish('streak:repaired', {
    userId,
    previousStreak: quest.previousStreak,
    restoredDays: quest.targetRestoreDays,
    questId: quest.id,
  });

  // Send celebration notification
  (eventBus as any).publish('notification:send', {
    userId,
    type: 'STREAK_REPAIR_COMPLETE',
    title: '🎉 Streak Restored!',
    body: `Amazing! You restored your streak to ${quest.targetRestoreDays} days. Your dedication paid off!`,
    data: {
      restoredDays: quest.targetRestoreDays,
      previousStreak: quest.previousStreak,
    },
  });
}

async function expireRepairQuest(userId: string, questId: string): Promise<void> {
  await repository.updateRepairQuest(userId, questId, {
    status: 'EXPIRED',
  });

  (eventBus as any).publish('streak:repair_quest_expired', {
    userId,
    questId,
    daysLost: 0, // Default value for expired quests
  });
}

// ============================================================================
// Quest Status
// ============================================================================

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

// ============================================================================
// Background Job: Process Expired Quests
// ============================================================================

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
