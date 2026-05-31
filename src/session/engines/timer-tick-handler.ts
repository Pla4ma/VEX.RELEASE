import { createDebugger } from '../../utils/debug';
import type { TimerConfig } from './timer-types';

const debug = createDebugger('session:timer');

export interface TickResult {
  elapsed: number;
  remaining: number;
  percentage: number;
  secondsRemaining: number;
  shouldWarn: boolean;
  shouldComplete: boolean;
  timestamp: number;
}

export function processTick(
  lastTickTime: number,
  elapsed: number,
  duration: number,
  alwaysWarn: boolean,
): TickResult {
  const now = Date.now();
  const timeSinceLastTick = now - lastTickTime;
  const newElapsed = elapsed + timeSinceLastTick;
  const remaining = Math.max(0, duration - newElapsed);
  const percentage = Math.min(100, (newElapsed / duration) * 100);
  const secondsRemaining = Math.ceil(remaining / 1000);

  return {
    elapsed: newElapsed,
    remaining,
    percentage,
    secondsRemaining,
    shouldWarn: alwaysWarn || remaining <= 60000,
    shouldComplete: newElapsed >= duration,
    timestamp: now,
  };
}

export function checkWarnings(
  secondsRemaining: number,
  thresholds: number[],
  warningSent: Set<number>,
  onWarning: (seconds: number) => void,
  sessionId: string,
): void {
  for (const threshold of thresholds) {
    if (secondsRemaining <= threshold && !warningSent.has(threshold)) {
      warningSent.add(threshold);
      onWarning(secondsRemaining);
      debug.debug(
        'Timer warning for session %s: %ds remaining',
        sessionId,
        secondsRemaining,
      );
    }
  }
}

export interface IntervalManager {
  startTickInterval(): void;
  stopTickInterval(): void;
  startBackgroundInterval(): void;
  stopBackgroundInterval(): void;
}

export function createIntervalManager(
  config: TimerConfig,
  onTick: () => void,
  onBackgroundTick: () => void,
): IntervalManager {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let backgroundIntervalId: ReturnType<typeof setInterval> | null = null;

  return {
    startTickInterval(): void {
      if (intervalId) {clearInterval(intervalId);}
      intervalId = setInterval(onTick, config.tickInterval);
      onTick();
    },
    stopTickInterval(): void {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    startBackgroundInterval(): void {
      if (backgroundIntervalId) {clearInterval(backgroundIntervalId);}
      backgroundIntervalId = setInterval(
        onBackgroundTick,
        config.backgroundTickInterval,
      );
    },
    stopBackgroundInterval(): void {
      if (backgroundIntervalId) {
        clearInterval(backgroundIntervalId);
        backgroundIntervalId = null;
      }
    },
  };
}
