/**
 * useStreakSummary Hook
 * Provides streak summary data for UI components (tab bar, etc).
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import { fetchStreakSummary } from '../repository/streak-repository';
import { StreakSummarySchema } from '../schemas';

export function useStreakSummary(userId: string | null) {
  const {
    data: streakSummary,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['streak-summary', userId],
    queryFn: async () => {
      if (!userId) return null;
      const result = await fetchStreakSummary(userId);
      if (result.error) throw result.error;
      return result.data ? StreakSummarySchema.parse(result.data) : null;
    },
    enabled: !!userId,
    staleTime: 30000,
    retry: 2,
  });

  return {
    streakSummary,
    isLoading,
    error: error as Error | null,
    refetch,

    // Derived values for tab bar pulse
    isAtRisk: streakSummary?.isAtRisk ?? false,
    currentDays: streakSummary?.currentDays ?? 0,
    hoursRemaining: streakSummary?.hoursRemaining ?? 24,
    flameHealthPercent: streakSummary?.flameHealthPercent ?? 100,
  };
}