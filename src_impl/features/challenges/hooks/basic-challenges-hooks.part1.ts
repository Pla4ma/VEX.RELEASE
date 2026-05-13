import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store";
import * as service from "../basic-challenges-service";
import type { BasicChallengeProgressResult, BasicChallengeClaimResult } from "../basic-challenges-service";
import { createDebugger } from "../../../utils/debug";


export const challengesKeys = {
  all: ['challenges'] as const,
  status: (userId: string) => ['challenges', 'status', userId] as const,
  daily: (userId: string) => ['challenges', 'daily', userId] as const,
  weekly: (userId: string) => ['challenges', 'weekly', userId] as const,
};

export function useBasicChallengesStatus() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: challengesKeys.status(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) {throw new Error('User not authenticated');}
      return service.getBasicChallengesStatus(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBasicDailyChallenge() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: challengesKeys.daily(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) {return null;}
      return service.getOrCreateBasicDailyChallenge(userId);
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBasicWeeklyChallenge() {
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: challengesKeys.weekly(userId ?? 'no-user'),
    queryFn: () => {
      if (!userId) {return null;}
      return service.getOrCreateBasicWeeklyChallenge(userId);
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateBasicChallengeProgress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation<BasicChallengeProgressResult, Error, { sessionId: string; sessionDuration: number }>({
    mutationFn: ({
      sessionId,
      sessionDuration,
    }) => {
      if (!userId) {throw new Error('User not authenticated');}
      return service.updateBasicChallengeProgressFromSession(userId, sessionId, sessionDuration);
    },
    onSuccess: (result) => {
      // Invalidate challenge queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: challengesKeys.status(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.daily(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.weekly(userId) });
      }

      // Invalidate rewards and progression if challenges were completed
      if (result.dailyCompleted || result.weeklyCompleted) {
        queryClient.invalidateQueries({ queryKey: ['progression', userId] });
        queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
      }
    },
    onError: (error) => {
      debug.error('Failed to update challenge progress', error instanceof Error ? error : new Error(String(error)));
    },
  });
}

export function useClaimBasicChallengeReward() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  return useMutation<BasicChallengeClaimResult, Error, 'DAILY' | 'WEEKLY'>({
    mutationFn: (challengeType) => {
      if (!userId) {throw new Error('User not authenticated');}
      return service.claimBasicChallengeReward(userId, challengeType);
    },
    onSuccess: (result) => {
      // Invalidate challenge queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: challengesKeys.status(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.daily(userId) });
        queryClient.invalidateQueries({ queryKey: challengesKeys.weekly(userId) });
      }

      // Invalidate rewards if claim was successful
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['rewards', userId] });
        queryClient.invalidateQueries({ queryKey: ['progression', userId] });
      }
    },
    onError: (error) => {
      debug.error('Failed to claim challenge reward', error instanceof Error ? error : new Error(String(error)));
    },
  });
}

export function useBasicChallenges() {
  const statusQuery = useBasicChallengesStatus();
  const dailyQuery = useBasicDailyChallenge();
  const weeklyQuery = useBasicWeeklyChallenge();
  const progressMutation = useUpdateBasicChallengeProgress();
  const claimMutation = useClaimBasicChallengeReward();

  const isLoading = statusQuery.isLoading || dailyQuery.isLoading || weeklyQuery.isLoading;
  const error = statusQuery.error || dailyQuery.error || weeklyQuery.error;
  const status = statusQuery.data;

  const dailyProgress = status?.daily.progress ?? 0;
  const dailyRequired = status?.daily.required ?? 1;
  const dailyCompleted = status?.daily.isCompleted ?? false;
  const dailyCanClaim = status?.daily.canClaim ?? false;

  const weeklyProgress = status?.weekly.progress ?? 0;
  const weeklyRequired = status?.weekly.required ?? 5;
  const weeklyCompleted = status?.weekly.isCompleted ?? false;
  const weeklyCanClaim = status?.weekly.canClaim ?? false;

  return {
    status,
    dailyChallenge: dailyQuery.data,
    weeklyChallenge: weeklyQuery.data,
    isLoading,
    error,
    dailyProgress,
    dailyRequired,
    dailyCompleted,
    dailyCanClaim,
    weeklyProgress,
    weeklyRequired,
    weeklyCompleted,
    weeklyCanClaim,
    updateProgress: progressMutation.mutate,
    isUpdatingProgress: progressMutation.isPending,
    claimReward: claimMutation.mutate,
    isClaimingReward: claimMutation.isPending,
  };
}