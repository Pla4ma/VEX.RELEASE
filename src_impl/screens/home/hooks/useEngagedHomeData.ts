import { useMemo, useRef, useCallback } from 'react';
import type { HomeController } from './home-controller-types';
import type { ChallengeItem } from '../../../features/home-spine/components';
import { useBaseHomeData } from './useBaseHomeData';
import { getFeatureAvailability } from '../../../features/liveops-config';
import { useActiveChallenges, useClaimChallengeReward } from '../../../features/challenges/hooks';
import { useActiveIntervention } from '../../../features/ai-coach/hooks';
import { useToast } from '../../../shared/ui/components/Toast';
import type { EngagedHomeData } from './home-data-types';

export function useEngagedHomeData(controller: HomeController): EngagedHomeData {
  const base = useBaseHomeData(controller);
  const features = controller.features;
  const challengeAvail = getFeatureAvailability(features.challenges);
  const coachAvail = getFeatureAvailability(features.ai_coach_advanced);
  const { show: showToast } = useToast();

  const challengesQuery = useActiveChallenges(
    controller.userId,
    { enabled: challengeAvail.canQuery },
  );
  const claimRewardMutation = useClaimChallengeReward();

  const { intervention, isLoading: interventionLoading, dismiss: dismissIntervention } = useActiveIntervention(
    coachAvail.canQuery ? controller.userId || undefined : undefined,
  );

  const displayedInterventionIdRef = useRef<string | null>(null);

  const todaysChallenges: ChallengeItem[] = useMemo(() => {
    if (!challengeAvail.canQuery) return [];
    const data = challengesQuery.data as Array<{
      challenge: { type: string; title: string; description: string; targetValue: number; rewardAmount: number; rewardType: string };
      userChallenge: { id: string; currentValue: number; status: string; expiresAt: number | null };
    }> | undefined;
    if (!data) return [];
    return data
      .filter((item) => item.challenge.type === 'DAILY')
      .slice(0, 3)
      .map((item) => ({
        id: item.userChallenge.id,
        title: item.challenge.title,
        description: item.challenge.description,
        currentProgress: item.userChallenge.currentValue,
        targetProgress: item.challenge.targetValue,
        rewardAmount: item.challenge.rewardAmount,
        rewardType: item.challenge.rewardType as 'XP' | 'COINS' | 'GEMS',
        isCompleted: item.userChallenge.status === 'COMPLETED' || item.userChallenge.status === 'CLAIMED',
        isClaimed: item.userChallenge.status === 'CLAIMED',
        timeRemainingMinutes: item.userChallenge.expiresAt
          ? Math.max(0, Math.floor((item.userChallenge.expiresAt - Date.now()) / (1000 * 60)))
          : 0,
      }));
  }, [challengesQuery.data, challengeAvail.canQuery]);

  const handleClaimReward = useCallback(
    (challengeId: string) => {
      if (!controller.userId) {
        showToast({ type: 'error', title: 'Sign in required', message: 'You need an active profile to claim challenge rewards.' });
        return;
      }
      claimRewardMutation.mutate(
        { userId: controller.userId, challengeId },
        {
          onSuccess: (result: { rewards: Array<{ amount: number; type: string }> }) => {
            const rewardText = result.rewards.map((reward) => `+${reward.amount} ${reward.type}`).join(', ');
            showToast({ type: 'success', title: `Reward claimed! ${rewardText}` });
          },
          onError: (error: unknown) => {
            showToast({
              type: 'error', title: 'Reward claim failed',
              message: error instanceof Error ? error.message : 'Try again when your connection is stable.',
              action: { label: 'Retry', onPress: () => handleClaimReward(challengeId) },
            });
          },
        },
      );
    },
    [claimRewardMutation, controller.userId, showToast],
  );

  return {
    controller,
    showToast,
    challengesQuery,
    claimRewardMutation: claimRewardMutation as unknown as EngagedHomeData['claimRewardMutation'],
    freezeStreakMutation: { mutate: () => {}, isPending: false },
    intervention,
    interventionLoading,
    dismissIntervention,
    savedPreview: null,
    displayedInterventionIdRef,
    squadMembersFocusing: [],
    unreadNotificationCount: 0,
    todaysChallenges,
    ...base,
    handleClaimReward,
    handleFreezeStreak: () => {},
  };
}
