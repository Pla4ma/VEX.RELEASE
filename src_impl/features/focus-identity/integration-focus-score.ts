import * as Sentry from '@sentry/react-native';
import { queryClient } from '../../api';
import { eventBus } from '../../events';
import { capture } from '../../shared/analytics/analytics-service';
import { focusScoreKeys } from './focus-score-query-keys';
import {
  appendFocusScoreHistory,
  fetchCurrentFocusScore,
  upsertCurrentFocusScore,
} from './repository-focus-score';
import { calculateFocusScoreUpdate } from './score-algorithm';
import { getCompletionSignal } from '../focus-contract/service';

function readGrade(summary: unknown): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (!summary || typeof summary !== 'object') {return 'B';}
  const value = Reflect.get(summary, 'grade');
  if (value === 'S' || value === 'A' || value === 'B' || value === 'C' || value === 'D') {
    return value;
  }
  return 'B';
}

function readSessionMode(summary: unknown): 'deep_work' | 'recovery' | 'starter' | 'standard' {
  if (!summary || typeof summary !== 'object') {return 'standard';}
  const value = Reflect.get(summary, 'mode');
  if (value === 'deep_work' || value === 'recovery' || value === 'starter' || value === 'standard') {
    return value;
  }
  return 'standard';
}

function buildSignals(summary: unknown): {
  consistency: number;
  streakStability: number;
  sessionQuality: number;
  intentionalDifficulty: number;
  recency: number;
} {
  if (!summary || typeof summary !== 'object') {
    return { consistency: 55, streakStability: 50, sessionQuality: 60, intentionalDifficulty: 50, recency: 70 };
  }
  const qualityRaw = Reflect.get(summary, 'quality');
  const quality = typeof qualityRaw === 'number' ? Math.max(0, Math.min(100, qualityRaw)) : 70;
  const streakRaw = Reflect.get(summary, 'streakDays');
  const streakDays = typeof streakRaw === 'number' ? streakRaw : 0;
  const interruptionsRaw = Reflect.get(summary, 'interruptions');
  const interruptions = typeof interruptionsRaw === 'number' ? interruptionsRaw : 0;

  return {
    consistency: Math.max(0, Math.min(100, 62 - interruptions * 4)),
    streakStability: Math.max(0, Math.min(100, 45 + streakDays * 3)),
    sessionQuality: quality,
    intentionalDifficulty: readSessionMode(summary) === 'deep_work' ? 72 : 55,
    recency: Math.max(0, Math.min(100, 30 + streakDays * 5)),
  };
}

export function initializeFocusScoreIntegration(): () => void {
  const unsubscribe = eventBus.subscribe('session:completed', async (event) => {
    const userId = event.userId;
    if (!userId) {return;}

    try {
      const existing = await fetchCurrentFocusScore(userId);
      const previousScore = existing?.currentScore ?? 550;
      const contractSignal = await getCompletionSignal(userId, 14);
      const result = calculateFocusScoreUpdate({
        userId,
        previousScore,
        eventType: 'session:completed',
        grade: readGrade(event.summary),
        sessionMode: readSessionMode(event.summary),
        contractCompletionRate: contractSignal.rate,
        completedContractCount: contractSignal.completedContractCount,
        occurredAt: new Date(event.timestamp || Date.now()).toISOString(),
        signals: buildSignals(event.summary),
      });

      await upsertCurrentFocusScore(userId, {
        currentScore: result.newScore,
        previousScore: result.previousScore,
        band: result.band,
        factors: result.factors,
        lastChangeReason: result.userFacingReason,
        topPositiveFactor: result.topPositiveFactor, // Add this
        topNegativeFactor: result.topNegativeFactor, // Add this
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
      void queryClient.invalidateQueries({ queryKey: focusScoreKeys.user(userId) });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'focus-identity', operation: 'session-completed-integration' },
      });
    }
  });

  return unsubscribe;
}
