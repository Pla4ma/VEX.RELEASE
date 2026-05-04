/**
 * Social ↔ Competition Integration
 *
 * Wires social activity to competitive features.
 */

import { eventBus } from '../events';
import { getAnalyticsService } from '../analytics';

const analytics = getAnalyticsService();

/**
 * Initialize social-competition integration
 */
export function initializeSocialCompetitionIntegration(): () => void {
  // Listen for session completions
  const unsubscribeSession = eventBus.subscribe(
    'session:completed',
    async (event) => {
      const score = getSessionScore(event.summary, event.duration);
      await handleSessionComplete(event.userId, event.sessionId, score);
    }
  );

  // Listen for squad activities
  const unsubscribeSquad = eventBus.subscribe(
    'social:squad_activity',
    async (event) => {
      await handleSquadActivity(event.userId, event.squadId, event.activity.type, event.activity.xpEarned);
    }
  );

  return () => {
    unsubscribeSession();
    unsubscribeSquad();
  };
}

/**
 * Handle session completion
 */
async function handleSessionComplete(
  userId: string,
  sessionId: string,
  score: number
): Promise<void> {
  // Update leaderboards
  eventBus.publish('leaderboards:score_update', {
    userId,
    leaderboardId: 'session_score',
    score,
  });

  // Check for achievements
  if (score > 1000) {
    eventBus.publish('achievements:check', {
      userId,
      type: 'HIGH_SCORE',
      data: {
        sessionId,
        value: score,
      },
    });
  }

  analytics.track('session_completed_competitive', {
    userId,
    sessionId,
    score,
  });
}

/**
 * Handle squad activity
 */
async function handleSquadActivity(
  userId: string,
  squadId: string,
  activityType: string,
  score: number
): Promise<void> {
  // Update squad leaderboard
  eventBus.publish('squads:leaderboard_update', {
    squadId,
    userId,
    score,
  });

  // Progress squad challenges
  eventBus.publish('challenge:progress', {
    userId,
    challengeId: `squad:${activityType}`,
    progress: 1,
    target: 1,
    percent: 100,
  });
}

function getSessionScore(summary: unknown, fallbackDuration: number): number {
  if (summary && typeof summary === 'object') {
    const maybeScore = (summary as { xpEarned?: unknown }).xpEarned;
    if (typeof maybeScore === 'number') {
      return maybeScore;
    }
  }

  return fallbackDuration;
}
