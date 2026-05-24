import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import { capture } from '../../shared/analytics/analytics-service';
import { getCompletionSignal } from '../focus-contract/service';
import {
  fetchCurrentFocusScore,
  upsertCurrentFocusScore,
  appendFocusScoreHistory,
} from './repository-focus-score';
import { calculateFocusScoreUpdate } from './score-algorithm';

export interface SessionCompletionData {
  grade: string;
  sessionMode?: string;
  streakDays?: number;
  interruptions?: number;
  quality?: number;
  completedAt?: string;
}

function readGrade(grade: string): 'S' | 'A' | 'B' | 'C' | 'D' {
  const g = grade.toUpperCase();
  if (g === 'S' || g === 'A' || g === 'B' || g === 'C' || g === 'D') {
    return g;
  }
  return 'B';
}

function readSessionMode(sessionMode: string | undefined): 'deep_work' | 'recovery' | 'starter' | 'standard' {
  if (sessionMode === 'deep_work' || sessionMode === 'recovery' || sessionMode === 'starter' || sessionMode === 'standard') {
    return sessionMode;
  }
  return 'standard';
}

function buildSignals(data: SessionCompletionData): {
  consistency: number;
  streakStability: number;
  sessionQuality: number;
  intentionalDifficulty: number;
  recency: number;
} {
  const quality = typeof data.quality === 'number' ? Math.max(0, Math.min(100, data.quality)) : 70;
  const streakDays = data.streakDays ?? 0;
  const interruptions = data.interruptions ?? 0;

  return {
    consistency: Math.max(0, Math.min(100, 62 - interruptions * 4)),
    streakStability: Math.max(0, Math.min(100, 45 + streakDays * 3)),
    sessionQuality: quality,
    intentionalDifficulty: readSessionMode(data.sessionMode) === 'deep_work' ? 72 : 55,
    recency: Math.max(0, Math.min(100, 30 + streakDays * 5)),
  };
}

/**
 * Canonical focus score update for session completion.
 * Uses the full contract signal + calculateFocusScoreUpdate algorithm.
 * Called from the completion orchestrator's completion-subsystems.
 */
export async function updateFocusScoreFromSessionCompletion(
  userId: string,
  sessionData: SessionCompletionData,
): Promise<void> {
  try {
    const existing = await fetchCurrentFocusScore(userId);
    const previousScore = existing?.currentScore ?? 550;
    const contractSignal = await getCompletionSignal(userId, 14);
    const result = calculateFocusScoreUpdate({
      userId,
      previousScore,
      eventType: 'session:completed',
      grade: readGrade(sessionData.grade),
      sessionMode: readSessionMode(sessionData.sessionMode),
      contractCompletionRate: contractSignal.rate,
      completedContractCount: contractSignal.completedContractCount,
      occurredAt: sessionData.completedAt ?? new Date().toISOString(),
      signals: buildSignals(sessionData),
    });

    await upsertCurrentFocusScore(userId, {
      currentScore: result.newScore,
      previousScore: result.previousScore,
      band: result.band,
      factors: result.factors,
      lastChangeReason: result.userFacingReason,
      topPositiveFactor: result.topPositiveFactor,
      topNegativeFactor: result.topNegativeFactor,
    });
    await appendFocusScoreHistory({
      userId,
      timestamp: result.historyPoint.timestamp,
      score: result.historyPoint.score,
      delta: result.historyPoint.delta,
      reason: result.historyPoint.reason,
    });

    eventBus.publish('focus-identity:score_updated', {
      userId,
      previousScore: result.previousScore,
      newScore: result.newScore,
      delta: result.delta,
      band: result.band,
      timestamp: Date.now(),
    });
    capture('vex_focus_score_changed', {
      previous_score: result.previousScore,
      new_score: result.newScore,
      delta: result.delta,
      band: result.band,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'focus-identity', operation: 'updateFocusScoreFromSessionCompletion' },
    });
    throw error;
  }
}
