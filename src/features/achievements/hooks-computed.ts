import type { AchievementCategory, AchievementRarity } from "./types";
import {
  useAchievements,
  type UseAchievementsResult,
} from "./hooks";

export function useAchievementsByCategory(
  userId: string,
  category: AchievementCategory,
): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);
  const filteredData = data?.filter((a) => a.category === category) ?? null;
  return { data: filteredData, error, isLoading, isError };
}
export function useAchievementsByRarity(
  userId: string,
  rarity: AchievementRarity,
): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);
  const filteredData = data?.filter((a) => a.rarity === rarity) ?? null;
  return { data: filteredData, error, isLoading, isError };
}
export function useUnlockedAchievements(userId: string): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);
  const unlockedData = data?.filter((a) => a.isUnlocked) ?? null;
  return { data: unlockedData, error, isLoading, isError };
}
export function useLockedAchievements(userId: string): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);
  const lockedData = data?.filter((a) => !a.isUnlocked) ?? null;
  return { data: lockedData, error, isLoading, isError };
}
export function useAchievementStats(userId: string): {
  data: {
    total: number;
    unlocked: number;
    locked: number;
    completionPercentage: number;
    totalPoints: number;
    pointsEarned: number;
    byCategory: Record<
      AchievementCategory,
      { total: number; unlocked: number }
    >;
    byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
  } | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, error, isLoading, isError } = useAchievements(userId);
  if (!data) {
    return { data: null, error, isLoading, isError };
  }
  const total = data.length;
  const unlocked = data.filter((a) => a.isUnlocked).length;
  const locked = total - unlocked;
  const completionPercentage = Math.round((unlocked / total) * 100);
  const totalPoints = data.reduce((sum, a) => sum + a.pointValue, 0);
  const pointsEarned = data
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.pointValue, 0);
  const categories: AchievementCategory[] = [
    "SESSION",
    "STREAK",
    "BOSS",
    "SOCIAL",
    "PROGRESSION",
    "ECONOMY",
  ];
  const byCategory: Record<
    AchievementCategory,
    { total: number; unlocked: number }
  > = categories.reduce(
    (acc, cat) => {
      const catAchievements = data.filter((a) => a.category === cat);
      acc[cat] = {
        total: catAchievements.length,
        unlocked: catAchievements.filter((a) => a.isUnlocked).length,
      };
      return acc;
    },
    {} as Record<AchievementCategory, { total: number; unlocked: number }>,
  );
  const rarities: AchievementRarity[] = [
    "COMMON",
    "UNCOMMON",
    "RARE",
    "EPIC",
    "LEGENDARY",
  ];
  const byRarity: Record<
    AchievementRarity,
    { total: number; unlocked: number }
  > = rarities.reduce(
    (acc, rarity) => {
      const rarityAchievements = data.filter((a) => a.rarity === rarity);
      acc[rarity] = {
        total: rarityAchievements.length,
        unlocked: rarityAchievements.filter((a) => a.isUnlocked).length,
      };
      return acc;
    },
    {} as Record<AchievementRarity, { total: number; unlocked: number }>,
  );
  return {
    data: {
      total,
      unlocked,
      locked,
      completionPercentage,
      totalPoints,
      pointsEarned,
      byCategory,
      byRarity,
    },
    error,
    isLoading,
    isError,
  };
}
