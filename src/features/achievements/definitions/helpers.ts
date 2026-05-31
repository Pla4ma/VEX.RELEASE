/**
 * Achievement Helper Functions
 *
 * Utility functions for working with achievements.
 */

import type {
  Achievement,
  AchievementCategory,
  AchievementRarity,
} from '../types';
import { RARITY_CONFIG } from './rarity-config';

export function getAchievementById(
  achievements: Achievement[],
  id: string,
): Achievement | undefined {
  return achievements.find((a: Achievement) => a.id === id);
}

export function getAchievementsByCategory(
  achievements: Achievement[],
  category: AchievementCategory,
): Achievement[] {
  return achievements.filter((a: Achievement) => a.category === category);
}

export function getAchievementsByRarity(
  achievements: Achievement[],
  rarity: AchievementRarity,
): Achievement[] {
  return achievements.filter((a: Achievement) => a.rarity === rarity);
}

export function getVisibleAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements.filter((a: Achievement) => !a.isHidden);
}

export function getAchievementDisplayInfo(
  achievement: Achievement,
  isUnlocked: boolean,
): {
  title: string;
  description: string;
  icon: string;
} {
  if (achievement.isHidden && !isUnlocked) {
    return {
      title: '???',
      description:
        achievement.rarity === 'LEGENDARY'
          ? 'This achievement is rumored to exist...'
          : 'This achievement is a mystery...',
      icon: '❓',
    };
  }

  return {
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
  };
}

export function getRarityColor(rarity: AchievementRarity): string {
  return RARITY_CONFIG[rarity].color;
}

export function getRarityPoints(rarity: AchievementRarity): number {
  return RARITY_CONFIG[rarity].points;
}

export function calculateTotalAchievementPoints(
  achievements: Achievement[],
): number {
  return achievements.reduce(
    (sum: number, a: Achievement) => sum + a.pointValue,
    0,
  );
}

export function getActiveAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements.filter((a: Achievement) => !a.isDeprecated);
}

export function isBehaviorBasedAchievement(achievement: Achievement): boolean {
  return !achievement.isDeprecated && achievement.category !== 'ECONOMY';
}
