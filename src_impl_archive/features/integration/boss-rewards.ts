/**
 * Boss-Rewards Integration
 * Wires boss defeat events to reward creation.
 */

import { eventBus } from '../../events/EventBus';
import { createReward } from '../rewards/service';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('integration:boss-rewards');

/**
 * Initialize boss-rewards integration
 * Creates rewards when bosses are defeated
 */
export function initializeBossRewardsIntegration(): () => void {
  const unsubscribeDefeat = eventBus.subscribe('boss:defeated', async (event) => {
    if (!event.won) {
      return;
    }

    try {
      const recipients = event.participants?.length ? event.participants : [event.userId];

      for (const userId of recipients) {
        if (event.rewards.xp > 0) {
          await createReward({
            userId,
            type: 'XP',
            amount: event.rewards.xp,
            triggerType: 'BOSS_DEFEAT',
            triggerId: event.bossId,
          });
        }

        if (event.rewards.coins > 0) {
          await createReward({
            userId,
            type: 'COINS',
            amount: event.rewards.coins,
            triggerType: 'BOSS_DEFEAT',
            triggerId: event.bossId,
          });
        }

        for (const itemId of event.rewards.items ?? []) {
          await createReward({
            userId,
            type: 'ITEM',
            amount: 1,
            itemId,
            triggerType: 'BOSS_DEFEAT',
            triggerId: event.bossId,
          });
        }
      }

      if (recipients.length > 1) {
        for (const userId of recipients) {
          await createReward({
            userId,
            type: 'GEMS',
            amount: recipients.length * 5,
            triggerType: 'BOSS_DEFEAT',
            triggerId: event.bossId,
          });
        }
      }
    } catch (error) {
      debug.error('Failed to create boss defeat rewards:', error as Error);
    }
  });

  return () => {
    unsubscribeDefeat();
  };
}
