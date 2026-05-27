/**
 * Streaks-Progression Integration
 * Wires streak events to XP bonuses
 */

import { eventBus } from "../../events/EventBus";
import {
  addXpEnhanced,
  calculateXpBreakdown,
} from "../progression/service-enhanced";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("integration:streaks-progression");

/**
 * Initialize streaks-progression integration
 * Awards XP for streak milestones and maintains streak bonuses
 */
export function initializeStreaksProgressionIntegration(): () => void {
  const unsubscribeMilestone = eventBus.subscribe(
    "social:streak_milestone",
    (event) => {
      // Award XP for streak milestones
      const baseAmount = event.streak * 10;
      const breakdown = calculateXpBreakdown({
        baseAmount,
        streakDays: event.streak,
        squadMultiplier: 1,
        bossActive: false,
        perfectSession: true,
        comebackActive: false,
      });

      addXpEnhanced(
        event.userId,
        {
          userId: event.userId,
          amount: breakdown.total,
          source: "STREAK_BONUS",
          metadata: {
            streakDays: event.streak,
            perfectSession: true,
          },
        },
        { skipEvents: false },
      ).catch((error) => {
        debug.error("Failed to award streak milestone XP:", error as Error);
      });
    },
  );

  const unsubscribeIncrement = eventBus.subscribe("streak:updated", (event) => {
    // Award small XP for maintaining streak
    if (event.state.currentStreak > 0) {
      addXpEnhanced(
        event.userId,
        {
          userId: event.userId,
          amount: 5,
          source: "STREAK_BONUS",
          metadata: {
            streakDays: event.state.currentStreak,
          },
        },
        { skipEvents: true }, // Skip to avoid recursive events
      ).catch((error) =>
        debug.error("Failed to award streak bonus XP:", error as Error),
      );
    }
  });

  return () => {
    unsubscribeMilestone();
    unsubscribeIncrement();
  };
}
