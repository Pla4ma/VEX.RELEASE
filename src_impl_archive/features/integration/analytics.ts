/**
 * Integration Analytics
 * Analytics tracking for cross-system operations
 */

import * as Sentry from '@sentry/react-native';

export function trackSystemError(
  system: string,
  operation: string,
  error: unknown
): void {
  Sentry.addBreadcrumb({
    message: `System error: ${system}.${operation}`,
    category: 'integration.error',
    data: {
      system,
      operation,
      error: error instanceof Error ? error.message : String(error),
    },
    level: 'error',
  });
}

export function trackOrchestrationError(
  userId: string,
  sessionId: string,
  error: unknown
): void {
  Sentry.addBreadcrumb({
    message: 'Session orchestration failed',
    category: 'integration.orchestration',
    data: { userId, sessionId },
    level: 'error',
  });
}

export function trackSessionComplete(data: {
  sessionId: string;
  userId: string;
  duration: number;
  completionPercentage: number;
  xpAwarded: number;
  coinsAwarded: number;
  streakBonus: number;
  difficultyBonus: number;
  levelUp: boolean;
  achievementsUnlocked: number;
  challengesProgressed: number;
}): void {
  Sentry.addBreadcrumb({
    message: 'Session orchestration complete',
    category: 'integration.session',
    data,
    level: 'info',
  });
}
