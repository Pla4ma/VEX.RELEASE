/**
 * AI Coach <-> Streaks/Sessions Integration
 *
 * Wires typed streak/session events into the coach trigger pipeline.
 */

import { getAnalyticsService } from '../analytics';
import { eventBus } from '../events';

const analytics = getAnalyticsService();

/**
 * Initialize AI coach integration
 */
export function initializeAICoachIntegration(): () => void {
  const unsubscribeStreakBroken = eventBus.subscribe(
    'streak:broken',
    async (event) => {
      await handleStreakBroken(event.userId, event.previousStreak);
    }
  );

  const unsubscribeStreakMilestone = eventBus.subscribe(
    'social:streak_milestone',
    async (event) => {
      await handleStreakMilestone(event.userId, event.streak);
    }
  );

  const unsubscribeSessionAbandoned = eventBus.subscribe(
    'session:abandoned',
    async (event) => {
      await handleSessionAbandoned(event.userId, event.elapsedTime);
    }
  );

  return () => {
    unsubscribeStreakBroken();
    unsubscribeStreakMilestone();
    unsubscribeSessionAbandoned();
  };
}

async function handleStreakBroken(
  userId: string,
  previousStreak: number
): Promise<void> {
  if (previousStreak <= 3) {
    return;
  }

  eventBus.publish('coach:trigger', {
    userId,
    trigger: 'comeback_opportunity',
    data: { previousStreak },
  });

  analytics.track('streak_broken_intervention', {
    userId,
    previousStreak,
  });
}

async function handleStreakMilestone(
  userId: string,
  streakDays: number
): Promise<void> {
  if (streakDays !== 7 && streakDays !== 30) {
    return;
  }

  eventBus.publish('notification:send', {
    userId,
    type: 'streak_milestone',
    title: `${streakDays}-day streak`,
    body: `You just hit a ${streakDays}-day streak. Keep it rolling.`,
    data: { streakDays },
  });
}

async function handleSessionAbandoned(
  userId: string,
  elapsedTime: number
): Promise<void> {
  if (elapsedTime < 3 * 60) {
    return;
  }

  eventBus.publish('coach:trigger', {
    userId,
    trigger: 'session_abandoned',
    data: { elapsedTime },
  });
}
