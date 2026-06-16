import { eventBus } from '../../events/EventBus';
import { awardInsurance } from '../streaks/StreakEvolutionSystem';
import type { Achievement, AchievementCategory } from './types';
import type { FeatureUnlock } from './feature-unlocks';
import {
  STUDY_ACHIEVEMENTS,
} from './study-achievements';
import {
  BOSS_PHASE3_ACHIEVEMENTS,
  STREAK_EVOLUTION_ACHIEVEMENTS,
} from './boss-streak-achievements';
import { ACHIEVEMENT_FEATURE_UNLOCKS } from './feature-unlocks';

export interface ProgressionGuide {
  currentAchievement: Achievement | null;
  nextAchievement: Achievement | null;
  nearbyAchievements: Achievement[];
  categoryProgress: Record<AchievementCategory, number>;
  totalPoints: number;
  nextUnlock: FeatureUnlock | null;
}

const ALL_CATEGORIES: AchievementCategory[] = [
  'STUDY',
  'BOSS',
  'STREAK',
  'SESSION',
  'SOCIAL',
];

const ALL_ACHIEVEMENTS = [
  ...STUDY_ACHIEVEMENTS,
  ...BOSS_PHASE3_ACHIEVEMENTS,
  ...STREAK_EVOLUTION_ACHIEVEMENTS,
];

export function getProgressionGuide(
  unlockedIds: string[],
  inProgressAchievements: Array<{ id: string; progress: number }>,
): ProgressionGuide {
  const currentAchievement =
    unlockedIds.length > 0
      ? ALL_ACHIEVEMENTS.find(
          (a) => a.id === unlockedIds[unlockedIds.length - 1],
        ) || null
      : null;
  const lockedAchievements = ALL_ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id),
  );
  const inProgressLocked = lockedAchievements
    .map((a) => {
      const progress = inProgressAchievements.find((p) => p.id === a.id);
      return {
        achievement: a,
        progress: progress?.progress || 0,
        percent:
          a.progressMax > 0
            ? ((progress?.progress || 0) / a.progressMax) * 100
            : 0,
      };
    })
    .sort((a, b) => b.percent - a.percent);
  const nextAchievement =
    inProgressLocked[0]?.achievement || lockedAchievements[0] || null;
  const nearbyAchievements = inProgressLocked
    .slice(0, 5)
    .map((a) => a.achievement);
  const categoryProgress: Record<string, number> = {};
  const unlockedIdSet = new Set(unlockedIds);
  for (const category of ALL_CATEGORIES) {
    const categoryAchievements = ALL_ACHIEVEMENTS.filter(
      (a) => a.category === category,
    );
    const unlockedInCategory = categoryAchievements.filter((a) =>
      unlockedIdSet.has(a.id),
    );
    categoryProgress[category] =
      categoryAchievements.length > 0
        ? (unlockedInCategory.length / categoryAchievements.length) * 100
        : 0;
  }
  const totalPoints = unlockedIds.reduce((sum, id) => {
    const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
    return sum + (achievement?.pointValue || 0);
  }, 0);
  const nextUnlock =
    ACHIEVEMENT_FEATURE_UNLOCKS.find(
      (u) => !unlockedIds.includes(u.achievementId),
    ) || null;
  return {
    currentAchievement,
    nextAchievement,
    nearbyAchievements,
    categoryProgress,
    totalPoints,
    nextUnlock,
  };
}

export function handleAchievementUnlock(
  userId: string,
  achievement: Achievement,
): { unlocked: boolean; features: FeatureUnlock[] } {
  const features = ACHIEVEMENT_FEATURE_UNLOCKS.filter(
    (f) => f.achievementId === achievement.id,
  );
  if (achievement.id === 'achievement-7-day-streak') {
    awardInsurance(userId, 'MILESTONE_7', 1);
  } else if (achievement.id === 'achievement-30-day-streak') {
    awardInsurance(userId, 'MILESTONE_30', 1);
  } else if (achievement.id === 'achievement-100-day-streak') {
    awardInsurance(userId, 'MILESTONE_100', 1);
  }
  eventBus.publish('achievement:unlocked', {
    userId,
    achievementId: achievement.id,
    unlockedAt: Date.now(),
  });
  return { unlocked: true, features };
}

export function hasUnlockedFeature(
  userUnlockedAchievements: string[],
  featureId: string,
): boolean {
  const feature = ACHIEVEMENT_FEATURE_UNLOCKS.find(
    (f) => f.featureId === featureId,
  );
  if (!feature) {
    return false;
  }
  return userUnlockedAchievements.includes(feature.achievementId);
}

export function getUnlockedFeatures(
  userUnlockedAchievements: string[],
): FeatureUnlock[] {
  return ACHIEVEMENT_FEATURE_UNLOCKS.filter((f) =>
    userUnlockedAchievements.includes(f.achievementId),
  );
}

export function getNextMilestoneDays(currentStreak: number): number {
  const milestones = [3, 7, 14, 30, 100];
  return milestones.find((m) => m > currentStreak) || 100;
}

export function getAchievementPreview(
  achievement: Achievement,
  isUnlocked: boolean,
): {
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
} {
  if (achievement.isHidden && !isUnlocked) {
    return {
      title: '???',
      description: 'This achievement is a mystery...',
      icon: '❓',
      category: 'HIDDEN',
      rarity: 'UNKNOWN',
    };
  }
  return {
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    category: achievement.category,
    rarity: achievement.rarity,
  };
}
