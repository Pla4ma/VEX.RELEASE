/**
 * Streaks Analytics
 * Sentry breadcrumbs and custom event tracking
 */

import * as Sentry from '@sentry/react-native';

// ============================================================================
// Event Tracking Functions
// ============================================================================

export function trackStreakIncremented(
  userId: string,
  previousStreak: number,
  newStreak: number
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Streak incremented: ${previousStreak} → ${newStreak}`,
    data: {
      userId,
      previousStreak,
      newStreak,
    },
    level: 'info',
  });
}

export function trackStreakBroken(
  userId: string,
  previousStreak: number,
  wasComeback: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Streak broken after ${previousStreak} days`,
    data: {
      userId,
      previousStreak,
      wasComeback,
    },
    level: 'warning',
  });
}

export function trackMilestoneReached(
  userId: string,
  milestoneDays: number,
  rewardType: string
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Milestone reached: ${milestoneDays} days`,
    data: {
      userId,
      milestoneDays,
      rewardType,
    },
    level: 'info',
  });
}

export function trackShieldUsed(
  userId: string,
  reason: string,
  remainingShields: number
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Streak shield used: ${reason}`,
    data: {
      userId,
      reason,
      remainingShields,
    },
    level: 'info',
  });
}

export function trackComebackDetected(
  userId: string,
  daysInactive: number
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Comeback detected after ${daysInactive} days`,
    data: {
      userId,
      daysInactive,
    },
    level: 'info',
  });
}

export function trackStreakError(
  operation: string,
  error: unknown,
  userId?: string
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Streak error: ${operation}`,
    data: {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    level: 'error',
  });
}
