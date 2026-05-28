import type { TimerState } from "../types";
import type { SerializedTimerState, TimerCallbacks } from "./timer-types";
import type { TimerConfig } from "../types";
import { TimerEngineBase, debug } from "./timer-engine-core";

export class TimerEngine extends TimerEngineBase {
  getState(): TimerState {
    return { ...this.state };
  }

  getElapsedTime(): number {
    return this.elapsed;
  }

  getRemainingTime(): number {
    return Math.max(0, this.duration - this.elapsed);
  }

  getRemainingSeconds(): number {
    return Math.ceil(this.getRemainingTime() / 1000);
  }

  getElapsedSeconds(): number {
    return Math.floor(this.elapsed / 1000);
  }

  getPercentageComplete(): number {
    return Math.min(100, (this.elapsed / this.duration) * 100);
  }

  isRunning(): boolean {
    return this.state.isRunning;
  }

  isPaused(): boolean {
    return this.state.isPaused;
  }

  getIsBackgrounded(): boolean {
    return this.isBackgrounded;
  }

  adjustTime(deltaMs: number): void {
    this.elapsed = Math.max(0, this.elapsed + deltaMs);
    debug.debug("Timer adjusted for session %s: %dms", this.sessionId, deltaMs);
  }

  setTime(elapsedMs: number): void {
    this.elapsed = Math.max(0, Math.min(this.duration, elapsedMs));
    debug.debug(
      "Timer set for session %s: %dms elapsed",
      this.sessionId,
      elapsedMs,
    );
  }

  addTime(additionalMs: number): void {
    this.duration += additionalMs;
    debug.debug(
      "Timer extended for session %s: +%dms",
      this.sessionId,
      additionalMs,
    );
  }

  serialize(): SerializedTimerState {
    return {
      elapsed: this.elapsed,
      duration: this.duration,
      isRunning: this.state.isRunning,
      isPaused: this.state.isPaused,
      totalPausedTime: this.state.totalPausedTime,
      warningSent: Array.from(this.warningSent),
    };
  }

  restore(state: SerializedTimerState): void {
    this.elapsed = state.elapsed;
    this.duration = state.duration;
    this.state.isRunning = state.isRunning;
    this.state.isPaused = state.isPaused;
    this.state.totalPausedTime = state.totalPausedTime;
    this.warningSent = new Set(state.warningSent);
    if (this.state.isRunning && !this.state.isPaused)
      this.intervals.startTickInterval();
    debug.info("Timer restored for session %s", this.sessionId);
  }
}

export { TimerEngineBase } from "./timer-engine-core";

export function createTimerEngine(
  sessionId: string,
  duration: number,
  config: Partial<TimerConfig>,
  callbacks: TimerCallbacks,
): TimerEngine {
  return new TimerEngine(sessionId, duration, config, callbacks);
}
