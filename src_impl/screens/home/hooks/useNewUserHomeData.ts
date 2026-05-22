import type { HomeController } from './home-controller-types';
import type { ChallengeItem } from '../../../features/home-spine/components';
import { useBaseHomeData } from './useBaseHomeData';

export function useNewUserHomeData(controller: HomeController) {
  const base = useBaseHomeData(controller);
  return {
    controller,
    ...base,
    todaysChallenges: [] as ChallengeItem[],
    intervention: null,
    interventionLoading: false,
    dismissIntervention: () => {},
    savedPreview: null,
    squadMembersFocusing: [],
    unreadNotificationCount: 0,
    handleClaimReward: (_id: string) => {},
    handleFreezeStreak: () => {},
    showToast: undefined as unknown as ReturnType<typeof import('../../../shared/ui/components/Toast').useToast>['show'],
    challengesQuery: { data: undefined, isLoading: false, isError: false, error: null, refetch: async () => ({}) },
    claimRewardMutation: { mutate: () => {}, isPending: false },
    freezeStreakMutation: { mutate: () => {}, isPending: false },
    displayedInterventionIdRef: { current: null } as React.MutableRefObject<string | null>,
  };
}
