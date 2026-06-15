import { useCallback } from 'react';
import { useClaimChallengeReward } from '../../../features/challenges/hooks/challengeMutations';
import { useFreezeStreak } from '../../../features/streaks/hooks';
import { useToast } from '../../../shared/ui/components/Toast';
import type { HomeController } from './home-controller-types';

export function useHomeDataHandlers(
  controller: HomeController,
  showToast: ReturnType<typeof useToast>['show'],
) {
  const claimRewardMutation = useClaimChallengeReward();
  const freezeStreakMutation = useFreezeStreak();

  const handleClaimReward = useCallback(
    (challengeId: string) => {
      if (!controller.userId) {
        showToast({
          type: 'error',
          title: 'Sign in required',
          message: 'You need an active profile to claim challenge rewards.',
        });
        return;
      }
      claimRewardMutation.mutate(
        { userId: controller.userId, challengeId },
        {
          onSuccess: (result: {
            rewards: Array<{ amount: number; type: string }>;
          }) => {
            const rewardText = result.rewards
              .map((reward) => `+${reward.amount} ${reward.type}`)
              .join(', ');
            showToast({
              type: 'success',
              title: `Reward claimed! ${rewardText}`,
            });
          },
          onError: (error: unknown) => {
            showToast({
              type: 'error',
              title: 'Reward claim failed',
              message:
                error instanceof Error
                  ? error.message
                  : 'Try again when your connection is stable.',
              action: {
                label: 'Retry',
                onPress: () => handleClaimReward(challengeId),
              },
            });
          },
        },
      );
    },
    [claimRewardMutation, controller.userId, showToast],
  );

  const handleFreezeStreak = useCallback(() => {
    if (!controller.userId) {return;}
    freezeStreakMutation.mutate(controller.userId, {
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Streak protected',
          message: 'Your streak freeze is active for today.',
        });
      },
      onError: (error: unknown) => {
        showToast({
          type: 'error',
          title: 'Could not freeze streak',
          message:
            error instanceof Error
              ? error.message
              : 'Try again before your streak expires.',
        });
      },
    });
  }, [controller.userId, freezeStreakMutation, showToast]);

  return {
    claimRewardMutation,
    freezeStreakMutation,
    handleClaimReward,
    handleFreezeStreak,
  };
}
