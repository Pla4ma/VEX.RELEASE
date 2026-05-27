/**
 * useStreakDefense Hook
 *
 * Returns streak defense state and actions for the home screen.
 * Handles freeze eligibility, grace uses remaining, and next qualifying window.
 *
 * @phase 2.7
 */

import { useMemo } from "react";
import { useStreakSummary } from "../../../features/streaks/hooks";

export interface StreakDefenseState {
  /** Whether user can freeze streak today */
  canFreeze: boolean;
  /** Whether user has already frozen today */
  hasFrozenToday: boolean;
  /** Number of grace uses remaining */
  graceUsesRemaining: number;
  /** Maximum grace uses allowed */
  maxGraceUses: number;
  /** Hours remaining until streak breaks (null if safe) */
  hoursLeft: number | null;
  /** Next time window when a session qualifies for streak */
  nextQualifyingWindow: {
    /** Hours until window opens */
    hoursUntilOpen: number;
    /** Human-readable time (e.g., "6:00 PM") */
    timeLabel: string;
  } | null;
  /** Whether streak is currently at risk (< 12h remaining) */
  isAtRisk: boolean;
  /** Risk level: NONE, LOW, MEDIUM, HIGH, CRITICAL */
  riskLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Whether weekend mode is active (streak doesn't count weekends) */
  isWeekendMode: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Calculate hours remaining until streak deadline
 */
function calculateHoursRemaining(
  nextDeadline: number | null | undefined,
): number | null {
  if (!nextDeadline) {
    return null;
  }
  const now = Date.now();
  const diffMs = nextDeadline - now;
  if (diffMs <= 0) {
    return 0;
  }
  return Math.floor(diffMs / (1000 * 60 * 60));
}

/**
 * Calculate next qualifying window based on timezone and preferences
 */
function calculateQualifyingWindow(
  hoursRemaining: number | null,
  timezone: string,
): { hoursUntilOpen: number; timeLabel: string } | null {
  if (hoursRemaining === null || hoursRemaining > 12) {
    return null;
  }

  // If less than 12h, suggest next morning 6 AM
  const now = new Date();
  const tomorrow6am = new Date(now);
  tomorrow6am.setDate(tomorrow6am.getDate() + 1);
  tomorrow6am.setHours(6, 0, 0, 0);

  const hoursUntilOpen = Math.floor(
    (tomorrow6am.getTime() - now.getTime()) / (1000 * 60 * 60),
  );

  return {
    hoursUntilOpen,
    timeLabel: "6:00 AM tomorrow",
  };
}

/**
 * Hook for streak defense information
 *
 * @example
 * const { canFreeze, hoursLeft, riskLevel, graceUsesRemaining } = useStreakDefense();
 *
 * if (riskLevel === 'CRITICAL') {
 *   showUrgentBanner();
 * }
 */
export function useStreakDefense(userId: string | null): StreakDefenseState {
  const {
    data: streakSummary,
    isLoading,
    error,
  } = useStreakSummary(userId ?? "");

  return useMemo(() => {
    if (!streakSummary || !userId) {
      return {
        canFreeze: false,
        hasFrozenToday: false,
        graceUsesRemaining: 0,
        maxGraceUses: 3,
        hoursLeft: null,
        nextQualifyingWindow: null,
        isAtRisk: false,
        riskLevel: "NONE",
        isWeekendMode: false,
        isLoading,
        error,
      };
    }

    const hoursLeft = calculateHoursRemaining(streakSummary.nextDeadline);
    const isAtRisk = streakSummary.isAtRisk;

    // Determine risk level
    let riskLevel: StreakDefenseState["riskLevel"] = streakSummary.riskLevel;
    if (hoursLeft !== null && riskLevel === "NONE") {
      if (hoursLeft <= 1) {
        riskLevel = "CRITICAL";
      } else if (hoursLeft <= 4) {
        riskLevel = "HIGH";
      } else if (hoursLeft <= 8) {
        riskLevel = "MEDIUM";
      } else if (hoursLeft < 12) {
        riskLevel = "LOW";
      }
    }

    // Can freeze if shield is available and streak > 0
    const canFreeze =
      streakSummary.currentDays > 0 && streakSummary.shieldAvailable;

    return {
      canFreeze,
      hasFrozenToday:
        !streakSummary.shieldAvailable && streakSummary.currentDays > 0,
      graceUsesRemaining: streakSummary.shieldAvailable ? 1 : 0,
      maxGraceUses: 1, // One shield per day
      hoursLeft,
      nextQualifyingWindow: calculateQualifyingWindow(hoursLeft, "UTC"),
      isAtRisk,
      riskLevel,
      isWeekendMode: false,
      isLoading,
      error,
    };
  }, [streakSummary, userId, isLoading, error]);
}

export default useStreakDefense;
