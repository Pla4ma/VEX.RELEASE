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
  const unsubscribeLevelUp = eventBus.subscribe('progression:level_up', (event) => {
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

    // Milestone reward for every 10 levels
    if (event.newLevel % 10 === 0) {
      createReward({
        userId: event.userId,
        type: 'COINS',
        amount: event.newLevel * 10,
        triggerType: 'LEVEL_UP',
      }).catch((error) => debug.error('Failed to create milestone reward:', error as Error));
    }
  });

  const unsubscribeXpAdded = eventBus.subscribe('progression:xp_added', (event) => {
    // Check for perfect session bonus
    if (event.progressPercent === 100 && event.streakBonus > 0) {
      createReward({
        userId: event.userId,
        type: 'GEMS',
        amount: 1,
        triggerType: 'SESSION_COMPLETE',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h expiry
      }).catch((error) => debug.error('Failed to create perfect session reward:', error as Error));
    }
  });

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
      return baseReward;
    case 'GEMS':
      return Math.floor(level / 10) + 1;
    default:
      return baseReward;
  }
}
