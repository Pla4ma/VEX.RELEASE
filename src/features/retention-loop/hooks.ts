import { useMemo } from "react";
import type { JourneyState } from "./schemas";
import type { Lane } from "../lane-engine/types";
import { computeJourneyState } from "./service";

/**
 * Hook to derive retention journey state for the current user.
 * Wraps computeJourneyState with useMemo for component consumption.
 */
export function useRetentionDay(input: {
  userId: string;
  daysSinceOnboarding: number;
  completedSessions: number;
  hasCompletedToday: boolean;
  hasSeenMemoryInsight: boolean;
  lane: Lane;
  rescueCompleted: number;
  recentDismissals: number;
  inactivityDays: number;
  hasInsightReady: boolean;
}): JourneyState {
  return useMemo(
    () => computeJourneyState(input),
    [
      input.userId,
      input.daysSinceOnboarding,
      input.completedSessions,
      input.hasCompletedToday,
      input.hasSeenMemoryInsight,
      input.lane,
      input.rescueCompleted,
      input.recentDismissals,
      input.inactivityDays,
      input.hasInsightReady,
    ],
  );
}
