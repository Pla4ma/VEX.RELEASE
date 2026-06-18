import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useOnboardingStore } from './store';
import { onboardingRepository } from './repository';
import type { OnboardingProgress } from './schemas';

const ONBOARDING_QUERY_KEY = (userId: string) => ['onboarding', 'progress', userId] as const;

export function useOnboardingProgress(userId: string | null) {
  const query = useQuery({
    queryKey: ONBOARDING_QUERY_KEY(userId ?? ''),
    queryFn: () => onboardingRepository.getProgress(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    progress: query.data ?? null,
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSyncOnboardingProgress(userId: string | null) {
  const queryClient = useQueryClient();
  const store = useOnboardingStore();

  const mutation = useMutation({
    mutationFn: (progress: OnboardingProgress) =>
      onboardingRepository.saveProgress(userId!, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_QUERY_KEY(userId ?? '') });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'onboarding', operation: 'syncOnboardingProgress' } });
    },
  });

  const syncFromStore = useCallback(async () => {
    if (!userId) return;
    const progress: OnboardingProgress = {
      userId,
      status: store.isOnboarded ? 'COMPLETED' : 'IN_PROGRESS',
      steps: {
        profileStarted: store.profileStepsCompleted,
        goalSelected: !!store.goal,
        firstSessionStarted: store.firstSessionStarted,
        firstSessionCompleted: store.firstSessionCompleted,
        rewardSeen: store.firstSessionCompleted, // rewardSeen is set when first session completes
      },
      firstSession: {
        sessionId: undefined,
        startedAt: undefined,
        completedAt: undefined,
      },
      permissions: {
        notificationAsked: false, // tracked separately
        notificationGranted: false,
      },
      goal: store.goal ?? undefined,
      focusDuration: store.focusDuration ?? undefined,
      displayName: store.displayName ?? undefined,
      persona: store.persona ?? undefined,
      element: store.element ?? undefined,
      motivationProfile: store.motivationProfile ?? undefined,
      chosenLane: store.chosenLane ?? undefined,
    };
    await mutation.mutateAsync(progress);
  }, [userId, store, mutation]);

  return { syncFromStore, isSyncing: mutation.isPending };
}

export function useOnboardingProgressState(): {
  state: ReturnType<typeof useOnboardingStore.getState> | null;
  isLoading: boolean;
  markNotificationAsked: (asked: boolean) => void;
  markRewardSeen: () => void;
} {
  const store = useOnboardingStore();
  return {
    state: store,
    isLoading: false,
    markNotificationAsked: (_asked: boolean) => {
      // Notification permission tracking — stored via store or system callback
    },
    markRewardSeen: () => {
      store.markFirstSessionCompleted();
    },
  };
}
