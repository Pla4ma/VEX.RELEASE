/**
 * Comeback Quest Eligibility
 *
 * Functions to check if user qualifies for comeback quest.
 */

import { createDebugger } from "../../../utils/debug";
import { COMEBACK_QUEST_CONFIG } from "./config";
import {
  fetchLastCompletedSession,
  fetchUserStreakBeforeBreak,
} from "../repository/comeback";

const debug = createDebugger("streaks:comeback-quest");

export async function checkComebackEligibility(userId: string): Promise<{
  eligible: boolean;
  daysAbsent: number;
  streakBeforeBreak: number;
}> {
  try {
    const lastSession = await fetchLastCompletedSession(userId);

    if (!lastSession) {
      return { eligible: false, daysAbsent: 0, streakBeforeBreak: 0 };
    }

    const lastSessionDate = new Date(lastSession.completed_at);
    const now = new Date();
    const diffMs = now.getTime() - lastSessionDate.getTime();
    const daysAbsent = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysAbsent < COMEBACK_QUEST_CONFIG.minDaysAbsent) {
      return { eligible: false, daysAbsent, streakBeforeBreak: 0 };
    }

    const streakBeforeBreak = await fetchUserStreakBeforeBreak(userId);

    return { eligible: true, daysAbsent, streakBeforeBreak };
  } catch (error) {
    debug.error(
      "Error checking comeback eligibility",
      error instanceof Error ? error : undefined,
    );
    return { eligible: false, daysAbsent: 0, streakBeforeBreak: 0 };
  }
}
