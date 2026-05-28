/**
 * Event Listener Setup
 *
 * Wires EventBus subscriptions to ChallengeManager progress tracking.
 * Extracted from EventService to keep file sizes under 200 lines.
 */

import { eventBus } from "./EventBus";
import type { ChallengeManager } from "./ChallengeManager";

export function setupEventListeners(
  getUserId: () => string | null,
  challengeManager: ChallengeManager,
): void {
  eventBus.subscribe(
    "session:completed",
    (payload: { userId: string; duration: number }) => {
      if (payload.userId === getUserId()) {
        challengeManager.updateChallengeProgress("SESSION_COUNT", 1);
        challengeManager.updateChallengeProgress(
          "SESSION_DURATION",
          payload.duration,
        );
      }
    },
  );

  eventBus.subscribe(
    "progression:xp_added",
    (payload: { userId: string; amount: number }) => {
      if (payload.userId === getUserId()) {
        challengeManager.updateChallengeProgress("XP_EARNED", payload.amount);
      }
    },
  );

  eventBus.subscribe(
    "streak:updated",
    (payload: { userId: string; state: { currentStreak: number } }) => {
      if (payload.userId === getUserId()) {
        challengeManager.updateChallengeProgress(
          "STREAK_DAYS",
          payload.state.currentStreak,
        );
      }
    },
  );

  eventBus.subscribe(
    "progression:level_up",
    (payload: { userId: string; newLevel: number }) => {
      if (payload.userId === getUserId()) {
        challengeManager.updateChallengeProgress(
          "LEVEL_REACHED",
          payload.newLevel,
        );
      }
    },
  );

  eventBus.subscribe("achievement:unlock", (payload: { userId: string }) => {
    if (payload.userId === getUserId()) {
      challengeManager.updateChallengeProgress("ACHIEVEMENT_UNLOCKED", 1);
    }
  });
}
