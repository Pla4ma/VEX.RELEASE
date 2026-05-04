/**
 * Achievement Service
 *
 * Phase 11.3 — Achievement tracking and unlocking logic
 */

import {
  type Achievement,
  type UserAchievement,
  type AchievementCondition,
} from './types';
import {
  ALL_ACHIEVEMENTS,
  getAchievementById,
} from './definitions';
import * as repository from './repository';
import { eventBus } from '../../events';
import { capture } from '../../shared/analytics/analytics-service';
import { ProgressionEvents } from '../../shared/analytics/analytics-events';

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Update achievement progress for a user
 * Called whenever relevant actions occur (session complete, boss defeat, etc.)
 */
export async function updateAchievementProgress(
  userId: string,
  conditionType: string,
  value: number,
  context?: Record<string, unknown>
): Promise<UserAchievement[]> {
  const updatedAchievements: UserAchievement[] = [];

  // Find all achievements that match this condition type
  const relevantAchievements = ALL_ACHIEVEMENTS.filter(
    (a) => a.unlockCondition.type === conditionType
  );

  for (const achievement of relevantAchievements) {
    const userAchievement = await repository.getUserAchievement(userId, achievement.id);

    if (userAchievement?.isUnlocked) {
      continue; // Already unlocked
    }

    // Check if condition is met
    const newProgress = calculateProgress(
      userAchievement?.progress || 0,
      value,
      achievement.unlockCondition
    );

    const shouldUnlock = checkUnlockCondition(
      newProgress,
      achievement.progressMax,
      achievement.unlockCondition
    );

    // Update in repository
    const updated = await repository.updateAchievementProgress(userId, achievement.id, {
      progress: newProgress,
      isUnlocked: shouldUnlock,
      unlockedAt: shouldUnlock ? Date.now() : undefined,
    });

    if (updated) {
      updatedAchievements.push(updated);

      // If newly unlocked, emit event and grant rewards
      if (shouldUnlock && !userAchievement?.isUnlocked) {
        await handleAchievementUnlock(userId, achievement);
      }
    }
  }

  return updatedAchievements;
}

/**
 * Check if unlock condition is met
 */
function checkUnlockCondition(
  progress: number,
  maxProgress: number,
  condition: AchievementCondition
): boolean {
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
function calculateProgress(
  currentProgress: number,
  newValue: number,
  condition: AchievementCondition
): number {
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
async function handleAchievementUnlock(
  userId: string,
  achievement: Achievement
): Promise<void> {
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
async function grantAchievementRewards(
  userId: string,
  achievement: Achievement
): Promise<void> {
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

/**
 * Get all achievements with user progress
 */
export async function getAllAchievementsWithProgress(
  userId: string
): Promise<Array<Achievement & { progress: number; isUnlocked: boolean }>> {
  const achievements = await Promise.all(
    ALL_ACHIEVEMENTS.map(async (achievement) => {
      const userAchievement = await repository.getUserAchievement(userId, achievement.id);
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
      };
    })
  );

  return achievements;
}

/**
 * Get achievement stats for a user
 */
export async function getAchievementStats(userId: string): Promise<{
  total: number;
  unlocked: number;
  hiddenUnlocked: number;
  byCategory: Record<string, { total: number; unlocked: number }>;
  byTier: Record<string, { total: number; unlocked: number }>;
}> {
  const achievements = await getAllAchievementsWithProgress(userId);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const hiddenUnlocked = unlockedAchievements.filter((a) => a.isHidden).length;

  // By category
  const byCategory: Record<string, { total: number; unlocked: number }> = {};
  for (const achievement of achievements) {
    const cat = achievement.category;
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, unlocked: 0 };
    }
    byCategory[cat].total++;
    if (achievement.isUnlocked) {
      byCategory[cat].unlocked++;
    }
  }

  // By tier
  const byTier: Record<string, { total: number; unlocked: number }> = {};
  for (const achievement of achievements) {
    const tier = achievement.rarity;
    if (!byTier[tier]) {
      byTier[tier] = { total: 0, unlocked: 0 };
    }
    byTier[tier].total++;
    if (achievement.isUnlocked) {
      byTier[tier].unlocked++;
    }
  }

  return {
    total: achievements.length,
    unlocked: unlockedAchievements.length,
    hiddenUnlocked,
    byCategory,
    byTier,
  };
}

/**
 * Get recently unlocked achievements
 */
export async function getRecentlyUnlockedAchievements(
  userId: string,
  limit: number = 5
): Promise<Array<Achievement & { unlockedAt: number }>> {
  const userAchievements = await repository.getAllUserAchievements(userId);

  const unlocked = userAchievements
    .filter((ua) => ua.isUnlocked && ua.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, limit);

  return unlocked.map((ua) => {
    const achievement = getAchievementById(ua.achievementId)!;
    return {
      ...achievement,
      unlockedAt: ua.unlockedAt!,
    };
  });
}

/**
 * Get next achievable achievements (closest to unlock)
 */
export async function getNextAchievements(
  userId: string,
  limit: number = 3
): Promise<
  Array<Achievement & { progress: number; remaining: number; percentComplete: number }>
> {
  const achievements = await getAllAchievementsWithProgress(userId);

  const incomplete = achievements
    .filter((a) => !a.isUnlocked && !a.isHidden)
    .map((a) => ({
      ...a,
      remaining: a.progressMax - a.progress,
      percentComplete: Math.min(100, (a.progress / a.progressMax) * 100),
    }))
    .sort((a, b) => b.percentComplete - a.percentComplete)
    .slice(0, limit);

  return incomplete;
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Initialize achievement tracking
 * Sets up event listeners for achievement-related events
 */
export function initializeAchievementTracking(): void {
  // Session completion
  eventBus.subscribe('session:completed', async (event) => {
    const { userId, duration } = event;

    // Update session count achievements
    await updateAchievementProgress(userId, 'SESSION_COMPLETE', 1);

    // Update focus time achievements
    await updateAchievementProgress(userId, 'FOCUS_MINUTES', duration);
  });

  // Streak updates
  eventBus.subscribe('streak:updated', async (event) => {
    const { userId, state } = event;
    await updateAchievementProgress(userId, 'STREAK_DAYS', state.currentStreak);
  });

  // Boss defeat
  eventBus.subscribe('boss:defeated', async (event) => {
    const { userId, bossId } = event;
    await updateAchievementProgress(userId, 'BOSS_DEFEAT', 1);
    await updateAchievementProgress(userId, 'BOSS_DEFEAT_UNIQUE', 1, { bossId });
  });

  // Squad war results
  eventBus.subscribe('squad-war:ended', async (event) => {
    const { winner, participants } = event;
    // Award to all participants on winning side
    for (const userId of participants) {
      await updateAchievementProgress(userId, 'SQUAD_WAR_WIN', 1);
    }
  });

  // Duel results
  eventBus.subscribe('duel:completed', async (event) => {
    const { winnerId, challengerId, challengedId } = event;
    if (winnerId) {
      await updateAchievementProgress(winnerId, 'DUEL_WIN', 1);
    }
  });

  // Social events
  eventBus.subscribe('squad:joined', async (event) => {
    const { userId } = event;
    await updateAchievementProgress(userId, 'SQUAD_JOIN', 1);
  });

  eventBus.subscribe('user:recruited', async (event) => {
    const { referrerId } = event;
    await updateAchievementProgress(referrerId, 'FRIEND_RECRUIT', 1);
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Reveal a hidden achievement (for UI display after unlock)
 */
export function revealHiddenAchievement(achievementId: string): {
  name: string;
  description: string;
  icon: string;
} {
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    return { name: '???', description: 'Unknown achievement', icon: '❓' };
  }

  return {
    name: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
  };
}

/**
 * Get achievement completion percentage for a user
 */
export async function getCompletionPercentage(userId: string): Promise<number> {
  const stats = await getAchievementStats(userId);
  return (stats.unlocked / stats.total) * 100;
}

// ============================================================================
// Admin/Setup Functions
// ============================================================================

/**
 * Initialize achievements for a new user
 */
export async function initializeUserAchievements(userId: string): Promise<void> {
  for (const achievement of ALL_ACHIEVEMENTS) {
    await repository.createUserAchievement(userId, achievement.id, {
      progress: 0,
      maxProgress: achievement.progressMax,
      isUnlocked: false,
    });
  }
}

/**
 * Reset all achievements for a user (testing/admin only)
 */
export async function resetUserAchievements(userId: string): Promise<void> {
  await repository.resetAllUserAchievements(userId);
}
