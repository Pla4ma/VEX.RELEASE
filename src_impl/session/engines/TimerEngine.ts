/**
 * Timer Engine
 *
 * Robust timer state machine for session timing.
 * Handles active, paused, backgrounded states with precision timing.
 */

import type { TimerState, SessionState, TimerConfig } from '../types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:timer');

// ============================================================================
// Timer Events
// ============================================================================

type TimerCallback = (elapsed: number, remaining: number, percentage: number) => void;
type TimerCompleteCallback = () => void;
type TimerWarningCallback = (secondsRemaining: number) => void;

interface TimerCallbacks {
  onTick: TimerCallback;
  onComplete: TimerCompleteCallback;
  onWarning: TimerWarningCallback;
}

// ============================================================================
// Timer Engine
// ============================================================================

export class TimerEngine {
  private state: TimerState;
  private config: TimerConfig;
  private callbacks: TimerCallbacks;
  private duration: number;
  private elapsed: number = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private backgroundIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastTickTime: number = 0;
  private isBackgrounded: boolean = false;
  private warningSent: Set<number> = new Set();
  private sessionId: string;

  constructor(
    sessionId: string,
    duration: number, // in seconds
    config: Partial<TimerConfig>,
    callbacks: TimerCallbacks
  ) {
    this.sessionId = sessionId;
    this.duration = duration * 1000; // Convert to ms
    this.config = this.mergeConfig(config);
    this.callbacks = callbacks;

    this.state = {
      isRunning: false,
      isPaused: false,
      startTime: undefined,
      pauseTime: undefined,
      totalPausedTime: 0,
      lastTickAt: undefined,
    };

    debug.info('TimerEngine created for session %s, duration: %ds', sessionId, duration);
  }

  private mergeConfig(config: Partial<TimerConfig>): TimerConfig {
    return {
      tickInterval: 1000,
      backgroundTickInterval: 5000,
      pauseThreshold: 5000,
      maxPauseDuration: 3600000,
      warningThresholds: [300, 60, 10],
      ...config,
    };
  }

  // ============================================================================
  // Core Timer Operations
  // ============================================================================

  start(): void {
    if (this.state.isRunning) {
      debug.warn('Timer already running for session %s', this.sessionId);
      return;
    }

    const now = Date.now();
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.startTime = now;
    this.state.lastTickAt = now;
    this.lastTickTime = now;

    // Reset warning flags
    this.warningSent.clear();

    // Start tick interval
    this.startTickInterval();

    debug.info('Timer started for session %s', this.sessionId);
  }

  pause(reason?: string): void {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    const now = Date.now();
    this.state.isPaused = true;
    this.state.pauseTime = now;

    // Stop intervals
    this.stopTickInterval();

    debug.info('Timer paused for session %s (reason: %s)', this.sessionId, reason || 'user');
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) {
      return;
    }

    const now = Date.now();
    const pauseDuration = now - (this.state.pauseTime || now);

    this.state.isPaused = false;
    this.state.pauseTime = undefined;
    this.state.totalPausedTime += pauseDuration;
    this.state.lastTickAt = now;
    this.lastTickTime = now;

    // Restart tick interval
    this.startTickInterval();

    debug.info('Timer resumed for session %s (paused for %dms)', this.sessionId, pauseDuration);
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;

    this.stopTickInterval();
    this.stopBackgroundInterval();

    debug.info('Timer stopped for session %s', this.sessionId);
  }

  // ============================================================================
  // Background Handling
  // ============================================================================

  background(): void {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    this.isBackgrounded = true;
    const now = Date.now();

    // Save the time when backgrounded
    this.state.lastTickAt = now;

    // Switch to less frequent background interval
    this.stopTickInterval();
    this.startBackgroundInterval();

    debug.info('Timer backgrounded for session %s', this.sessionId);
  }

  foreground(): number {
    if (!this.isBackgrounded) {
      return 0;
    }

    this.isBackgrounded = false;
    const now = Date.now();

    // Calculate time spent in background
    const backgroundDuration = now - (this.state.lastTickAt || now);

    // Stop background interval
    this.stopBackgroundInterval();

    // Handle potential auto-pause if backgrounded too long
    if (backgroundDuration > (this.config.pauseThreshold ?? 5000)) {
      // Treat as paused time
      this.state.totalPausedTime += backgroundDuration;
      debug.info('Timer auto-paused after background: %dms', backgroundDuration);
    } else {
      // Count as elapsed time
      this.elapsed += backgroundDuration;
    }

    // Update last tick
    this.state.lastTickAt = now;
    this.lastTickTime = now;

    // Resume normal interval
    if (this.state.isRunning && !this.state.isPaused) {
      this.startTickInterval();
    }

    debug.info('Timer foregrounded for session %s (duration: %dms)', this.sessionId, backgroundDuration);
    return backgroundDuration;
  }

  // ============================================================================
  // Tick Handling
  // ============================================================================

  private startTickInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.config.tickInterval);

    // Immediate tick
    this.tick();
  }

  private stopTickInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startBackgroundInterval(): void {
    if (this.backgroundIntervalId) {
      clearInterval(this.backgroundIntervalId);
    }

    this.backgroundIntervalId = setInterval(() => {
      this.backgroundTick();
    }, this.config.backgroundTickInterval);
  }

  private stopBackgroundInterval(): void {
    if (this.backgroundIntervalId) {
      clearInterval(this.backgroundIntervalId);
      this.backgroundIntervalId = null;
    }
  }

  private tick(): void {
    const now = Date.now();
    const timeSinceLastTick = now - this.lastTickTime;
    this.lastTickTime = now;
    this.state.lastTickAt = now;

    // Update elapsed time
    this.elapsed += timeSinceLastTick;

    // Calculate remaining
    const remaining = Math.max(0, this.duration - this.elapsed);
    const percentage = Math.min(100, (this.elapsed / this.duration) * 100);

    // Check for warnings
    this.checkWarnings(Math.ceil(remaining / 1000));

    // Call callback
    this.callbacks.onTick(this.elapsed, remaining, percentage);

    // Check completion
    if (this.elapsed >= this.duration) {
      this.complete();
    }
  }

  private backgroundTick(): void {
    const now = Date.now();
    const timeSinceLastTick = now - this.lastTickTime;
    this.lastTickTime = now;
    this.state.lastTickAt = now;

    // Update elapsed time
    this.elapsed += timeSinceLastTick;

    // Calculate remaining
    const remaining = Math.max(0, this.duration - this.elapsed);
    const percentage = Math.min(100, (this.elapsed / this.duration) * 100);

    // Check for warnings (less frequent in background)
    if (remaining <= 60000) {
      this.checkWarnings(Math.ceil(remaining / 1000));
    }

    // Call callback
    this.callbacks.onTick(this.elapsed, remaining, percentage);

    // Check completion
    if (this.elapsed >= this.duration) {
      this.complete();
    }
  }

  private checkWarnings(secondsRemaining: number): void {
    for (const threshold of this.config.warningThresholds ?? []) {
      if (secondsRemaining <= threshold && !this.warningSent.has(threshold)) {
        this.warningSent.add(threshold);
        this.callbacks.onWarning(secondsRemaining);
        debug.debug('Timer warning for session %s: %ds remaining', this.sessionId, secondsRemaining);
      }
    }
  }

  private complete(): void {
    this.stop();
    this.callbacks.onComplete();
    debug.info('Timer completed for session %s', this.sessionId);
  }

  // ============================================================================
  // Time Manipulation
  // ============================================================================

  adjustTime(deltaMs: number): void {
    // Adjust elapsed time (for recovery scenarios)
    this.elapsed = Math.max(0, this.elapsed + deltaMs);
    debug.debug('Timer adjusted for session %s: %dms', this.sessionId, deltaMs);
  }

  setTime(elapsedMs: number): void {
    this.elapsed = Math.max(0, Math.min(this.duration, elapsedMs));
    debug.debug('Timer set for session %s: %dms elapsed', this.sessionId, elapsedMs);
  }

  addTime(additionalMs: number): void {
    this.duration += additionalMs;
    debug.debug('Timer extended for session %s: +%dms', this.sessionId, additionalMs);
  }

  // ============================================================================
  // State Queries
  // ============================================================================

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

  // ============================================================================
  // Persistence Helpers
  // ============================================================================

  serialize(): {
    elapsed: number;
    duration: number;
    isRunning: boolean;
    isPaused: boolean;
    totalPausedTime: number;
    warningSent: number[];
  } {
    return {
      elapsed: this.elapsed,
      duration: this.duration,
      isRunning: this.state.isRunning,
      isPaused: this.state.isPaused,
      totalPausedTime: this.state.totalPausedTime,
      warningSent: Array.from(this.warningSent),
    };
  }

  restore(state: {
    elapsed: number;
    duration: number;
    isRunning: boolean;
    isPaused: boolean;
    totalPausedTime: number;
    warningSent: number[];
  }): void {
    this.elapsed = state.elapsed;
    this.duration = state.duration;
    this.state.isRunning = state.isRunning;
    this.state.isPaused = state.isPaused;
    this.state.totalPausedTime = state.totalPausedTime;
    this.warningSent = new Set(state.warningSent);

    // Restore intervals if was running
    if (this.state.isRunning && !this.state.isPaused) {
      this.startTickInterval();
    }

    debug.info('Timer restored for session %s', this.sessionId);
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    this.stop();
    debug.info('TimerEngine destroyed for session %s', this.sessionId);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createTimerEngine(
  sessionId: string,
  duration: number,
  config: Partial<TimerConfig>,
  callbacks: TimerCallbacks
): TimerEngine {
  return new TimerEngine(sessionId, duration, config, callbacks);
}
