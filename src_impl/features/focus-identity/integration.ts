import { eventBus } from '../../events';
import { queryClient } from '../../api/QueryProvider';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import * as repository from './repository-focus-score';
import * as analytics from './analytics';

/**
 * DEPRECATED: Non-canonical focus-identity integration.
 * The canonical focus score update path is through the session-completion
 * orchestrator's completion-subsystems.ts -> FocusIdentityService.updateScore().
 * This integration must only run when the orchestrator is not active.
 */

type SessionCompletedEvent = {
  userId?: string;
  ledger?: {
    userId?: string;
    grade?: string;
  };
};

function resolveUserId(event: SessionCompletedEvent): string | null {
  return event.userId ?? event.ledger?.userId ?? null;
}

function scoreDeltaForGrade(grade: string | undefined): number {
  if (grade === 'S') {
    return 15;
  }
  if (grade === 'A') {
    return 10;
  }
  if (grade === 'B') {
    return 7;
  }
  return 5;
}

export function initializeFocusIdentityIntegrations(): () => void {
  const availability = getAvailabilityFor('focus_session');
  if (!availability.canSubscribeToEvents) {
    return () => {};
  }

  return eventBus.subscribe('session:completed', async (event: SessionCompletedEvent) => {
    const userId = resolveUserId(event);
    if (!userId) {
      return;
    }

    const current = await repository.fetchCurrentFocusScore(userId);
    const previousScore = current?.currentScore ?? 550;
    const newScore = Math.min(850, previousScore + scoreDeltaForGrade(event.ledger?.grade));

    await repository.upsertCurrentFocusScore(userId, {
      currentScore: newScore,
      previousScore,
      band: newScore >= 580 ? 'Strong' : 'Good',
      factors: {
        consistency: { weightPercent: 35, score: 70, delta: 0, explanation: 'Session completed.' },
        streakStability: { weightPercent: 25, score: 70, delta: 0, explanation: 'Session completed.' },
        sessionQuality: { weightPercent: 20, score: 70, delta: newScore - previousScore, explanation: 'Session completed.' },
        intentionalDifficulty: { weightPercent: 7, score: 70, delta: 0, explanation: 'Session completed.' },
        contractCompletion: { weightPercent: 8, score: 50, delta: 0, explanation: 'Contract completion is neutral.' },
        recency: { weightPercent: 5, score: 70, delta: 0, explanation: 'Session completed.' },
      },
      lastChangeReason: 'Session completed',
      topPositiveFactor: 'sessionQuality',
      topNegativeFactor: 'intentionalDifficulty',
    });
    await repository.appendFocusScoreHistory({
      userId,
      timestamp: new Date().toISOString(),
      score: newScore,
      delta: newScore - previousScore,
      reason: 'Session completed',
    });

    analytics.trackFocusScoreChanged({
      userId,
      previousScore,
      currentScore: newScore,
      reason: 'session_completed',
    });
    eventBus.publish('focus-identity:score_updated', { userId, previousScore, newScore, delta: newScore - previousScore, band: newScore >= 580 ? 'Strong' : 'Good', timestamp: Date.now() });
    queryClient.invalidateQueries({ queryKey: ['focus-score', userId, 'current'] });
    queryClient.invalidateQueries({ queryKey: ['focus-score', userId, 'history'] });
  });
}
