import { type Achievement } from "./types";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import * as repository from "./repository";

export async function getAllAchievementsWithProgress(
  userId: string,
): Promise<Array<Achievement & { progress: number; isUnlocked: boolean }>> {
  const achievements = await Promise.all(
    ALL_ACHIEVEMENTS.map(async (achievement) => {
      const userAchievement = await repository.getUserAchievement(
        userId,
        achievement.id,
      );
      return {
        ...achievement,
        progress: userAchievement?.progress || 0,
        isUnlocked: userAchievement?.isUnlocked || false,
      };
    }),
  );
  return achievements;
}

export async function getAchievementStats(
  userId: string,
): Promise<{
  total: number;
  unlocked: number;
  hiddenUnlocked: number;
  byCategory: Record<string, { total: number; unlocked: number }>;
  byTier: Record<string, { total: number; unlocked: number }>;
}> {
  const achievements = await getAllAchievementsWithProgress(userId);
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const hiddenUnlocked = unlockedAchievements.filter((a) => a.isHidden).length;
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

export async function getRecentlyUnlockedAchievements(
  userId: string,
  limit: number = 5,
): Promise<Array<Achievement & { unlockedAt: number }>> {
  const userAchievements = await repository.getAllUserAchievements(userId);
  const unlocked = userAchievements
    .filter((ua) => ua.isUnlocked && ua.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, limit);
  return unlocked.map((ua) => {
    const achievement = getAchievementById(ua.achievementId)!;
    return { ...achievement, unlockedAt: ua.unlockedAt! };
  });
}

export async function getNextAchievements(
  userId: string,
  limit: number = 3,
): Promise<
  Array<
    Achievement & {
      progress: number;
      remaining: number;
      percentComplete: number;
    }
  >
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

export function revealHiddenAchievement(achievementId: string): {
  name: string;
  description: string;
  icon: string;
} {
  const achievement = getAchievementById(achievementId);
  if (!achievement) {
    return { name: "???", description: "Unknown achievement", icon: "❓" };
  }
  return {
    name: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
  };
}

export async function getCompletionPercentage(userId: string): Promise<number> {
  const stats = await getAchievementStats(userId);
  return (stats.unlocked / stats.total) * 100;
}

export async function initializeUserAchievements(
  userId: string,
): Promise<void> {
  for (const achievement of ALL_ACHIEVEMENTS) {
    await repository.createUserAchievement(userId, achievement.id, {
      progress: 0,
      maxProgress: achievement.progressMax,
      isUnlocked: false,
    });
  }
}

export async function resetUserAchievements(userId: string): Promise<void> {
  await repository.resetAllUserAchievements(userId);
}
