/**
 * Achievement Hooks
 *
 * TanStack Query hooks for achievement data:
 * - useAchievements(userId): All achievements with unlock status
 * - useAchievementProgress(userId, achievementId): Single achievement progress
 * - useRecentUnlocks(userId): Last 10 unlocked achievements
 */

import { useQuery } from "@tanstack/react-query";
import type { Achievement, AchievementCategory, AchievementRarity, UserAchievement } from "./types";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import * as repository from "./repository";

// ============================================================================
// Query Keys
// ============================================================================

export const achievementKeys = {
  all: ["achievements"] as const,
  byUser: (userId: string) => [...achievementKeys.all, "user", userId] as const,
  list: (userId: string) => [...achievementKeys.byUser(userId), "list"] as const,
  detail: (userId: string, achievementId: string) => [...achievementKeys.byUser(userId), "detail", achievementId] as const,
  recent: (userId: string) => [...achievementKeys.byUser(userId), "recent"] as const,
  stats: (userId: string) => [...achievementKeys.byUser(userId), "stats"] as const,
};

// ============================================================================
// Types for Hook Returns
// ============================================================================

interface AchievementWithStatus extends Achievement {
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  completionPercentage: number;
}

interface UseAchievementsResult {
  data: AchievementWithStatus[] | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
}

interface UseAchievementProgressResult {
  data: {
    achievement: Achievement;
    progress: number;
    isUnlocked: boolean;
    unlockedAt?: number;
    completionPercentage: number;
  } | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
}

interface UseRecentUnlocksResult {
  data: Array<{
    achievement: Achievement;
    unlockedAt: number;
  }> | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
}

async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  return repository.getAllUserAchievements(userId);
}

// ============================================================================
// Hook: useAchievements
// ============================================================================

/**
 * Returns all achievements with unlock status, rarity, and category
 * Uses TanStack Query with 5 minute stale time
 */
export function useAchievements(userId: string): UseAchievementsResult {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: achievementKeys.list(userId),
    queryFn: async () => {
      try {
        // Fetch user's achievement progress from backend
        const userAchievements = await fetchUserAchievements(userId);

        // Merge with all achievement definitions
        const achievementsWithStatus: AchievementWithStatus[] = ALL_ACHIEVEMENTS.map((achievement) => {
          const userProgress = userAchievements.find((ua) => ua.achievementId === achievement.id);

          const progress = userProgress?.progress ?? 0;
          const isUnlocked = userProgress?.isUnlocked ?? false;
          const completionPercentage = Math.min(100, Math.round((progress / achievement.progressMax) * 100));

          return {
            ...achievement,
            progress,
            isUnlocked,
            unlockedAt: userProgress?.unlockedAt,
            completionPercentage,
          };
        });

        return achievementsWithStatus;
      } catch (err) {
        // Graceful error - return data: null, error: Error
        throw err instanceof Error ? err : new Error("Failed to fetch achievements");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes as specified
    retry: 1,
    enabled: !!userId,
  });

  return {
    data: data ?? null,
    error: error instanceof Error ? error : null,
    isLoading,
    isError,
  };
}

// ============================================================================
// Hook: useAchievementProgress
// ============================================================================

/**
 * Returns progress toward a specific achievement
 * Uses TanStack Query with 5 minute stale time
 */
export function useAchievementProgress(userId: string, achievementId: string): UseAchievementProgressResult {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: achievementKeys.detail(userId, achievementId),
    queryFn: async () => {
      try {
        const achievement = getAchievementById(achievementId);
        if (!achievement) {
          throw new Error(`Achievement ${achievementId} not found`);
        }

        // Fetch specific achievement progress
        const userAchievements = await fetchUserAchievements(userId);
        const userProgress = userAchievements.find((ua) => ua.achievementId === achievementId);

        const progress = userProgress?.progress ?? 0;
        const isUnlocked = userProgress?.isUnlocked ?? false;
        const completionPercentage = Math.min(100, Math.round((progress / achievement.progressMax) * 100));

        return {
          achievement,
          progress,
          isUnlocked,
          unlockedAt: userProgress?.unlockedAt,
          completionPercentage,
        };
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to fetch achievement progress");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId && !!achievementId,
  });

  return {
    data: data ?? null,
    error: error instanceof Error ? error : null,
    isLoading,
    isError,
  };
}

// ============================================================================
// Hook: useRecentUnlocks
// ============================================================================

/**
 * Returns last 10 unlocked achievements (for notifications/feed)
 * Uses TanStack Query with shorter stale time (2 minutes) for fresher data
 */
export function useRecentUnlocks(userId: string): UseRecentUnlocksResult {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: achievementKeys.recent(userId),
    queryFn: async () => {
      try {
        // Fetch user achievements
        const userAchievements = await fetchUserAchievements(userId);

        // Filter to only unlocked, sort by unlock time (most recent first)
        const unlocked = userAchievements
          .filter((ua) => ua.isUnlocked && ua.unlockedAt)
          .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
          .slice(0, 10); // Last 10

        // Merge with achievement definitions
        const recentUnlocks = unlocked
          .map((ua) => {
            const achievement = getAchievementById(ua.achievementId);
            if (!achievement) {
              return null;
            }
            return {
              achievement,
              unlockedAt: ua.unlockedAt!,
            };
          })
          .filter(Boolean) as Array<{
          achievement: Achievement;
          unlockedAt: number;
        }>;

        return recentUnlocks;
      } catch (err) {
        throw err instanceof Error ? err : new Error("Failed to fetch recent unlocks");
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
    retry: 1,
    enabled: !!userId,
  });

  return {
    data: data ?? null,
    error: error instanceof Error ? error : null,
    isLoading,
    isError,
  };
}

// ============================================================================
// Additional Utility Hooks
// ============================================================================

/**
 * Get achievements by category
 */
export function useAchievementsByCategory(userId: string, category: AchievementCategory): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);

  const filteredData = data?.filter((a) => a.category === category) ?? null;

  return {
    data: filteredData,
    error,
    isLoading,
    isError,
  };
}

/**
 * Get achievements by rarity
 */
export function useAchievementsByRarity(userId: string, rarity: AchievementRarity): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);

  const filteredData = data?.filter((a) => a.rarity === rarity) ?? null;

  return {
    data: filteredData,
    error,
    isLoading,
    isError,
  };
}

/**
 * Get unlocked achievements only
 */
export function useUnlockedAchievements(userId: string): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);

  const unlockedData = data?.filter((a) => a.isUnlocked) ?? null;

  return {
    data: unlockedData,
    error,
    isLoading,
    isError,
  };
}

/**
 * Get locked achievements only
 */
export function useLockedAchievements(userId: string): UseAchievementsResult {
  const { data, error, isLoading, isError } = useAchievements(userId);

  const lockedData = data?.filter((a) => !a.isUnlocked) ?? null;

  return {
    data: lockedData,
    error,
    isLoading,
    isError,
  };
}

/**
 * Get achievement statistics
 */
export function useAchievementStats(userId: string): {
  data: {
    total: number;
    unlocked: number;
    locked: number;
    completionPercentage: number;
    totalPoints: number;
    pointsEarned: number;
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
    byRarity: Record<AchievementRarity, { total: number; unlocked: number }>;
  } | null;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, error, isLoading, isError } = useAchievements(userId);

  if (!data) {
    return {
      data: null,
      error,
      isLoading,
      isError,
    };
  }

  const total = data.length;
  const unlocked = data.filter((a) => a.isUnlocked).length;
  const locked = total - unlocked;
  const completionPercentage = Math.round((unlocked / total) * 100);
  const totalPoints = data.reduce((sum, a) => sum + a.pointValue, 0);
  const pointsEarned = data.filter((a) => a.isUnlocked).reduce((sum, a) => sum + a.pointValue, 0);

  // By category
  const categories: AchievementCategory[] = ["SESSION", "STREAK", "BOSS", "SOCIAL", "PROGRESSION", "ECONOMY"];
  const byCategory: Record<AchievementCategory, { total: number; unlocked: number }> = categories.reduce(
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

  // By rarity
  const rarities: AchievementRarity[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
  const byRarity: Record<AchievementRarity, { total: number; unlocked: number }> = rarities.reduce(
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

// ============================================================================
// Export
// ============================================================================

export default {
  useAchievements,
  useAchievementProgress,
  useRecentUnlocks,
  useAchievementsByCategory,
  useUnlockedAchievements,
  useLockedAchievements,
  useAchievementStats,
};
