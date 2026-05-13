import { useQuery } from "@tanstack/react-query";
import type { Achievement, AchievementCategory, AchievementRarity, UserAchievement } from "./types";
import { ALL_ACHIEVEMENTS, getAchievementById } from "./definitions";
import * as repository from "./repository";


export const achievementKeys = {
  all: ['achievements'] as const,
  byUser: (userId: string) => [...achievementKeys.all, 'user', userId] as const,
  list: (userId: string) => [...achievementKeys.byUser(userId), 'list'] as const,
  detail: (userId: string, achievementId: string) => [...achievementKeys.byUser(userId), 'detail', achievementId] as const,
  recent: (userId: string) => [...achievementKeys.byUser(userId), 'recent'] as const,
  stats: (userId: string) => [...achievementKeys.byUser(userId), 'stats'] as const,
};

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
        throw err instanceof Error ? err : new Error('Failed to fetch achievements');
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
        throw err instanceof Error ? err : new Error('Failed to fetch achievement progress');
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
        throw err instanceof Error ? err : new Error('Failed to fetch recent unlocks');
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