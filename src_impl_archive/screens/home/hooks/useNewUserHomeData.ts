import { useCallback } from 'react';
import type { HomeController } from './home-controller-types';
import type { ChallengeItem } from '../../../features/home-spine/components';
import { useBaseHomeData } from './useBaseHomeData';
import type { NewUserHomeData } from './home-data-types';
import type { ToastOptions } from '../../../shared/ui/components/Toast';

export function useNewUserHomeData(controller: HomeController): NewUserHomeData {
  const base = useBaseHomeData(controller);

  const showToast = useCallback((_opts: ToastOptions): string => '', []);

  const handleClaimReward = useCallback((_id: string): void => {}, []);
  const handleFreezeStreak = useCallback((): void => {}, []);

  return {
    controller,
    showToast,
    ...base,
    todaysChallenges: [] as ChallengeItem[],
    unreadNotificationCount: 0,
    savedPreview: null,
    squadMembersFocusing: [],
    intervention: null,
    interventionLoading: false as const,
    dismissIntervention: () => {},
    handleClaimReward,
    handleFreezeStreak,
    challengesQuery: {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({}),
    },
    claimRewardMutation: { mutate: () => {}, isPending: false },
    freezeStreakMutation: { mutate: () => {}, isPending: false },
    displayedInterventionIdRef: { current: null },
  };
}
