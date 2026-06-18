import type {
  TickRecord,
  TickValidationResult,
} from './anti-cheat-types';
import type { AntiCheatFlag } from '../types';
import {
  THRESHOLDS,
} from './AntiCheatConfig';

type FlagFn = (
  type: AntiCheatFlag['type'],
  severity: AntiCheatFlag['severity'],
  evidence: Record<string, unknown>,
) => void;

export function validateTick(
  tickHistory: TickRecord[],
  lastTickTime: number,
  elapsed: number,
  timestamp: number,
  flagViolation: FlagFn,
): TickValidationResult {
  const lastElapsed =
    tickHistory.length > 0
      ? tickHistory[tickHistory.length - 1]?.elapsed ?? 0 // ponytail: asserted non-null by tickHistory.length > 0 guard
      : null;
  const elapsedDelta = lastElapsed === null ? 0 : elapsed - lastElapsed;

  if (lastTickTime > 0) {
    const timeSinceLastTick = timestamp - lastTickTime;
    if (timeSinceLastTick < 0) {
      flagViolation('TIME_MANIPULATION', 'CRITICAL', {
        reason: 'Negative time delta',
        lastTick: lastTickTime,
        currentTick: timestamp,
        delta: timeSinceLastTick,
      });
      return { valid: false, warning: 'Time manipulation detected' };
    }
    if (
      timeSinceLastTick < THRESHOLDS.MIN_TICK_INTERVAL &&
      elapsedDelta > THRESHOLDS.MIN_TICK_INTERVAL
    ) {
      flagViolation('TIME_MANIPULATION', 'WARNING', {
        reason: 'Tick interval too short',
        expected: THRESHOLDS.MIN_TICK_INTERVAL,
        actual: timeSinceLastTick,
      });
      return { valid: false, warning: 'Suspicious tick timing' };
    }
    if (
      timeSinceLastTick > THRESHOLDS.MAX_TICK_INTERVAL * 2 &&
      timeSinceLastTick > THRESHOLDS.MAX_TIME_JUMP
    ) {
      flagViolation('TIME_MANIPULATION', 'MODERATE', {
        reason: 'Large time gap between ticks',
        gap: timeSinceLastTick,
      });
    }
  }
  if (lastElapsed !== null) {
    if (elapsedDelta < 0) {
      flagViolation('TIME_MANIPULATION', 'CRITICAL', {
        reason: 'Elapsed time decreased',
        previous: lastElapsed,
        current: elapsed,
      });
      return { valid: false, warning: 'Time regression detected' };
    }
    if (elapsedDelta > THRESHOLDS.MAX_TIME_JUMP) {
      flagViolation('TIME_MANIPULATION', 'MODERATE', {
        reason: 'Elapsed time jumped too far',
        delta: elapsedDelta,
      });
    }
  }
  return { valid: true };
}

export function validateTickPatterns(
  tickHistory: TickRecord[],
  flagViolation: FlagFn,
): void {
  if (tickHistory.length < THRESHOLDS.MIN_TICK_PATTERN_SAMPLE) {return;}
  const intervals: number[] = [];
  for (let i = 1; i < tickHistory.length; i++)
    {intervals.push(
      (tickHistory[i]?.timestamp ?? 0) - (tickHistory[i - 1]?.timestamp ?? 0),
    );}
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    intervals.length;
  const cv = variance / mean;
  if (
    cv < THRESHOLDS.MIN_FOCUS_VARIANCE &&
    intervals.length > THRESHOLDS.VARIANCE_SAMPLE_THRESHOLD
  ) {
    flagViolation('AUTOMATION_DETECTED', 'CRITICAL', {
      reason: 'Tick intervals too consistent',
      coefficientOfVariation: cv,
      sampleSize: intervals.length,
    });
  }
}
