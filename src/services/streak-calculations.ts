/**
 * Pure streak calculation logic.
 * Extracted from streakService.ts to keep files under the 200-line limit.
 */

import { createDebugger } from "../utils/debug";
import type { StreakData, StreakUpdate } from "./streak-types";

const debug = createDebugger("streak-calculations");

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function calculateStreakUpdate(
  streakData: StreakData,
  sessionDate: Date,
): StreakUpdate {
  const today = toDayStart(new Date());
  const sessionDay = toDayStart(sessionDate);
  const lastSessionDay = streakData.lastSessionDate
    ? toDayStart(new Date(streakData.lastSessionDate))
    : null;

  let newStreak = streakData.currentStreak;
  let streakMaintained = false;
  let streakBroken = false;

  if (!lastSessionDay) {
    newStreak = 1;
    streakMaintained = true;
  } else if (sessionDay.getTime() === today.getTime()) {
    streakMaintained = true;
  } else if (sessionDay.getTime() === today.getTime() - ONE_DAY_MS) {
    newStreak += 1;
    streakMaintained = true;
  } else if (sessionDay.getTime() < today.getTime() - ONE_DAY_MS) {
    const daysSinceLast = Math.floor(
      (today.getTime() - lastSessionDay.getTime()) / ONE_DAY_MS,
    );
    if (daysSinceLast > 1) {
      newStreak = 1;
      streakBroken = true;
    } else {
      newStreak += 1;
      streakMaintained = true;
    }
  } else if (sessionDay.getTime() > today.getTime()) {
    debug.warn("Session date is in the future, ignoring");
    return {
      newStreak: streakData.currentStreak,
      streakMaintained: false,
      streakBroken: false,
      newLongestStreak: false,
    };
  }

  return {
    newStreak,
    streakMaintained,
    streakBroken,
    newLongestStreak: newStreak > streakData.longestStreak,
  };
}
