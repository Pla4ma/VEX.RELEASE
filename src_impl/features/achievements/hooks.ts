/**
 * Achievement Hooks
 *
 * TanStack Query hooks for achievement data:
 * - useAchievements(userId): All achievements with unlock status
 * - useAchievementProgress(userId, achievementId): Single achievement progress
 * - useRecentUnlocks(userId): Last 10 unlocked achievements
 */

import { useQuery } from '@tanstack/react-query';
import type { Achievement, AchievementCategory, AchievementRarity, UserAchievement } from './types';
import { ALL_ACHIEVEMENTS, getAchievementById } from './definitions';
import * as repository from './repository';

// ============================================================================
// Query Keys
// ============================================================================
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
// ============================================================================
// Hook: useAchievementProgress
// ============================================================================
// ============================================================================
// Hook: useRecentUnlocks
// ============================================================================
// ============================================================================
// Additional Utility Hooks
// ============================================================================
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

export * from "./hooks.types";
export * from "./hooks.types";
export * from "./hooks.part1";
export * from "./hooks.part2";
