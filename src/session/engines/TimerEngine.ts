import type { TimerState, TimerConfig } from "../types";
import { createDebugger } from "../../utils/debug";
import type { TimerCallbacks, SerializedTimerState } from "./timer-types";
import {
  processTick, checkWarnings, createIntervalManager, type IntervalManager,
} from "./timer-tick-handler";

const debug = createDebugger("session:timer");

export class TimerEngine {
  private state: TimerState;
  private config: TimerConfig;
  private callbacks: TimerCallbacks;
  private duration: number;
  private elapsed: number = 0;
  private intervals: IntervalManager;
  private lastTickTime: number = 0;
  private isBackgrounded: boolean = false;
  private warningSent: Set<number> = new Set();
  private sessionId: string;

  constructor(
    sessionId: string,
    duration: number,
    config: Partial<TimerConfig>,
    callbacks: TimerCallbacks,
  ) {
    this.sessionId = sessionId;
    this.duration = duration * 1000;
    this.config = { tickInterval: 1000, backgroundTickInterval: 5000, pauseThreshold: 5000, maxPauseDuration: 3600000, warningThresholds: [300, 60, 10], ...config };
    this.callbacks = callbacks;
    this.state = { isRunning: false, isPaused: false, startTime: undefined, pauseTime: undefined, totalPausedTime: 0, lastTickAt: undefined };
    this.intervals = createIntervalManager(this.config, () => this.tick(), () => this.backgroundTick());
    debug.info("TimerEngine created for session %s, duration: %ds", sessionId, duration);
  }

  start(): void {
    if (this.state.isRunning) { debug.warn("Timer already running for session %s", this.sessionId); return; }
    const now = Date.now();
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.startTime = now;
    this.state.lastTickAt = now;
    this.lastTickTime = now;
    this.warningSent.clear();
    this.intervals.startTickInterval();
    debug.info("Timer started for session %s", this.sessionId);
  }

  pause(reason?: string): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    this.state.pauseTime = Date.now();
    this.intervals.stopTickInterval();
    debug.info("Timer paused for session %s (reason: %s)", this.sessionId, reason || "user");
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    const now = Date.now();
    const pauseDuration = now - (this.state.pauseTime || now);
    this.state.isPaused = false;
    this.state.pauseTime = undefined;
    this.state.totalPausedTime += pauseDuration;
    this.state.lastTickAt = now;
    this.lastTickTime = now;
    this.intervals.startTickInterval();
    debug.info("Timer resumed for session %s (paused for %dms)", this.sessionId, pauseDuration);
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.intervals.stopTickInterval();
    this.intervals.stopBackgroundInterval();
    debug.info("Timer stopped for session %s", this.sessionId);
  }

  background(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.isBackgrounded = true;
    this.state.lastTickAt = Date.now();
    this.intervals.stopTickInterval();
    this.intervals.startBackgroundInterval();
    debug.info("Timer backgrounded for session %s", this.sessionId);
  }

  foreground(): number {
    if (!this.isBackgrounded) return 0;
    this.isBackgrounded = false;
    const now = Date.now();
    const backgroundDuration = now - (this.state.lastTickAt || now);
    this.intervals.stopBackgroundInterval();
    if (backgroundDuration > (this.config.pauseThreshold ?? 5000)) {
      this.state.totalPausedTime += backgroundDuration;
      debug.info("Timer auto-paused after background: %dms", backgroundDuration);
    } else {
      this.elapsed += backgroundDuration;
    }
    this.state.lastTickAt = now;
    this.lastTickTime = now;
    if (this.state.isRunning && !this.state.isPaused) this.intervals.startTickInterval();
    debug.info("Timer foregrounded for session %s (duration: %dms)", this.sessionId, backgroundDuration);
    return backgroundDuration;
  }

  private tick(): void { this.performTick(true); }
  private backgroundTick(): void { this.performTick(false); }

  private performTick(alwaysWarn: boolean): void {
    const result = processTick(this.lastTickTime, this.elapsed, this.duration, alwaysWarn);
    this.lastTickTime = result.timestamp;
    this.state.lastTickAt = result.timestamp;
    this.elapsed = result.elapsed;
    if (result.shouldWarn) {
      checkWarnings(result.secondsRemaining, this.config.warningThresholds ?? [], this.warningSent, this.callbacks.onWarning, this.sessionId);
    }
    this.callbacks.onTick(result.elapsed, result.remaining, result.percentage);
    if (result.shouldComplete) this.complete();
  }

  private complete(): void {
    this.stop();
    this.callbacks.onComplete();
    debug.info("Timer completed for session %s", this.sessionId);
  }

  adjustTime(deltaMs: number): void {
    this.elapsed = Math.max(0, this.elapsed + deltaMs);
    debug.debug("Timer adjusted for session %s: %dms", this.sessionId, deltaMs);
  }

  setTime(elapsedMs: number): void {
    this.elapsed = Math.max(0, Math.min(this.duration, elapsedMs));
    debug.debug("Timer set for session %s: %dms elapsed", this.sessionId, elapsedMs);
  }

  addTime(additionalMs: number): void {
    this.duration += additionalMs;
    debug.debug("Timer extended for session %s: +%dms", this.sessionId, additionalMs);
  }

  getState(): TimerState { return { ...this.state }; }
  getElapsedTime(): number { return this.elapsed; }
  getRemainingTime(): number { return Math.max(0, this.duration - this.elapsed); }
  getRemainingSeconds(): number { return Math.ceil(this.getRemainingTime() / 1000); }
  getElapsedSeconds(): number { return Math.floor(this.elapsed / 1000); }
  getPercentageComplete(): number { return Math.min(100, (this.elapsed / this.duration) * 100); }
  isRunning(): boolean { return this.state.isRunning; }
  isPaused(): boolean { return this.state.isPaused; }
  getIsBackgrounded(): boolean { return this.isBackgrounded; }

  serialize(): SerializedTimerState {
    return {
      elapsed: this.elapsed, duration: this.duration,
      isRunning: this.state.isRunning, isPaused: this.state.isPaused,
      totalPausedTime: this.state.totalPausedTime, warningSent: Array.from(this.warningSent),
    };
  }

  restore(state: SerializedTimerState): void {
    this.elapsed = state.elapsed;
    this.duration = state.duration;
    this.state.isRunning = state.isRunning;
    this.state.isPaused = state.isPaused;
    this.state.totalPausedTime = state.totalPausedTime;
    this.warningSent = new Set(state.warningSent);
    if (this.state.isRunning && !this.state.isPaused) this.intervals.startTickInterval();
    debug.info("Timer restored for session %s", this.sessionId);
  }

  destroy(): void {
    this.stop();
    debug.info("TimerEngine destroyed for session %s", this.sessionId);
  }
}

export function createTimerEngine(
  sessionId: string, duration: number,
  config: Partial<TimerConfig>, callbacks: TimerCallbacks,
): TimerEngine {
  return new TimerEngine(sessionId, duration, config, callbacks);
}
