import type { FocusQualityMetrics, SessionState } from '../types';
import type { SessionStatsResult } from './completion-types';

export function computeCompletionStats(
  session: SessionState,
  focusMetrics: FocusQualityMetrics,
): SessionStatsResult {
  if (session.endedAt == null || session.startedAt == null) {
    throw new Error(
      `Cannot compute completion stats: session ${session.id} is missing start/end timestamps`,
    );
  }
  const totalTime = session.endedAt - session.startedAt;
  const efficiency =
    totalTime > 0 ? (session.effectiveTime / totalTime) * 100 : 0;
  let focusRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
  if (focusMetrics.overallScore >= 90) {
    focusRating = 'EXCELLENT';
  } else if (focusMetrics.overallScore >= 75) {
    focusRating = 'GOOD';
  } else if (focusMetrics.overallScore >= 50) {
    focusRating = 'AVERAGE';
  } else {
    focusRating = 'NEEDS_IMPROVEMENT';
  }
  const productivity = Math.round(
    session.completionPercentage * 0.4 +
      efficiency * 0.3 +
      focusMetrics.overallScore * 0.3,
  );
  const recommendations: string[] = [];
  if (session.interruptions > 2) {
    recommendations.push('Try enabling Do Not Disturb to reduce interruptions');
  }
  if (session.pauses > 3) {
    recommendations.push(
      'Consider shorter sessions if you need frequent breaks',
    );
  }
  if (focusMetrics.overallScore < 70) {
    recommendations.push(
      'Try the "Preparation" phase to set clear goals before starting',
    );
  }
  if (session.completionPercentage < 100) {
    recommendations.push('Build consistency by completing full sessions');
  }
  return {
    efficiency: Math.round(efficiency),
    focusRating,
    productivity,
    recommendations,
  };
}
