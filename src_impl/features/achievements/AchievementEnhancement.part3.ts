import { eventBus } from "../../events";
import { awardInsurance } from "../streaks/StreakEvolutionSystem";
import type { Achievement, AchievementCategory, AchievementRarity } from "./types";


export function getProgressionGuide(unlockedIds: string[], inProgressAchievements: Array<{ id: string; progress: number }>): ProgressionGuide {
  const allAchievements = [...STUDY_ACHIEVEMENTS, ...BOSS_PHASE3_ACHIEVEMENTS, ...STREAK_EVOLUTION_ACHIEVEMENTS];

  // Find current (most recent) achievement
  const currentAchievement = unlockedIds.length > 0 ? allAchievements.find((a) => a.id === unlockedIds[unlockedIds.length - 1]) || null : null;

  // Find next logical achievement (not unlocked, closest to completion)
  const lockedAchievements = allAchievements.filter((a) => !unlockedIds.includes(a.id));
  const inProgressLocked = lockedAchievements
    .map((a) => {
      const progress = inProgressAchievements.find((p) => p.id === a.id);
      return {
        achievement: a,
        progress: progress?.progress || 0,
        percent: a.progressMax > 0 ? ((progress?.progress || 0) / a.progressMax) * 100 : 0,
      };
    })
    .sort((a, b) => b.percent - a.percent);

  const nextAchievement = inProgressLocked[0]?.achievement || lockedAchievements[0] || null;

  // Find nearby achievements (3-5 closest to unlock)
  const nearbyAchievements = inProgressLocked.slice(0, 5).map((a) => a.achievement);

  // Calculate category progress
  const categoryProgress: Record<string, number> = {};
  for (const category of ['STUDY', 'BOSS', 'STREAK', 'SESSION', 'SOCIAL'] as AchievementCategory[]) {
    const categoryAchievements = allAchievements.filter((a) => a.category === category);
    const unlockedInCategory = categoryAchievements.filter((a) => unlockedIds.includes(a.id)).length;
    categoryProgress[category] = categoryAchievements.length > 0 ? (unlockedInCategory / categoryAchievements.length) * 100 : 0;
  }

  // Calculate total points
  const totalPoints = unlockedIds.reduce((sum, id) => {
    const achievement = allAchievements.find((a) => a.id === id);
    return sum + (achievement?.pointValue || 0);
  }, 0);

  // Find next feature unlock
  const nextUnlock = ACHIEVEMENT_FEATURE_UNLOCKS.find((u) => !unlockedIds.includes(u.achievementId)) || null;

  return {
    currentAchievement,
    nextAchievement,
    nearbyAchievements,
    categoryProgress,
    totalPoints,
    nextUnlock,
  };
}

export function handleAchievementUnlock(userId: string, achievement: Achievement): { unlocked: boolean; features: FeatureUnlock[] } {
  // Find associated feature unlocks
  const features = ACHIEVEMENT_FEATURE_UNLOCKS.filter((f) => f.achievementId === achievement.id);

  // Award milestone insurance automatically
  if (achievement.id === 'achievement-7-day-streak') {
    awardInsurance(userId, 'MILESTONE_7', 1);
  } else if (achievement.id === 'achievement-30-day-streak') {
    awardInsurance(userId, 'MILESTONE_30', 1);
  } else if (achievement.id === 'achievement-100-day-streak') {
    awardInsurance(userId, 'MILESTONE_100', 1);
  }

  // Publish event
  eventBus.publish('achievement:unlocked', {
    userId,
    achievementId: achievement.id,
    unlockedAt: Date.now(),
  });

  return { unlocked: true, features };
}

export function hasUnlockedFeature(userUnlockedAchievements: string[], featureId: string): boolean {
  const feature = ACHIEVEMENT_FEATURE_UNLOCKS.find((f) => f.featureId === featureId);
  if (!feature) {
    return false;
  }
  return userUnlockedAchievements.includes(feature.achievementId);
}

export function getUnlockedFeatures(userUnlockedAchievements: string[]): FeatureUnlock[] {
  return ACHIEVEMENT_FEATURE_UNLOCKS.filter((f) => userUnlockedAchievements.includes(f.achievementId));
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