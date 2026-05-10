/**
 * Session Timer Service
 *
 * Manages timer operations for sessions.
 * Handles ticking, progress tracking, and phase transitions.
 */

import { createDebugger } from '../../utils/debug';
import type { SessionState } from '../types';
import { TimeCalculator } from '../engines/TimeCalculator';

export interface TickHandler {
  (payload: { sessionId: string; timestamp: number; deltaMs: number }): void;
}

const debug = createDebugger('session:timer');

// ============================================================================
// Timer Configuration
// ============================================================================

export interface TimerConfig {
  tickIntervalMs: number;
  warningThresholds: number[];
  autoCompleteOnZero: boolean;
  trackBackgroundTime: boolean;
}

const DEFAULT_TIMER_CONFIG: TimerConfig = {
  tickIntervalMs: 1000,
  warningThresholds: [300, 60, 10], // 5min, 1min, 10sec
  autoCompleteOnZero: true,
  trackBackgroundTime: true,
};

// ============================================================================
// Session Timer Service
// ============================================================================

export class SessionTimerService {
  private config: TimerConfig;
  private intervals: Map<string, number> = new Map();
  private lastTick: Map<string, number> = new Map();
  private tickHandlers: Map<string, Set<TickHandler>> = new Map();

  constructor(config: Partial<TimerConfig> = {}) {
    this.config = { ...DEFAULT_TIMER_CONFIG, ...config };
  }

  // ============================================================================
  // Timer Lifecycle
  // ============================================================================

  startTimer(sessionId: string): boolean {
    if (this.intervals.has(sessionId)) {
      debug.warn('Timer already running for session %s', sessionId);
      return false;
    }

    debug.info('Starting timer for session %s', sessionId);

    this.lastTick.set(sessionId, Date.now());
    this.tickHandlers.set(sessionId, new Set());

    const intervalId = window.setInterval(() => {
      this.tick(sessionId);
    }, this.config.tickIntervalMs);

    this.intervals.set(sessionId, intervalId);

    return true;
  }

  stopTimer(sessionId: string): boolean {
    const intervalId = this.intervals.get(sessionId);

    if (!intervalId) {
      debug.warn('No timer running for session %s', sessionId);
      return false;
    }

    debug.info('Stopping timer for session %s', sessionId);

    clearInterval(intervalId);
    this.intervals.delete(sessionId);
    this.lastTick.delete(sessionId);
    this.tickHandlers.delete(sessionId);

    return true;
  }

  pauseTimer(sessionId: string): void {
    debug.info('Pausing timer for session %s', sessionId);
    this.stopTimer(sessionId);
  }

  resumeTimer(sessionId: string): void {
    debug.info('Resuming timer for session %s', sessionId);
    this.startTimer(sessionId);
  }

  // ============================================================================
  // Tick Handling
  // ============================================================================

  private tick(sessionId: string): void {
    const now = Date.now();
    const lastTick = this.lastTick.get(sessionId) || now;
    const deltaMs = now - lastTick;

    this.lastTick.set(sessionId, now);

    // Emit tick event (internal shape for handlers)
    const tickPayload = {
      sessionId,
      timestamp: now,
      deltaMs,
    };

    // Call registered handlers
    const handlers = this.tickHandlers.get(sessionId);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(tickPayload);
        } catch (error) {
          debug.error('Tick handler error for session ' + sessionId, error instanceof Error ? error : new Error(String(error)));
        }
      });
    }
  }

  registerTickHandler(sessionId: string, handler: TickHandler): () => void {
    const handlers = this.tickHandlers.get(sessionId);

    if (!handlers) {
      debug.warn('No timer running for session %s, handler not registered', sessionId);
      return () => {};
    }

    handlers.add(handler);

    // Return unregister function
    return () => {
      handlers.delete(handler);
    };
  }

  // ============================================================================
  // Progress Calculations
  // ============================================================================

  calculateProgress(session: SessionState): {
    elapsed: number;
    remaining: number;
    percentage: number;
    isComplete: boolean;
    shouldWarn: boolean;
    warningThreshold: number | null;
  } {
    const now = Date.now();
    const startTime = session.startTime || session.createdAt;
    const pausedDuration = session.totalPausedTime || 0;

    // Calculate elapsed time (excluding pauses)
    const rawElapsed = Math.floor((now - startTime) / 1000);
    const elapsed = Math.max(0, rawElapsed - pausedDuration);

    // Calculate remaining
    const duration = session.config.duration;
    const remaining = Math.max(0, duration - elapsed);

    // Calculate percentage
    const percentage = TimeCalculator.calculateCompletionPercentage(elapsed, duration);

    // Check if complete
    const isComplete = remaining === 0;

    // Check for warnings
    const previousRemaining = session.remainingTime || duration;
    const warningThreshold = TimeCalculator.shouldTriggerWarning(
      remaining,
      previousRemaining,
      this.config.warningThresholds
    );

    return {
      elapsed,
      remaining,
      percentage,
      isComplete,
      shouldWarn: warningThreshold !== null,
      warningThreshold,
    };
  }

  // ============================================================================
  // Phase Management
  // ============================================================================

  shouldTransitionPhase(session: SessionState): {
    shouldTransition: boolean;
    nextPhase?: string;
    reason?: string;
  } {
    const { elapsed, remaining } = this.calculateProgress(session);

    // Check for interval completion
    const intervalDuration = session.config.duration / (session.totalIntervals || 1);
    const currentIntervalElapsed = elapsed % intervalDuration;
    const isIntervalComplete = currentIntervalElapsed >= intervalDuration - 1;

    if (isIntervalComplete && (session.currentInterval || 0) < (session.totalIntervals || 1)) {
      return {
        shouldTransition: true,
        nextPhase: this.getNextPhase(session.phase),
        reason: 'interval_complete',
      };
    }

    // Check for full completion
    if (remaining === 0) {
      return {
        shouldTransition: true,
        nextPhase: 'COMPLETED',
        reason: 'duration_complete',
      };
    }

    return { shouldTransition: false };
  }

  private getNextPhase(currentPhase: string): string {
    const transitions: Record<string, string> = {
      'FOCUS': 'SHORT_BREAK',
      'SHORT_BREAK': 'FOCUS',
      'LONG_BREAK': 'FOCUS',
      'PREPARATION': 'FOCUS',
    };

    return transitions[currentPhase] || 'FOCUS';
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  cleanup(): void {
    debug.info('Cleaning up all timers');

    for (const [sessionId, intervalId] of this.intervals) {
      clearInterval(intervalId);
      debug.debug('Stopped timer for session %s', sessionId);
    }

    this.intervals.clear();
    this.lastTick.clear();
    this.tickHandlers.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let timerService: SessionTimerService | null = null;

export function getSessionTimerService(config?: Partial<TimerConfig>): SessionTimerService {
  if (!timerService) {
    timerService = new SessionTimerService(config);
  }
  return timerService;
}

export function resetSessionTimerService(): void {
  timerService?.cleanup();
  timerService = null;
}

export default SessionTimerService;
