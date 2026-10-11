import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events/EventBus';
import { getProgressionService } from '../../progression/ProgressionService';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import { getRewardService } from '../../rewards/RewardService';
import * as repository from './repository';
import { ClaimChallengeRewardInputSchema, type ChallengeReward } from './schemas';
import { getCompletedChallenges } from './queries';

export async function claimChallengeReward(input: {
  userId: string;
  challengeId: string;
}): Promise<{
  success: boolean;
  rewards: ChallengeReward[];
  error: string | null;
}> {
  const validated = ClaimChallengeRewardInputSchema.parse(input);
  try {
    const detail = (await getCompletedChallenges(validated.userId, 50)).find(
      (item) => item.challenge.id === validated.challengeId,
    );
    if (!detail) {
      return { success: false, rewards: [], error: 'Challenge not completed' };
    }
    if (detail.userChallenge.status === 'CLAIMED') {
      return { success: false, rewards: [], error: 'Reward already claimed' };
    }
    const rewardService = getRewardService(validated.userId);
    const rewards: ChallengeReward[] = [];
    if (detail.xpReward > 0) {
      const idempotencyKey = `challenge:${validated.userId}:${validated.challengeId}`;
      await getProgressionService(validated.userId).addXP(detail.xpReward, 'CHALLENGE_BONUS',
        { idempotencyKey: `${idempotencyKey}:xp`, metadata: { challengeId: validated.challengeId } });
      await rewardService.grantReward(
        'XP',
        'CHALLENGE_COMPLETE',
        { baseAmount: 1 },
        { exactAmount: detail.xpReward, challengeId: validated.challengeId,
          idempotencyKey: `${idempotencyKey}:receipt` },
      );
      rewards.push({
        type: 'XP',
        amount: detail.xpReward,
        itemId: null,
        delivered: true,
        deliveredAt: Date.now(),
      });
    }
    if (detail.coinReward > 0 && getAvailabilityFor('economy_basic').canUseBackend) {
        const { grantCurrencyRpc } = await import('../economy/repository');
        const result = await grantCurrencyRpc({
          userId: validated.userId,
          currency: 'COINS',
          amount: detail.coinReward,
          source: 'CHALLENGE_COMPLETE',
          sourceId: validated.challengeId,
        });
      if (!result.success) { throw new Error(result.error ?? 'Challenge currency grant failed'); }
      rewards.push({
        type: 'COINS',
        amount: detail.coinReward,
        itemId: null,
        delivered: true,
        deliveredAt: Date.now(),
      });
    }
    await repository.updateUserChallenge(
      detail.userChallenge.userId,
      validated.challengeId,
      { status: 'CLAIMED', claimedAt: Date.now() },
    );
    eventBus.publish('challenge:reward_claimed', {
      userId: validated.userId,
      challengeId: validated.challengeId,
      claimedAt: Date.now(),
    });
    return { success: true, rewards, error: null };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'challenges', action: 'claim-reward' },
    });
    return {
      success: false,
      rewards: [],
      error:
        error instanceof Error
          ? error.message
          : 'Unknown challenge reward error',
    };
  }
}
