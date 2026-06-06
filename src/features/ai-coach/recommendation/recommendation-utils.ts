import type { ContextSnapshot } from '../session/context-snapshot';
import type { RecommendationEvidence } from '../../focus-memory/schemas';
import type { CoachRecommendation } from './recommendation-pipeline-types';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('ai-coach:recommendation-utils');

export function filterActiveRecommendations(
  recommendations: CoachRecommendation[],
): CoachRecommendation[] {
  const now = Date.now();
  return recommendations.filter((r) => r.expiresAt > now);
}

export function getTopRecommendation(
  recommendations: CoachRecommendation[],
): CoachRecommendation | null {
  const active = filterActiveRecommendations(recommendations);
  return active.length > 0 ? active[0]! : null;
}

export function isRecommendationRelevant(
  recommendation: CoachRecommendation,
  context: ContextSnapshot,
): boolean {
  if (recommendation.expiresAt < Date.now()) {
    return false;
  }
  if (
    recommendation.type === 'session' &&
    context.sessionContext.activeSession
  ) {
    return false;
  }
  if (
    recommendation.type === 'break' &&
    context.progressContext.sessionsThisWeek < 5
  ) {
    return false;
  }
  if (recommendation.type === 'social' && !context.socialContext.hasSquad) {
    return false;
  }
  return true;
}

export function formatRecommendation(recommendation: CoachRecommendation): {
  title: string;
  subtitle: string;
  cta: string;
} {
  const difficultyLabels = {
    easy: 'Easy Start',
    normal: 'Standard',
    challenging: 'Challenge',
    push: 'Push Mode',
  };
  let cta = 'Start Session';
  if (recommendation.actionType === 'take_break') {
    cta = 'Take Break';
  } else if (recommendation.actionType === 'join_squad') {
    cta = 'View Squad';
  } else if (recommendation.suggestedDifficulty) {
    cta = `${difficultyLabels[recommendation.suggestedDifficulty]} (${recommendation.suggestedDuration}m)`;
  }
  return {
    title: recommendation.title,
    subtitle: recommendation.description,
    cta,
  };
}

export async function trackRecommendationInteraction(
  recommendationId: string,
  userId: string,
  action: 'viewed' | 'accepted' | 'dismissed' | 'expired',
): Promise<void> {
  debug.info(
    'Recommendation %s %s by user %s',
    recommendationId,
    action,
    userId,
  );
}

export function batchProcessRecommendations(
  recommendations: CoachRecommendation[],
): {
  critical: CoachRecommendation[];
  high: CoachRecommendation[];
  medium: CoachRecommendation[];
  low: CoachRecommendation[];
} {
  return {
    critical: recommendations.filter((r) => r.priority === 'critical'),
    high: recommendations.filter((r) => r.priority === 'high'),
    medium: recommendations.filter((r) => r.priority === 'medium'),
    low: recommendations.filter((r) => r.priority === 'low'),
  };
}

export function attachRecommendationEvidence(
  recommendations: CoachRecommendation[],
  evidence: RecommendationEvidence | null,
  sessionCount: number,
): CoachRecommendation[] {
  return recommendations.map((rec) => {
    if (evidence && sessionCount >= 3) {
      return { ...rec, evidence };
    }
    return {
      ...rec,
      evidence: {
        fallbackReason: sessionCount < 3 ? 'cold_start' : 'insufficient_data',
        source: 'cold_start',
        lane: 'minimal_normal',
      } as RecommendationEvidence,
    };
  });
}
