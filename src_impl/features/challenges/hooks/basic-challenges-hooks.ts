/**
 * Basic Challenges Hooks
 *
 * React hooks for the simplified challenges system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../../../store';
import * as service from '../basic-challenges-service';

// ============================================================================
// Query Keys
// ============================================================================

export const challengesKeys = {
  all: ['challenges'] as const,
  status: (userId: string) => ['challenges', 'status', userId] as const,
  daily: (userId: string) => ['challenges', 'daily', userId] as const,
  weekly: (userId: string) => ['challenges', 'weekly', userId] as const,
};

// ============================================================================
// Basic Challenges Hooks
// ============================================================================

export function useBasicChallengesStatus() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useQuery({
    queryKey: challengesKeys.status(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return service.getBasicChallengesStatus(userId);
    },
    enabled: !!userId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
  return { ...query, data: query.data, isPending: query.isPending, isError: query.isError, error: query.error, refetch: query.refetch };
}

export function useBasicDailyChallenge() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useQuery({
    queryKey: challengesKeys.daily(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) return null;
      return service.getOrCreateBasicDailyChallenge(userId);
    },
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...query, data: query.data, isPending: query.isPending, isError: query.isError, error: query.error, refetch: query.refetch };
}

export function useBasicWeeklyChallenge() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const query = useQuery({
    queryKey: challengesKeys.weekly(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) return null;
      return service.getOrCreateBasicWeeklyChallenge(userId);
    },
    enabled: !!userId,
    staleTime: 60000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...query, data: query.data, isPending: query.isPending, isError: query.isError, error: query.error, refetch: query.refetch };
}

export function useUpdateBasicChallengeProgress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return useMutation({
    mutationFn: ({ sessionId, sessionDuration }: { sessionId: string; sessionDuration: number }) => {
      if (!userId) throw new Error('User not authenticated');
      return service.updateBasicChallengeProgressFromSession(userId, sessionId, sessionDuration);
    },
    onSuccess: (result) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: challengesKeys.status(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.daily(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.weekly(userId) });
      }
      if (result.dailyCompleted || result.weeklyCompleted) {
        queryClient.invalidateQueries({ queryKey: ['progression', userId] });
        queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
      }
    },
    onError: (error: Error) => {
      Sentry.addBreadcrumb({ category: 'challenges', message: 'Failed to update challenge progress', level: 'error', data: { error: error.message } });
      Sentry.captureException(error, { tags: { feature: 'challenges' } });
    },
  });
}

export function useClaimBasicChallengeReward() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  return useMutation({
    mutationFn: (challengeType: "DAILY" | "WEEKLY") => {
      if (!userId) throw new Error('User not authenticated');
      return service.claimBasicChallengeReward(userId, challengeType);
    },
    onSuccess: (result) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: challengesKeys.status(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.daily(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.weekly(userId) });
      }
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
        queryClient.invalidateQueries({ queryKey: ['progression', userId] });
      }
    },
    onError: (error: Error) => {
      Sentry.addBreadcrumb({ category: 'challenges', message: 'Failed to claim challenge reward', level: 'error', data: { error: error.message } });
      Sentry.captureException(error, { tags: { feature: 'challenges' } });
    },
  });
}

export function useBasicChallenges() {
  const statusQuery = useBasicChallengesStatus();
  const dailyQuery = useBasicDailyChallenge();
  const weeklyQuery = useBasicWeeklyChallenge();
  const progressMutation = useUpdateBasicChallengeProgress();
  const claimMutation = useClaimBasicChallengeReward();
  return {
    status: statusQuery.data,
    dailyChallenge: dailyQuery.data,
    weeklyChallenge: weeklyQuery.data,
    isLoading: statusQuery.isLoading || dailyQuery.isLoading || weeklyQuery.isLoading,
    isPending: statusQuery.isPending || dailyQuery.isPending || weeklyQuery.isPending,
    error: statusQuery.error || dailyQuery.error || weeklyQuery.error,
    isError: statusQuery.isError || dailyQuery.isError || weeklyQuery.isError,
    dailyProgress: statusQuery.data?.daily.progress ?? 0,
    dailyRequired: statusQuery.data?.daily.required ?? 1,
    dailyCompleted: statusQuery.data?.daily.isCompleted ?? false,
    dailyCanClaim: statusQuery.data?.daily.canClaim ?? false,
    weeklyProgress: statusQuery.data?.weekly.progress ?? 0,
    weeklyRequired: statusQuery.data?.weekly.required ?? 5,
    weeklyCompleted: statusQuery.data?.weekly.isCompleted ?? false,
    weeklyCanClaim: statusQuery.data?.weekly.canClaim ?? false,
    updateProgress: progressMutation.mutate,
    isUpdatingProgress: progressMutation.isPending,
    claimReward: claimMutation.mutate,
    isClaimingReward: claimMutation.isPending,
    refetch: () => { statusQuery.refetch(); dailyQuery.refetch(); weeklyQuery.refetch(); },
  };
}
