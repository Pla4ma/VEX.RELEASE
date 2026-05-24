import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Session Rewards
 * Reward crediting for completed sessions
 */

import { eventBus } from '../../events';
import * as progressionService from '../progression/service';
import * as inventoryService from '../inventory/service';
import type { ChestResult } from '../rewards/chest-engine';
import { addCurrency } from './wallet-service';

/**
 * Credit session rewards to user account
 */
export async function creditSessionRewards(
  userId: string,
  chestResult: ChestResult,
): Promise<{
  xpAdded: number;
  coinsAdded: number;
  gemsAdded: number;
  bonusItemGranted: boolean;
}> {
  const [xpResult, coinResult, gemResult] = await Promise.all([
    progressionService.addXp(userId, {
      userId,
      amount: chestResult.xpReward,
      source: 'SESSION_COMPLETE',
    }),
    addCurrency({
      userId,
      currency: 'COINS',
      amount: chestResult.coinReward,
      source: 'SESSION',
      description: `Session chest reward (${chestResult.tier})`,
      metadata: { skipMultiplier: true },
      skipEvents: false,
    }),
    chestResult.gemReward > 0
      ? addCurrency({
          userId,
          currency: 'GEMS',
          amount: chestResult.gemReward,
          source: 'SESSION',
          description: `Session chest bonus (${chestResult.tier})`,
          metadata: { skipMultiplier: true },
          skipEvents: false,
        })
      : Promise.resolve(null),
  ]);

  let bonusItemGranted = false;

  if (chestResult.bonusItemId) {
    try {
      await inventoryService.addItemToInventory({
        userId,
        itemDefinitionId: chestResult.bonusItemId,
        quantity: 1,
        acquiredFrom: 'REWARD',
        metadata: {
          source: 'session_chest',
          tier: chestResult.tier,
        },
      });
      bonusItemGranted = true;
    } catch (error) { captureSilentFailure(error, { feature: 'economy', operation: 'ui-fallback', type: 'ui' });
      bonusItemGranted = false;
    }
  }

  eventBus.publish('reward:granted', {
    userId,
    type: `SESSION_CHEST_${chestResult.tier.toUpperCase()}`,
    amount: chestResult.xpReward,
    source: 'session_chest',
    chestTier: chestResult.tier,
    coinsAdded: coinResult.earnedAmount,
    gemsAdded: gemResult?.earnedAmount ?? 0,
    bonusItemId: chestResult.bonusItemId,
    bonusItemGranted,
  });

  eventBus.publish('analytics:track', {
    event: 'session_chest_rewards_credited',
    properties: {
      userId,
      tier: chestResult.tier,
      xpAdded: xpResult.xpAdded,
      coinsAdded: coinResult.earnedAmount,
      gemsAdded: gemResult?.earnedAmount ?? 0,
      bonusItemGranted,
    },
  });

  return {
    xpAdded: xpResult.xpAdded,
    coinsAdded: coinResult.earnedAmount,
    gemsAdded: gemResult?.earnedAmount ?? 0,
    bonusItemGranted,
  };
}
