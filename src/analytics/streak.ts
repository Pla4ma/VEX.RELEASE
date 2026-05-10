/**
 * Streak Analytics
 *
 * Streak survival tracking and metrics
 */

import { StreakSurvivalMetrics } from './types';

let streakMetrics: StreakSurvivalMetrics = {
  userId: '',
  currentStreak: 0,
  longestStreak: 0,
  streakBreaks: 0,
  averageStreakLength: 0,
  streakSurvivalRate: 0,
  recoveryRate: 0, // Rate of restarting after break
};

/**
 * Track streak event
 */
export function trackStreakEvent(
  userId: string,
  event: 'start' | 'break' | 'protect' | 'milestone',
  data?: { length?: number; insuranceUsed?: boolean }
): void {
  // Update user context
  if (streakMetrics.userId !== userId) {
    streakMetrics.userId = userId;
  }

  switch (event) {
    case 'start':
      streakMetrics.currentStreak = 1;
      if (streakMetrics.currentStreak > streakMetrics.longestStreak) {
        streakMetrics.longestStreak = streakMetrics.currentStreak;
      }
      break;
    case 'break':
      if (streakMetrics.currentStreak > 0) {
        streakMetrics.streakBreaks++;
        streakMetrics.averageStreakLength = calculateAverageStreakLength();
        streakMetrics.currentStreak = 0;
      }
      break;
    case 'protect':
      // Streak was protected with insurance
      streakMetrics.recoveryRate = calculateRecoveryRate();
      break;
    case 'milestone':
      if (data?.length) {
        streakMetrics.currentStreak = data.length;
        if (streakMetrics.currentStreak > streakMetrics.longestStreak) {
          streakMetrics.longestStreak = streakMetrics.currentStreak;
        }
        // Update average
        streakMetrics.averageStreakLength = calculateAverageStreakLength();
      }
      break;
  }

  // Recalculate rates
  streakMetrics.streakSurvivalRate = calculateSurvivalRate();
}

/**
 * Get streak survival metrics
 */
export function getStreakSurvivalMetrics(): StreakSurvivalMetrics {
  return { ...streakMetrics };
}

/**
 * Reset streak metrics (for testing or new user)
 */
export function resetStreakMetrics(): void {
  streakMetrics = {
    userId: '',
    currentStreak: 0,
    longestStreak: 0,
    streakBreaks: 0,
    averageStreakLength: 0,
    streakSurvivalRate: 0,
    recoveryRate: 0,
  };
}

/**
 * Calculate streak survival rate
 */
function calculateSurvivalRate(): number {
  if (streakMetrics.streakBreaks === 0) {
    return streakMetrics.currentStreak > 0 ? 1.0 : 0.0;
  }

  const totalAttempts = streakMetrics.streakBreaks + (streakMetrics.currentStreak > 0 ? 1 : 0);
  return totalAttempts > 0 ? (totalAttempts - streakMetrics.streakBreaks) / totalAttempts : 0;
}

/**
 * Calculate average streak length
 */
function calculateAverageStreakLength(): number {
  if (streakMetrics.streakBreaks === 0) {
    return streakMetrics.currentStreak;
  }

  // This is a simplified calculation - in practice would track historical data
  return (streakMetrics.longestStreak + streakMetrics.currentStreak) / 2;
}

/**
 * Calculate recovery rate (rate of restarting after break)
 */
function calculateRecoveryRate(): number {
  if (streakMetrics.streakBreaks === 0) {
    return 0;
  }

  // Simplified: if current streak > 0, user recovered
  return streakMetrics.currentStreak > 0 ? 1.0 : 0.0;
}
