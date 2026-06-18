import type { TimeProgressMetrics } from '../types';

export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  MAX_SESSION_DURATION_SECONDS: 28800,
  MIN_SESSION_DURATION_SECONDS: 60,
  DEFAULT_WARNING_THRESHOLDS: [300, 60, 10],
} as const;

export function calculateElapsedTime(
  startTime: number,
  currentTime: number,
  pausedDuration: number = 0,
): number {
  if (startTime <= 0) {
    return 0;
  }
  if (currentTime < startTime) {
    return 0;
  }
  const rawElapsed = Math.floor(
    (currentTime - startTime) / TIME_CONSTANTS.MILLISECONDS_PER_SECOND,
  );
  return Math.max(0, rawElapsed - pausedDuration);
}

export function calculateRemainingTime(
  duration: number,
  elapsedTime: number,
): number {
  const remaining = duration - elapsedTime;
  return Math.max(0, remaining);
}

export function calculateCompletionPercentage(
  elapsed: number,
  duration: number,
): number {
  if (duration <= 0) {
    return 0;
  }
  const percentage = (elapsed / duration) * 100;
  return Math.min(100, Math.max(0, percentage));
}

export function calculateEffectiveTime(
  elapsed: number,
  interruptions: number,
  interruptionPenaltySeconds: number = 30,
): number {
  const penalty = interruptions * interruptionPenaltySeconds;
  return Math.max(0, elapsed - penalty);
}

export function calculateProgressMetrics(
  elapsed: number,
  remaining: number,
  duration: number,
  phase: string,
  interval: number,
): TimeProgressMetrics {
  const percentage = calculateCompletionPercentage(elapsed, duration);
  const isComplete = percentage >= 100;
  const isNearComplete = remaining <= 60;
  const progressRatio = duration > 0 ? elapsed / duration : 0;
  return {
    elapsed,
    remaining,
    duration,
    percentage,
    isComplete,
    isNearComplete,
    progressRatio,
    phase,
    interval,
    estimatedCompletionTime:
      Date.now() + remaining * TIME_CONSTANTS.MILLISECONDS_PER_SECOND,
  };
}

export function shouldTriggerWarning(
  remaining: number,
  previousRemaining: number,
  thresholds: readonly number[] = TIME_CONSTANTS.DEFAULT_WARNING_THRESHOLDS,
): number | null {
  for (const threshold of thresholds) {
    if (previousRemaining > threshold && remaining <= threshold) {
      return threshold;
    }
  }
  return null;
}

export function getTimeStatus(
  elapsed: number,
  duration: number,
  isPaused: boolean,
): 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETE' | 'OVERDUE' {
  if (elapsed <= 0 && !isPaused) {
    return 'PENDING';
  }
  if (isPaused) {
    return 'PAUSED';
  }
  if (elapsed >= duration) {
    return 'COMPLETE';
  }
  if (elapsed > duration * 1.5) {
    return 'OVERDUE';
  }
  return 'ACTIVE';
}

export function calculateCurrentInterval(
  elapsed: number,
  focusDuration: number,
  breakDuration: number,
  longBreakDuration: number,
  intervalsBeforeLongBreak: number,
): {
  interval: number;
  phase: 'FOCUS' | 'BREAK' | 'LONG_BREAK';
  timeInPhase: number;
} {
  let timeRemaining = elapsed;
  let interval = 1;
  let phase: 'FOCUS' | 'BREAK' | 'LONG_BREAK' = 'FOCUS';
  let timeInPhase = 0;
  while (timeRemaining > 0) {
    const isLongBreakInterval =
      interval % intervalsBeforeLongBreak === 0 && interval > 0;
    if (timeRemaining >= focusDuration) {
      timeRemaining -= focusDuration;
      interval++;
      const currentBreakDuration = isLongBreakInterval
        ? longBreakDuration
        : breakDuration;
      if (timeRemaining >= currentBreakDuration) {
        timeRemaining -= currentBreakDuration;
      } else {
        phase = isLongBreakInterval ? 'LONG_BREAK' : 'BREAK';
        timeInPhase = timeRemaining;
        timeRemaining = 0;
      }
    } else {
      phase = 'FOCUS';
      timeInPhase = timeRemaining;
      timeRemaining = 0;
    }
  }
  return { interval: Math.max(1, interval), phase, timeInPhase };
}
