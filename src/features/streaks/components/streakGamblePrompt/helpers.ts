import * as Sentry from '@sentry/react-native';
import { getAnalyticsService } from '@/analytics/AnalyticsService';
import { CRITICAL_HOURS_THRESHOLD } from './types';

export interface RiskInfo {
  text: string;
  color: string;
}

export function getRiskText(
  hours: number,
  errorColor: string,
  warningColor: string,
): RiskInfo {
  if (hours < 1) {
    return { text: 'CRITICAL - About to break!', color: errorColor };
  }
  if (hours < 2) {
    return { text: 'HIGH RISK', color: errorColor };
  }
  return { text: 'AT RISK', color: warningColor };
}

export function trackStreakGambleDecision(
  userId: string,
  decision: 'shield' | 'gamble' | 'dismiss',
  streakDays: number,
  hoursRemaining: number,
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

export function useShouldShowGamblePrompt(
  hoursRemaining: number,
  shieldsAvailable: number,
  hasPromptedToday: boolean,
): boolean {
  return (
    hoursRemaining < CRITICAL_HOURS_THRESHOLD &&
    (shieldsAvailable > 0 || !hasPromptedToday) &&
    !hasPromptedToday
  );
}
