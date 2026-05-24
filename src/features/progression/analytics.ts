/**
 * Progression Analytics
 * Sentry breadcrumbs and custom event tracking
 */

import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';

// ============================================================================
// Event Tracking Functions
// ============================================================================

export function trackXpAdded(
  userId: string,
  amount: number,
  source: string,
  level: number
): void {
  Sentry.addBreadcrumb({
    category: 'progression',
    message: 'XP added',
    data: {
      userId,
      amount,
      source,
      level,
    },
    level: 'info',
  });
}

export function trackLevelUp(
  userId: string,
  newLevel: number,
  previousLevel: number,
  totalXp: number
): void {
  Sentry.addBreadcrumb({
    category: 'progression',
    message: `Level up: ${previousLevel} → ${newLevel}`,
    data: {
      userId,
      newLevel,
      previousLevel,
      totalXp,
    },
    level: 'info',
  });
}

export function trackProgressionError(
  operation: string,
  error: unknown,
  userId?: string
): void {
  Sentry.addBreadcrumb({
    category: 'progression',
    message: `Progression error: ${operation}`,
    data: {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    level: 'error',
  });
}

// ============================================================================
// Event Listeners
// ============================================================================

export function setupProgressionAnalytics(): () => void {
  const unsubscribeXpAdded = eventBus.subscribe('progression:xp_added', (event) => {
    trackXpAdded(
      event.userId,
      event.amount,
      event.source,
      event.currentLevel
    );
  });

  const unsubscribeLevelUp = eventBus.subscribe('progression:level_up', (event) => {
    trackLevelUp(
      event.userId,
      event.newLevel,
      event.previousLevel,
      event.totalXP
    );
  });

  return () => {
    unsubscribeXpAdded();
    unsubscribeLevelUp();
  };
}
