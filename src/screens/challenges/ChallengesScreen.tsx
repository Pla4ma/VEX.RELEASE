import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback } from 'react';
import { sanitizeErrorMessage } from '../../utils/error-sanitizer';

import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { ChallengeHub } from '../../features/challenges/components/ChallengeHub';
import { useClaimChallengeReward } from '../../features/challenges/hooks/challengeMutations';
import { useAuthStore } from '../../store';
import { useToast } from '../../shared/ui/components/Toast';

function ChallengesScreen(): React.ReactNode {
  const userId = useAuthStore((state) => state.user?.id);
  const claimReward = useClaimChallengeReward();
  const { show: showToast } = useToast();

  const handleClaimReward = useCallback(
    (challengeId: string) => {
      if (!userId) {
        showToast({
          type: 'error',
          title: 'Sign in required',
          message: 'You need an active profile to claim challenge rewards.',
        });
        return;
      }

      claimReward.mutate(
        { userId, challengeId },
        {
          onSuccess: (result) => {
            const rewardText = result.rewards
              .map((reward) => `+${reward.amount} ${reward.type}`)
              .join(', ');

            showToast({
              type: 'success',
              title: `Reward claimed! ${rewardText}`,
            });
          },
          onError: (error) => {
            showToast({
              type: 'error',
              title: 'Reward claim failed',
              message:
                error instanceof Error
                  ? sanitizeErrorMessage(error)
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
    [claimReward, showToast, userId],
  );

  if (!userId) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" p="lg">
        <Text variant="h3" color="text.primary" textAlign="center">
          Sign in to view challenges
        </Text>
        <Text variant="body" color="text.secondary" textAlign="center" mt="sm">
          Your active and completed challenge rewards are tied to your profile.
        </Text>
      </Box>
    );
  }

  return <ChallengeHub userId={userId} onClaimReward={handleClaimReward} />;
}

const ChallengesScreenWithBoundary = withScreenErrorBoundary(ChallengesScreen, 'Challenges');
export { ChallengesScreenWithBoundary as ChallengesScreen };

export { ChallengesScreen as default };
