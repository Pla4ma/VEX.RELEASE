import { eventBus } from '../../events/EventBus';
import * as repository from './repository';
import type { StreakRepairQuest, RepairQuestStatus } from './streak-repair-quest';

const MIN_PREVIOUS_STREAK = 3;
const RESTORED_STREAK_PERCENTAGE = 0.8;
const SESSIONS_REQUIRED = 3;

export async function completeRepairQuest(
  userId: string,
  quest: StreakRepairQuest,
): Promise<void> {
  await repository.updateRepairQuest(userId, quest.id, {
    status: 'COMPLETED',
    completedAt: Date.now(),
  });
  await repository.updateStreak(userId, {
    currentDays: quest.targetRestoreDays,
    lastQualifyingSessionAt: Date.now(),
  });
  eventBus.publish('streak:repaired', {
    userId,
    questId: quest.id,
    daysRecovered: quest.targetRestoreDays,
  });
  eventBus.publish('notification:send', {
    userId,
    type: 'STREAK_REPAIR_COMPLETE',
    title: 'Streak Restored',
    body: `Amazing! You restored your streak to ${quest.targetRestoreDays} days. Your dedication paid off!`,
    data: {
      restoredDays: quest.targetRestoreDays,
      previousStreak: quest.previousStreak,
    },
  });
}

export async function expireRepairQuest(
  userId: string,
  questId: string,
): Promise<void> {
  await repository.updateRepairQuest(userId, questId, { status: 'EXPIRED' });
  eventBus.publish('streak:repair_quest_expired', {
    userId,
    questId,
    daysLost: 0,
  });
}

export async function getRepairQuestStatus(
  userId: string,
): Promise<RepairQuestStatus> {
  const [streak, quest] = await Promise.all([
    repository.fetchStreak(userId),
    repository.fetchActiveRepairQuest(userId),
  ]);
  if (!quest) {
    const canStart =
      streak !== null &&
      streak.currentDays === 0 &&
      streak.longestDays >= MIN_PREVIOUS_STREAK;
    return {
      hasActiveQuest: false,
      quest: null,
      progressPercent: 0,
      hoursRemaining: 0,
      canStartQuest: canStart,
      previousStreak: streak?.longestDays || 0,
      potentialRestoreDays: canStart
        ? Math.floor(
            (streak?.longestDays || 0) * RESTORED_STREAK_PERCENTAGE,
          )
        : 0,
    };
  }
  const hoursRemaining = Math.max(
    0,
    (quest.expiresAt - Date.now()) / (60 * 60 * 1000),
  );
  const progressPercent =
    (quest.sessionsCompleted / SESSIONS_REQUIRED) * 100;
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
    if (quest.status === 'ACTIVE' && Date.now() > quest.expiresAt) {
      await expireRepairQuest(quest.userId, quest.id);
      processedUserIds.push(quest.userId);
      eventBus.publish('notification:send', {
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
