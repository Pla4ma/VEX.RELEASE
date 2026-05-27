import type { TimerState, TimerConfig } from "../types";

export type { TimerState, TimerConfig };

export type TimerCallback = (
  elapsed: number,
  remaining: number,
  percentage: number,
) => void;

export type TimerCompleteCallback = () => void;

export type TimerWarningCallback = (secondsRemaining: number) => void;

export interface TimerCallbacks {
  onTick: TimerCallback;
  onComplete: TimerCompleteCallback;
  onWarning: TimerWarningCallback;
}

export interface SerializedTimerState {
  elapsed: number;
  duration: number;
  isRunning: boolean;
  isPaused: boolean;
  totalPausedTime: number;
  warningSent: number[];
}
