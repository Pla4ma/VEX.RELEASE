/**
 * Onboarding Hooks (Phase 3)
 *
 * TanStack Query hooks for onboarding progress state.
 *
 * @phase 3
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store';
import { onboardingRepository } from '../repository';
import type { OnboardingProgress } from '../schemas';

const ONBOARDING_PROGRESS_KEY = 'onboarding-progress';

/**
 * Default initial onboarding progress state
 */
const defaultProgress = (userId: string): OnboardingProgress => ({
  userId,
  status: 'IN_PROGRESS',
  steps: {
    profileStarted: false,
    goalSelected: false,
    firstSessionStarted: false,
    firstSessionCompleted: false,
    rewardSeen: false,
  },
  firstSession: {},
  permissions: {
    notificationAsked: false,
    notificationGranted: false,
  },
});

/**
 * Hook to fetch and manage onboarding progress state
 */
export function useOnboardingProgressState() {
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [ONBOARDING_PROGRESS_KEY, userId],
    queryFn: async () => {
      if (!userId) {return null;}
      const state = await onboardingRepository.getProgress(userId);
      return state ?? defaultProgress(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<OnboardingProgress>) => {
      if (!userId) {throw new Error('No user ID');}
      const current = await onboardingRepository.getProgress(userId);
      const updated = { ...(current ?? defaultProgress(userId)), ...updates };
      await onboardingRepository.saveProgress(userId, updated);
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData([ONBOARDING_PROGRESS_KEY, userId], data);
    },
  });

  const markFirstSessionStarted = async (sessionId: string) => {
    const currentSteps = query.data?.steps ?? defaultProgress(userId!).steps;
    await updateMutation.mutateAsync({
      status: 'FIRST_SESSION_IN_PROGRESS',
      steps: {
        profileStarted: currentSteps.profileStarted,
        goalSelected: currentSteps.goalSelected,
        firstSessionStarted: true,
        firstSessionCompleted: currentSteps.firstSessionCompleted,
        rewardSeen: currentSteps.rewardSeen,
      },
      firstSession: {
        sessionId,
        startedAt: Date.now(),
      },
    });
  };

  const markFirstSessionCompleted = async () => {
    const currentSteps = query.data?.steps ?? defaultProgress(userId!).steps;
    const currentFirstSession = query.data?.firstSession ?? {};
    await updateMutation.mutateAsync({
      steps: {
        profileStarted: currentSteps.profileStarted,
        goalSelected: currentSteps.goalSelected,
        firstSessionStarted: currentSteps.firstSessionStarted,
        firstSessionCompleted: true,
        rewardSeen: currentSteps.rewardSeen,
      },
      firstSession: {
        ...currentFirstSession,
        completedAt: Date.now(),
      },
    });
  };

  const markNotificationAsked = async (granted: boolean) => {
    await updateMutation.mutateAsync({
      permissions: {
        notificationAsked: true,
        notificationGranted: granted,
      },
    });
  };

  const markRewardSeen = async () => {
    const currentSteps = query.data?.steps ?? defaultProgress(userId!).steps;
    await updateMutation.mutateAsync({
      steps: {
        profileStarted: currentSteps.profileStarted,
        goalSelected: currentSteps.goalSelected,
        firstSessionStarted: currentSteps.firstSessionStarted,
        firstSessionCompleted: currentSteps.firstSessionCompleted,
        rewardSeen: true,
      },
    });
  };

  return {
    state: query.data,
    isLoading: query.isLoading,
    error: query.error,
    markFirstSessionStarted,
    markFirstSessionCompleted,
    markNotificationAsked,
    markRewardSeen,
  };
}
