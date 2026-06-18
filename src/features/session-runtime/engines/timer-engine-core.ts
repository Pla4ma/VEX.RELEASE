import type { TimerState, TimerConfig } from '../types';
import { createDebugger } from '../../../utils/debug';
import type { TimerCallbacks } from './timer-types';
import {
  processTick,
  checkWarnings,
  createIntervalManager,
  type IntervalManager,
} from './timer-tick-handler';

export const debug = createDebugger('session:timer');

export class TimerEngineBase {
  protected state: TimerState;
  protected config: TimerConfig;
  protected callbacks: TimerCallbacks;
  protected duration: number;
  protected elapsed: number = 0;
  protected intervals: IntervalManager;
  protected lastTickTime: number = 0;
  protected isBackgrounded: boolean = false;
  protected warningSent: Set<number> = new Set();
  protected sessionId: string;

  constructor(
    sessionId: string,
    duration: number,
    config: Partial<TimerConfig>,
    callbacks: TimerCallbacks,
  ) {
    this.sessionId = sessionId;
    this.duration = duration * 1000;
    this.config = {
      tickInterval: 1000,
      backgroundTickInterval: 5000,
      pauseThreshold: 5000,
      maxPauseDuration: 3600000,
      warningThresholds: [300, 60, 10],
      ...config,
    };
    this.callbacks = callbacks;
    this.state = {
      isRunning: false,
      isPaused: false,
      startTime: undefined,
      pauseTime: undefined,
      totalPausedTime: 0,
      lastTickAt: undefined,
    };
    this.intervals = createIntervalManager(
      this.config,
      () => this.tick(),
      () => this.backgroundTick(),
    );
    debug.info(
      'TimerEngine created for session %s, duration: %ds',
      sessionId,
      duration,
    );
  }

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
    this.warningSent.clear();
    this.intervals.startTickInterval();
    debug.info('Timer started for session %s', this.sessionId);
  }

  pause(reason?: string): void {
    if (!this.state.isRunning || this.state.isPaused) {return;}
    this.state.isPaused = true;
    this.state.pauseTime = Date.now();
    this.intervals.stopTickInterval();
    debug.info(
      'Timer paused for session %s (reason: %s)',
      this.sessionId,
      reason || 'user',
    );
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) {return;}
    const now = Date.now();
    const pauseDuration = now - (this.state.pauseTime || now);
    this.state.isPaused = false;
    this.state.pauseTime = undefined;
    this.state.totalPausedTime += pauseDuration;
    this.state.lastTickAt = now;
    this.lastTickTime = now;
    this.intervals.startTickInterval();
    debug.info(
      'Timer resumed for session %s (paused for %dms)',
      this.sessionId,
      pauseDuration,
    );
  }

  stop(): void {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.intervals.stopTickInterval();
    this.intervals.stopBackgroundInterval();
    debug.info('Timer stopped for session %s', this.sessionId);
  }

  background(): void {
    if (!this.state.isRunning || this.state.isPaused) {return;}
    this.isBackgrounded = true;
    this.state.lastTickAt = Date.now();
    this.intervals.stopTickInterval();
    this.intervals.startBackgroundInterval();
    debug.info('Timer backgrounded for session %s', this.sessionId);
  }

  foreground(): number {
    if (!this.isBackgrounded) {return 0;}
    this.isBackgrounded = false;
    const now = Date.now();
    const backgroundDuration = now - (this.state.lastTickAt || now);
    this.intervals.stopBackgroundInterval();
    if (backgroundDuration > (this.config.pauseThreshold ?? 5000)) {
      this.state.totalPausedTime += backgroundDuration;
      debug.info(
        'Timer auto-paused after background: %dms',
        backgroundDuration,
      );
    } else {
      this.elapsed += backgroundDuration;
    }
    this.state.lastTickAt = now;
    this.lastTickTime = now;
    if (this.state.isRunning && !this.state.isPaused)
      {this.intervals.startTickInterval();}
    debug.info(
      'Timer foregrounded for session %s (duration: %dms)',
      this.sessionId,
      backgroundDuration,
    );
    return backgroundDuration;
  }

  private tick(): void {
    this.performTick(true);
  }

  private backgroundTick(): void {
    this.performTick(false);
  }

  private performTick(alwaysWarn: boolean): void {
    const result = processTick(
      this.lastTickTime,
      this.elapsed,
      this.duration,
      alwaysWarn,
    );
    this.lastTickTime = result.timestamp;
    this.state.lastTickAt = result.timestamp;
    this.elapsed = result.elapsed;
    if (result.shouldWarn) {
      checkWarnings(
        result.secondsRemaining,
        this.config.warningThresholds ?? [],
        this.warningSent,
        this.callbacks.onWarning,
        this.sessionId,
      );
    }
    this.callbacks.onTick(result.elapsed, result.remaining, result.percentage);
    if (result.shouldComplete) {this.complete();}
  }

  private complete(): void {
    this.stop();
    this.callbacks.onComplete();
    debug.info('Timer completed for session %s', this.sessionId);
  }

  destroy(): void {
    this.stop();
    debug.info('TimerEngine destroyed for session %s', this.sessionId);
  }
}
