/**
 * Streaks-Rewards Integration
 * Wires streak milestone events to reward creation
 */

import { eventBus } from '../../events/EventBus';
import { createReward } from '../rewards/service';
import { checkMilestone } from '../streaks/service';
import type { RewardType } from '../rewards/schemas';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('integration:streaks-rewards');

function toRewardType(rewardType: ReturnType<typeof checkMilestone> extends infer T
  ? T extends { rewardType: infer R }
    ? R
    : never
  : never): RewardType | null {
  switch (rewardType) {
    case 'XP':
    case 'COINS':
    case 'GEMS':
    case 'ITEM':
    case 'STREAK_SHIELD':
      return rewardType;
    case 'BADGE':
      return null;
    default:
      return null;
  }
}

/**
 * Initialize streaks-rewards integration
 * Creates rewards when streak milestones are reached
 */
export function initializeStreaksRewardsIntegration(): () => void {
  const unsubscribeMilestone = eventBus.subscribe('social:streak_milestone', (event) => {
    if (!event?.streak || !event.userId) {return;}

    const milestone = checkMilestone(event.streak);
    if (!milestone) {return;}
    const rewardType = toRewardType(milestone.rewardType);
    if (!rewardType) {return;}

    // Create reward for milestone
    createReward({
      userId: event.userId,
      type: rewardType,
      amount: milestone.rewardAmount,
      triggerType: 'STREAK_MILESTONE',
      triggerId: milestone.id,
    }).catch((error) => {
      debug.error('Failed to create streak milestone reward:', error as Error);
    });
  });

  const unsubscribeBreak = eventBus.subscribe('streak:broken', (event) => {
    if (!event.userId) {return;}

    // Create comeback reward for broken streak
    createReward({
      userId: event.userId,
      type: 'STREAK_SHIELD',
      amount: 1,
      triggerType: 'COMEBACK',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }).catch((error) => {
      debug.error('Failed to create comeback reward:', error as Error);
    });
  });

  return () => {
    unsubscribeMilestone();
    unsubscribeBreak();
  };
}
