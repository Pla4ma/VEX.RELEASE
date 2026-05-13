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
// ============================================================================
// Quest Management
// ============================================================================

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
// ============================================================================
// Background Job: Process Expired Quests
// ============================================================================
export * from "./streak-repair-quest.types";
export * from "./streak-repair-quest.part1";
export * from "./streak-repair-quest.part2";
