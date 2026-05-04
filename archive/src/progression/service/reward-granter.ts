import { getRewardService } from '../../rewards/RewardService';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import type { XPSource } from '../schemas';

const debug = createDebugger('progression:rewards');

export async function grantLevelUpRewards(
  userId: string,
  level: number,
  source: XPSource,
): Promise<string[]> {
  const rewards: string[] = [];
  const rewardService = getRewardService(userId);

  const grantReward = async (
    type: 'XP' | 'CURRENCY' | 'PREMIUM' | 'ITEM' | 'BADGE' | 'BOOST' | 'STREAK_BONUS',
    amount: number,
    metadata?: Record<string, unknown>,
  ): Promise<void> => {
    const reward = await rewardService.grantReward(
      type,
      'LEVEL_UP',
      { baseAmount: amount },
      {
        exactAmount: amount,
        level,
        source,
        ...metadata,
      },
    );
    rewards.push(reward.id);

    if (type === 'ITEM' || type === 'BADGE' || type === 'BOOST' || type === 'STREAK_BONUS') {
      await rewardService.claimReward(reward.id);
    }
  };

  if (level >= 1 && level <= 9) {
    await grantReward('CURRENCY', 200, { currency: 'COINS', rewardTier: 'EARLY_LEVEL' });
    await grantReward('XP', 50, { rewardTier: 'EARLY_LEVEL' });
  }

  if (level % 10 === 0) {
    await grantReward('PREMIUM', 1, { currency: 'GEMS', rewardTier: 'MILESTONE_10' });
    await grantReward('CURRENCY', 500, { currency: 'COINS', rewardTier: 'MILESTONE_10' });
    await grantReward('ITEM', 1, { itemId: 'chest_standard', rewardTier: 'MILESTONE_10' });
  }

  if (level % 25 === 0) {
    await grantReward('PREMIUM', 5, { currency: 'GEMS', rewardTier: 'MILESTONE_25' });
    await grantReward('CURRENCY', 1000, { currency: 'COINS', rewardTier: 'MILESTONE_25' });
    await grantReward('ITEM', 1, { itemId: 'chest_rare', rewardTier: 'MILESTONE_25' });
  }

  if (level === 50) {
    eventBus.publish('achievement:unlock', { achievementId: 'halfway-there', userId });
    rewards.push('achievement:halfway-there');
    await grantReward('PREMIUM', 10, { currency: 'GEMS', rewardTier: 'LEVEL_50' });
  }

  if (level === 100) {
    eventBus.publish('achievement:unlock', { achievementId: 'centurion', userId });
    rewards.push('achievement:centurion');
    await grantReward('PREMIUM', 50, { currency: 'GEMS', rewardTier: 'LEVEL_100' });
    await grantReward('ITEM', 1, { itemId: 'chest_legendary', rewardTier: 'LEVEL_100' });
  }

  return rewards;
}
