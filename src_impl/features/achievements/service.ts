/**
 * Achievement Service
 *
 * Phase 11.3 — Achievement tracking and unlocking logic
 */

import { type Achievement, type UserAchievement, type AchievementCondition } from './types';
import { ALL_ACHIEVEMENTS, getAchievementById } from './definitions';
import * as repository from './repository';
import { eventBus } from '../../events';
import { capture } from '../../shared/analytics/analytics-service';
import { ProgressionEvents } from '../../shared/analytics/analytics-events';

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Check if unlock condition is met
 */
function checkUnlockCondition(progress: number, maxProgress: number, condition: AchievementCondition): boolean {
  switch (condition.comparator) {
    case 'EQUALS':
      return progress === condition.target;
    case 'GREATER_THAN':
      return progress >= condition.target;
    case 'LESS_THAN':
      return progress <= condition.target;
    case 'CUMULATIVE':
      return progress >= condition.target;
    default:
      return false;
  }
}

/**
 * Calculate new progress value
 */
function calculateProgress(currentProgress: number, newValue: number, condition: AchievementCondition): number {
  switch (condition.comparator) {
    case 'CUMULATIVE':
      return currentProgress + newValue;
    case 'EQUALS':
    case 'GREATER_THAN':
      // For non-cumulative, we track max value achieved
      return Math.max(currentProgress, newValue);
    case 'LESS_THAN':
      return Math.min(currentProgress, newValue);
    default:
      return currentProgress;
  }
}

// ============================================================================
// Achievement Unlocking
// ============================================================================

/**
 * Handle achievement unlock
 */
async function handleAchievementUnlock(userId: string, achievement: Achievement): Promise<void> {
  // Emit unlock event
  eventBus.publish('achievement:unlocked', {
    userId,
    achievementId: achievement.id,
    unlockedAt: Date.now(),
  });

  // Grant rewards
  await grantAchievementRewards(userId, achievement);

  // Track achievement unlocked analytics
  capture(ProgressionEvents.ACHIEVEMENT_UNLOCKED, {
    user_id: userId,
    achievement_id: achievement.id,
    achievement_name: achievement.title,
    achievement_category: achievement.category,
    achievement_tier: achievement.rarity,
  });
}

/**
 * Grant rewards for achievement unlock
 */
async function grantAchievementRewards(userId: string, achievement: Achievement): Promise<void> {
  const { reward } = achievement;

  // Grant coins
  const coins = reward.coins ?? 0;
  if (coins > 0) {
    eventBus.publish('economy:add-currency', {
      userId,
      type: 'COINS',
      amount: coins,
      source: 'ACHIEVEMENT',
    });
  }

  // Grant XP
  const xp = reward.xp ?? 0;
  if (xp > 0) {
    eventBus.publish('progression:add-xp', {
      userId,
      amount: xp,
      source: 'ACHIEVEMENT',
    });
  }

  // Grant badge
  if (reward.badge) {
    eventBus.publish('rewards:badge-granted', {
      userId,
      badgeId: reward.badge,
    });
  }

  // Grant title
  if (reward.title) {
    eventBus.publish('rewards:title-granted', {
      userId,
      titleId: reward.title,
    });
  }

  // Grant cosmetic
  if (reward.cosmetic) {
    eventBus.publish('rewards:cosmetic-unlocked', {
      userId,
      cosmeticId: reward.cosmetic,
    });
  }
}

// ============================================================================
// Query Functions
// ============================================================================
// ============================================================================
// Event Handlers
// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================
// ============================================================================
// Admin/Setup Functions
// ============================================================================
export * from "./service.part1";
export * from "./service.part2";
