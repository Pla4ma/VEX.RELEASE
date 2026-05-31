import type { SessionValidationInput } from './anti-cheat-types';
import type { AntiCheatFlag } from '../types';
import {
  THRESHOLDS,
} from './AntiCheatConfig';

type FlagFn = (
  type: AntiCheatFlag['type'],
  severity: AntiCheatFlag['severity'],
  evidence: Record<string, unknown>,
) => void;

export function validateSession(
  session: SessionValidationInput,
  flagViolation: FlagFn,
): void {
  if (session.endedAt && session.startedAt) {
    const realDuration = session.endedAt - session.startedAt;
    if (realDuration > THRESHOLDS.MAX_SESSION_DURATION)
      {flagViolation('IMPOSSIBLE_DURATION', 'CRITICAL', {
        duration: realDuration,
        maxAllowed: THRESHOLDS.MAX_SESSION_DURATION,
      });}
    if (
      realDuration < THRESHOLDS.MIN_SESSION_DURATION &&
      session.completionPercentage > 50
    )
      {flagViolation('RAPID_COMPLETION', 'CRITICAL', {
        duration: realDuration,
        completion: session.completionPercentage,
      });}
    if (session.completionPercentage >= 100) {
      const speedRatio =
        (session.config.duration * 1000) / session.effectiveTime;
      if (speedRatio > THRESHOLDS.MAX_COMPLETION_SPEED)
        {flagViolation('RAPID_COMPLETION', 'MODERATE', {
          speedRatio,
          expectedDuration: session.config.duration * 1000,
          actualEffectiveTime: session.effectiveTime,
        });}
    }
  }
  const totalTime =
    (session.endedAt || Date.now()) - (session.startedAt || Date.now());
  const pauseRatio = totalTime > 0 ? session.pausedTime / totalTime : 0;
  if (
    pauseRatio > THRESHOLDS.MAX_PAUSE_RATIO &&
    session.completionPercentage >= 90
  ) {
    flagViolation('SUSPICIOUS_PATTERN', 'WARNING', {
      reason: 'High pause ratio with high completion',
      pauseRatio,
      completion: session.completionPercentage,
    });
  }
}

export function validateDataConsistency(
  session: SessionValidationInput,
  flagViolation: FlagFn,
): void {
  const expectedTotal = session.elapsedTime + session.remainingTime;
  const actualTotal = session.config.duration * 1000;
  if (
    Math.abs(expectedTotal - actualTotal) >
    THRESHOLDS.TIME_ACCOUNTING_TOLERANCE_MS
  ) {
    flagViolation('INCONSISTENT_DATA', 'MODERATE', {
      reason: 'Time accounting mismatch',
      expectedTotal,
      actualTotal,
      elapsed: session.elapsedTime,
      remaining: session.remainingTime,
    });
  }
  if (session.intervalsCompleted > 0) {
    const expectedTimeFromIntervals =
      session.intervalsCompleted * session.config.duration * 1000;
    if (
      Math.abs(session.effectiveTime - expectedTimeFromIntervals) >
      session.config.duration *
        1000 *
        THRESHOLDS.INTERVAL_TIME_DISCREPANCY_RATIO
    ) {
      flagViolation('INCONSISTENT_DATA', 'WARNING', {
        reason: 'Interval count mismatch',
        intervals: session.intervalsCompleted,
        expectedTime: expectedTimeFromIntervals,
        actualTime: session.effectiveTime,
      });
    }
  }
  if (
    session.pauses > 0 &&
    session.pausedTime < THRESHOLDS.MIN_PAUSE_TIME_MS
  ) {
    flagViolation('SUSPICIOUS_PATTERN', 'WARNING', {
      reason: 'Multiple pauses with minimal pause time',
      pauses: session.pauses,
      pausedTime: session.pausedTime,
    });
  }
}
