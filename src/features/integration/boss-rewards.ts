/**
 * Boss-Rewards Integration (Public v1)
 *
 * Wires boss defeat events to reward creation.
 * Public v1: XP only — no coins, gems, items, or squad rewards.
 */

import { eventBus } from '../../events/EventBus';
import { createReward } from '../rewards/service';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('integration:boss-rewards');

export function initializeBossRewardsIntegration(): () => void {
  const unsubscribeDefeat = eventBus.subscribe('boss:defeated', async (event) => {
    if (!event.won) {
      return;
    }

    try {
      if (event.rewards.xp > 0) {
        await createReward({
          userId: event.userId,
          type: 'XP',
          amount: event.rewards.xp,
          triggerType: 'BOSS_DEFEAT',
          triggerId: event.bossId,
        });
      }
    } catch (error) {
      debug.error('Failed to create boss defeat rewards:', error as Error);
    }
  });

  return () => {
    unsubscribeDefeat();
  };
}
