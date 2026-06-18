import type {
  SessionState,
  FocusQualityMetrics,
} from '../types';
import { getSessionModeConfig } from '../modes';
import {
  calculateConsistencyScore,
  calculateRecoveryScore,
} from './scoring/scoring-helpers';

export function calculateFocusQuality(
  session: SessionState,
  interruptions: Array<{
    duration: number;
    severity: string;
    autoRecovered?: boolean;
  }>,
): FocusQualityMetrics {
  const now = Date.now();
  const sessionDuration = session.config.duration * 1000;
  const modeConfig = getSessionModeConfig(session.config.sessionMode);
  let timeInDeepFocus = sessionDuration;
  let timeInShallowFocus = 0;
  let timeDistracted = 0;

  for (const it of interruptions) {
    if (it.severity === 'CRITICAL' || it.severity === 'MAJOR') {
      timeDistracted += it.duration;
      timeInDeepFocus -= it.duration;
    } else if (it.severity === 'MODERATE') {
      timeInShallowFocus += it.duration;
      timeInDeepFocus -= it.duration;
    } else {
      timeInShallowFocus += it.duration * 0.5;
      timeInDeepFocus -= it.duration * 0.5;
    }
  }
  timeInDeepFocus = Math.max(0, timeInDeepFocus);
  const consistencyScore = calculateConsistencyScore(
    interruptions,
    sessionDuration,
  );
  const depthScore = Math.min(100, (timeInDeepFocus / sessionDuration) * 100);
  const recoveryScore = calculateRecoveryScore(interruptions);
  const overallScore = Math.round(
    consistencyScore * modeConfig.scoringWeights.consistency +
      depthScore * modeConfig.scoringWeights.depth +
      recoveryScore * modeConfig.scoringWeights.recovery,
  );
  return {
    sessionId: session.id,
    timeInDeepFocus,
    timeInShallowFocus,
    timeDistracted,
    focusSegments: [],
    consistencyScore,
    depthScore,
    recoveryScore,
    overallScore,
    calculatedAt: now,
  };
}

export function calculateFocusPurityScore(session: SessionState): number {
  const sessionStart = session.startedAt ?? session.createdAt;
  const sessionEnd = session.endedAt ?? Date.now();
  const totalSessionTime = Math.max(0, sessionEnd - sessionStart);
  const elapsedFocusTime = Math.max(0, totalSessionTime - session.pausedTime);
  return totalSessionTime <= 0
    ? 100
    : Math.round((elapsedFocusTime / totalSessionTime) * 100);
}
