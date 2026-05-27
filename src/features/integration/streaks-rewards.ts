/**
 * Streaks-Rewards Integration
 * Wires streak milestone events to reward creation
 */

import { eventBus } from "../../events/EventBus";
import { createReward } from "../rewards/service";
import { checkMilestone } from "../streaks/service";
import type { RewardType } from "../rewards/schemas";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("integration:streaks-rewards");

function toRewardType(
  rewardType: ReturnType<typeof checkMilestone> extends infer T
    ? T extends { rewardType: infer R }
      ? R
      : never
    : never,
): RewardType | null {
  return rewardType === "XP" ? "XP" : null;
}

/**
 * Initialize streaks-rewards integration
 * Creates rewards when streak milestones are reached
 */
export function initializeStreaksRewardsIntegration(): () => void {
  const unsubscribeMilestone = eventBus.subscribe(
    "social:streak_milestone",
    (event) => {
      if (!event?.streak || !event.userId) {
        return;
      }

      const milestone = checkMilestone(event.streak);
      if (!milestone) {
        return;
      }
      const rewardType = toRewardType(milestone.rewardType);
      if (!rewardType) {
        return;
      }

      // Create reward for milestone
      createReward({
        userId: event.userId,
        type: rewardType,
        amount: milestone.rewardAmount,
        triggerType: "STREAK_MILESTONE",
        triggerId: milestone.id,
      }).catch((error) => {
        debug.error(
          "Failed to create streak milestone reward:",
          error as Error,
        );
      });
    },
  );

  const unsubscribeBreak = eventBus.subscribe("streak:broken", (event) => {
    if (!event.userId) {
      return;
    }

    debug.debug("Streak break observed without spendable reward", {
      userId: event.userId,
    });
  });

  return () => {
    unsubscribeMilestone();
    unsubscribeBreak();
  };
}
