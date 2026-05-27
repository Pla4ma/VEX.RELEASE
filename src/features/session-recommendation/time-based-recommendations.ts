/**
 * Time-Based Recommendations
 *
 * Handles time-of-day based session recommendations.
 */

import type { SessionMode } from "./schemas";

/**
 * Gets recommendation based on time of day
 */
export function getTimeBasedRecommendation(
  hourOfDay: number,
): { duration: number; mode: SessionMode; reason: string } | null {
  // Early morning (5-8): Short, gentle sessions
  if (hourOfDay >= 5 && hourOfDay < 8) {
    return {
      duration: 15,
      mode: "RECOVERY",
      reason: "Morning gentle start: 15 minutes to ease into the day",
    };
  }

  // Peak focus hours (9-11): Optimal sessions
  if (hourOfDay >= 9 && hourOfDay < 11) {
    return {
      duration: 45,
      mode: "FOCUS",
      reason: "Peak focus time: 45 minutes for maximum productivity",
    };
  }

  // Afternoon slump (13-15): Recovery sessions
  if (hourOfDay >= 13 && hourOfDay < 15) {
    return {
      duration: 20,
      mode: "RECOVERY",
      reason: "Afternoon recovery: 20 minutes to regain focus",
    };
  }

  // Evening focus (19-21): Standard sessions
  if (hourOfDay >= 19 && hourOfDay < 21) {
    return {
      duration: 30,
      mode: "FOCUS",
      reason: "Evening focus: 30 minutes to end the day productively",
    };
  }

  // Late night (21-23): Short sessions
  if (hourOfDay >= 21 && hourOfDay < 23) {
    return {
      duration: 15,
      mode: "HABIT_BUILD",
      reason: "Late night habit: 15 minutes to maintain consistency",
    };
  }

  return null; // No specific time-based recommendation
}
