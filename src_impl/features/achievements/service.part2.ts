import { type Achievement, type UserAchievement, type AchievementCondition } from "./types";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import * as repository from "./repository";
import { eventBus } from "../../events";
import { capture } from "../../shared/analytics/analytics-service";
import { ProgressionEvents } from "../../shared/analytics/analytics-events";


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

export async function getCompletionPercentage(userId: string): Promise<number> {
  const stats = await getAchievementStats(userId);
  return (stats.unlocked / stats.total) * 100;
}

export async function initializeUserAchievements(userId: string): Promise<void> {
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