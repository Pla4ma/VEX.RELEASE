/**
 * Progression-Rewards Integration
 * Wires progression events to reward creation
 */

import { eventBus } from '../../events/EventBus';
import { createReward } from '../rewards/service';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('integration:progression-rewards');

/**
 * Initialize progression-rewards integration
 * Listens for level up events and creates rewards
 */
export function initializeProgressionRewardsIntegration(): () => void {
  const unsubscribeLevelUp = eventBus.subscribe(
    'progression:level_up',
    (event) => {
      // Create rewards for level up
      if (event.rewards && event.rewards.length > 0) {
        event.rewards.forEach((rewardType) => {
          createReward({
            userId: event.userId,
            type: 'XP',
            amount: calculateLevelUpReward(event.newLevel, rewardType),
            triggerType: 'LEVEL_UP',
          }).catch((error) => {
            // Log but don't fail - rewards are non-critical
            debug.error('Failed to create level up reward:', error as Error);
          });
        });
      }
    },
  );

  const unsubscribeXpAdded = eventBus.subscribe(
    'progression:xp_added',
    (event) => {
      debug.debug('Progression XP observed', { userId: event.userId });
    },
  );

  return () => {
    unsubscribeLevelUp();
    unsubscribeXpAdded();
  };
}

function calculateLevelUpReward(level: number, rewardType: string): number {
  const baseReward = level * 50;

  switch (rewardType) {
    case 'XP_BOOST':
      return baseReward * 2;
    case 'COINS':
    case 'GEMS':
      return baseReward;
    default:
      return baseReward;
  }
}
