/**
 * Streak Gamble Logic
 * Pure functions and hooks for gamble decision logic.
 */

import * as Sentry from '@sentry/react-native';
import { getAnalyticsService } from '@/analytics/AnalyticsService';
import { CRITICAL_HOURS_THRESHOLD, GAMBLE_BONUS_XP, type GambleOutcome } from './gamble-types';

// ============================================================================
// Risk Assessment
// ============================================================================

export interface RiskColors {
  error: string;
  warning: string;
}

export function getRiskText(
  hours: number,
  colors: RiskColors
): { text: string; color: string } {
  if (hours < 1) {
    return { text: 'CRITICAL - About to break!', color: colors.error };
  }
  if (hours < 2) {
    return { text: 'HIGH RISK', color: colors.error };
  }
  return { text: 'AT RISK', color: colors.warning };
}

// ============================================================================
// Outcome Calculation
// ============================================================================

export function calculateGambleOutcome(
  grade: string,
  success: boolean,
  userLevel: number
): GambleOutcome {
  return {
    success,
    grade,
    xpEarned: success ? GAMBLE_BONUS_XP + userLevel * 2 : 0,
    shieldPreserved: success,
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useShouldShowGamblePrompt(
  hoursRemaining: number,
  shieldsAvailable: number,
  hasPromptedToday: boolean
): boolean {
  return (
    hoursRemaining < CRITICAL_HOURS_THRESHOLD &&
    (shieldsAvailable > 0 || !hasPromptedToday) &&
    !hasPromptedToday
  );
}

// ============================================================================
// Analytics
// ============================================================================

export function trackStreakGambleDecision(
  userId: string,
  decision: 'shield' | 'gamble' | 'dismiss',
  streakDays: number,
  hoursRemaining: number
): void {
  Sentry.addBreadcrumb({
    category: 'streaks',
    message: `Streak gamble decision: ${decision}`,
    level: 'info',
    data: { userId, decision, streakDays, hoursRemaining },
  });

  getAnalyticsService().track('streak_gamble_decision', {
    user_id: userId,
    decision,
    streak_days: streakDays,
    hours_remaining: hoursRemaining,
  });
}
