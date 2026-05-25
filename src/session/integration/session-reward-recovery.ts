import {
  clearStreakRestoreQuest,
  markStreakRestoreUsed,
  recordStreakRestoreSession,
} from "../../features/streaks/restore-quest";
import { restoreStreak } from "../../features/streaks/service";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";
import type { RewardIntegrationConfig } from "./SessionRewardIntegration";
import { publishXp } from "./session-reward-helpers";

const debug = createDebugger("session:reward-recovery");

export async function handlePartialCompletion(
  config: RewardIntegrationConfig,
  sessionId: string,
  userId: string,
  recoveredTime: number,
): Promise<void> {
  if (!config.autoHandleRecoveryRewards) {
    debug.debug("Recovery rewards disabled - skipping partial completion for session %s", sessionId);
    return;
  }
  const partialXp = Math.floor(recoveredTime / 60) * 5;
  publishXp(userId, partialXp, "session_recovery");
  eventBus.publish("analytics:track", {
    event: "session_partial_complete",
    properties: { userId, recoveredTime, xpEarned: partialXp },
  });
}

export async function handleAbandonment(
  config: RewardIntegrationConfig,
  sessionId: string,
  userId: string,
  elapsedTime: number,
): Promise<void> {
  if (!config.autoHandleAbandonmentPartialCredit) {
    debug.debug("Abandonment partial credit disabled - skipping for session %s", sessionId);
    return;
  }
  const partialXp = elapsedTime >= 300 ? Math.floor(elapsedTime / 60) * 3 : 0;
  if (partialXp > 0) {
    publishXp(userId, partialXp, "session_partial_abandon");
  }
  eventBus.publish("analytics:track", {
    event: "session_abandoned",
    properties: { userId, elapsedTime, hadPartialCredit: partialXp > 0 },
  });
}

export async function advanceRestoreQuest(
  userId: string,
  sessionId: string,
): Promise<void> {
  const progress = await recordStreakRestoreSession(userId, sessionId);
  if (!progress.shouldRestore || !progress.streakBefore) return;
  const restored = await restoreStreak(userId, progress.streakBefore);
  if (!restored) return;
  await markStreakRestoreUsed(userId);
  await clearStreakRestoreQuest(userId);
}
