import { type Achievement, type UserAchievement, type AchievementCondition } from "./types";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import * as repository from "./repository";
import { eventBus } from "../../events";
import { capture } from "../../shared/analytics/analytics-service";
import { ProgressionEvents } from "../../shared/analytics/analytics-events";


export async function updateAchievementProgress(userId: string, conditionType: string, value: number, context?: Record<string, unknown>): Promise<UserAchievement[]> {
  const updatedAchievements: UserAchievement[] = [];

  // Find all achievements that match this condition type
  const relevantAchievements = ALL_ACHIEVEMENTS.filter((a) => a.unlockCondition.type === conditionType);

  for (const achievement of relevantAchievements) {
    const userAchievement = await repository.getUserAchievement(userId, achievement.id);

    if (userAchievement?.isUnlocked) {
      continue; // Already unlocked
    }

    // Check if condition is met
    const newProgress = calculateProgress(userAchievement?.progress || 0, value, achievement.unlockCondition);

    const shouldUnlock = checkUnlockCondition(newProgress, achievement.progressMax, achievement.unlockCondition);

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

export async function getAllAchievementsWithProgress(userId: string): Promise<Array<Achievement & { progress: number; isUnlocked: boolean }>> {
  const achievements = await Promise.all(
    ALL_ACHIEVEMENTS.map(async (achievement) => {
      const userAchievement = await repository.getUserAchievement(userId, achievement.id);
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
      };
    }),
  );

  return achievements;
}

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

export async function getRecentlyUnlockedAchievements(userId: string, limit: number = 5): Promise<Array<Achievement & { unlockedAt: number }>> {
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

export async function getNextAchievements(userId: string, limit: number = 3): Promise<Array<Achievement & { progress: number; remaining: number; percentComplete: number }>> {
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