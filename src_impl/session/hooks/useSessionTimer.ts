/**
 * useSessionTimer Hook
 *
 * Comprehensive timer management for sessions.
 * Handles edge cases: backgrounding, system time changes, battery optimization.
 *
 * @phase 1 - Deepening: Timer with edge case handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useMMKVNumber } from 'react-native-mmkv';

import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';
import { triggerHapticEvent, HapticEvents } from '../../constants/haptics';

const debug = createDebugger('session:timer');

// ============================================================================
// Types
// ============================================================================

interface SessionTimerState {
  elapsedTime: number;
  remainingTime: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface SessionTimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addTime: (ms: number) => void;
  subtractTime: (ms: number) => void;
}

interface SessionTimerMeta {
  backgroundTime: number;
  lastTickAt: number | null;
  systemTimeOffset: number;
  estimatedCompletionAt: number | null;
}

interface UseSessionTimerOptions {
  duration: number;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  onBackground?: (duration: number) => void;
  onForeground?: (duration: number) => void;
  hapticEnabled?: boolean;
  tickInterval?: number;
  autoStart?: boolean;
}

interface UseSessionTimerReturn {
  state: SessionTimerState;
  actions: SessionTimerActions;
  meta: SessionTimerMeta;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TICK_INTERVAL = 1000; // 1 second
const MAX_BACKGROUND_DRIFT = 5000; // 5 seconds - max acceptable drift
const SYSTEM_TIME_CHANGE_THRESHOLD = 30000; // 30 seconds

// ============================================================================
// Hook
// ============================================================================

export function useSessionTimer(options: UseSessionTimerOptions): UseSessionTimerReturn {
  const {
    duration,
    onComplete,
    onProgress,
    onBackground,
    onForeground,
    hapticEnabled = true,
    tickInterval = DEFAULT_TICK_INTERVAL,
    autoStart = false,
  } = options;

  // Core state
  const [elapsedTimeStored, setElapsedTime] = useMMKVNumber('session:timer:elapsed');
  const [remainingTimeStored, setRemainingTime] = useMMKVNumber('session:timer:remaining');

  // Ensure we have default values
  const elapsedTime = elapsedTimeStored ?? 0;
  const remainingTime = remainingTimeStored ?? duration;
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Meta state (not persisted)
  const backgroundTimeRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const systemTimeOffsetRef = useRef(0);
  const estimatedCompletionRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);

  // Calculate progress
  const progress = Math.min((elapsedTime / duration) * 100, 100);

  // ============================================================================
  // Timer Logic
  // ============================================================================

  const handleComplete = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);

    if (hapticEnabled) {
      triggerHapticEvent(HapticEvents.SUCCESS);
    }

    debug.info('Session timer completed');

    eventBus.publish('analytics:track', {
      event: 'session_timer_completed',
      properties: {
        elapsed: elapsedTime,
        backgroundTime: backgroundTimeRef.current,
      },
    });

    if (onComplete) {
      onComplete();
    }
  }, [elapsedTime, hapticEnabled, onComplete]);

  const tick = useCallback(() => {
    const now = Date.now();

    // Check for system time changes
    if (lastTickRef.current) {
      const expectedElapsed = now - lastTickRef.current;
      const drift = Math.abs(expectedElapsed - tickInterval);

      if (drift > SYSTEM_TIME_CHANGE_THRESHOLD) {
        debug.warn('System time change detected', { drift });
        systemTimeOffsetRef.current += expectedElapsed - tickInterval;

        eventBus.publish('analytics:track', {
          event: 'session_timer_system_time_change',
          properties: { drift, offset: systemTimeOffsetRef.current },
        });
      }
    }

    setElapsedTime((prev: number | undefined) => {
      const newElapsed = (prev ?? 0) + tickInterval;
      const newRemaining = Math.max(duration - newElapsed, 0);

      setRemainingTime(newRemaining);

      // Check completion
      if (newRemaining <= 0) {
        handleComplete();
      }

      // Call progress callback
      if (onProgress) {
        const newProgress = Math.min((newElapsed / duration) * 100, 100);
        onProgress(newProgress);
      }

      return newElapsed;
    });

    lastTickRef.current = now;
  }, [duration, handleComplete, onProgress, setElapsedTime, setRemainingTime, tickInterval]);

  // ============================================================================
  // Actions
  // ============================================================================

  const start = useCallback(() => {
    if (isRunning) {return;}

    setIsRunning(true);
    setIsPaused(false);
    lastTickRef.current = Date.now();
    estimatedCompletionRef.current = Date.now() + remainingTime;

    intervalRef.current = setInterval(tick, tickInterval);

    if (hapticEnabled) {
      triggerHapticEvent(HapticEvents.SESSION_START);
    }

    debug.info('Session timer started', { duration, remaining: remainingTime });

    eventBus.publish('analytics:track', {
      event: 'session_timer_started',
      properties: { duration, remaining: remainingTime },
    });
  }, [duration, hapticEnabled, isRunning, remainingTime, tick, tickInterval]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) {return;}

    setIsPaused(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (hapticEnabled) {
      triggerHapticEvent(HapticEvents.SESSION_PAUSE);
    }

    debug.info('Session timer paused', { elapsed: elapsedTime });

    eventBus.publish('analytics:track', {
      event: 'session_timer_paused',
      properties: { elapsed: elapsedTime },
    });
  }, [elapsedTime, hapticEnabled, isPaused, isRunning]);

  const resume = useCallback(() => {
    if (!isPaused) {return;}

    setIsPaused(false);
    lastTickRef.current = Date.now();
    estimatedCompletionRef.current = Date.now() + remainingTime;

    intervalRef.current = setInterval(tick, tickInterval);

    if (hapticEnabled) {
      triggerHapticEvent(HapticEvents.SESSION_RESUME);
    }

    debug.info('Session timer resumed', { elapsed: elapsedTime });

    eventBus.publish('analytics:track', {
      event: 'session_timer_resumed',
      properties: { elapsed: elapsedTime },
    });
  }, [elapsedTime, hapticEnabled, isPaused, remainingTime, tick, tickInterval]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);

    debug.info('Session timer stopped', { elapsed: elapsedTime });

    eventBus.publish('analytics:track', {
      event: 'session_timer_stopped',
      properties: { elapsed: elapsedTime },
    });
  }, [elapsedTime]);

  const addTime = useCallback((ms: number) => {
    setRemainingTime((prev: number | undefined) => (prev ?? duration) + ms);
    setElapsedTime((prev: number | undefined) => Math.max((prev ?? 0) - ms, 0));

    debug.info('Time added to session', { ms });

    eventBus.publish('analytics:track', {
      event: 'session_timer_time_added',
      properties: { added: ms },
    });
  }, [duration, setElapsedTime, setRemainingTime]);

  const subtractTime = useCallback((ms: number) => {
    setRemainingTime((prev: number | undefined) => Math.max((prev ?? duration) - ms, 0));
    setElapsedTime((prev: number | undefined) => (prev ?? 0) + ms);

    debug.info('Time subtracted from session', { ms });

    eventBus.publish('analytics:track', {
      event: 'session_timer_time_subtracted',
      properties: { subtracted: ms },
    });
  }, [duration, setElapsedTime, setRemainingTime]);

  // ============================================================================
  // App State Handling
  // ============================================================================

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && isRunning && !isPaused) {
        // App is backgrounding - pause timer
        backgroundedAtRef.current = Date.now();

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        debug.info('Timer paused due to background');

        eventBus.publish('analytics:track', {
          event: 'session_timer_backgrounded',
          properties: { elapsed: elapsedTime },
        });

        if (onBackground) {
          onBackground(0); // Will be updated on foreground
        }
      }

      if (nextAppState === 'active' && isRunning && backgroundedAtRef.current) {
        // App is returning to foreground
        const backgroundDuration = Date.now() - backgroundedAtRef.current;
        backgroundTimeRef.current += backgroundDuration;
        backgroundedAtRef.current = null;

        // Check for excessive background time
        if (backgroundDuration > MAX_BACKGROUND_DRIFT) {
          debug.warn('Extended background time detected', { duration: backgroundDuration });

          // Adjust timer - assume time passed in background
          const adjustedElapsed = elapsedTime + backgroundDuration;
          const adjustedRemaining = Math.max(duration - adjustedElapsed, 0);

          setElapsedTime(adjustedElapsed);
          setRemainingTime(adjustedRemaining);

          // If timer completed while backgrounded, trigger completion
          if (adjustedRemaining <= 0) {
            handleComplete();
            return;
          }
        }

        // Resume timer
        lastTickRef.current = Date.now();
        intervalRef.current = setInterval(tick, tickInterval);

        debug.info('Timer resumed after foreground', { backgroundDuration });

        eventBus.publish('analytics:track', {
          event: 'session_timer_foregrounded',
          properties: {
            elapsed: elapsedTime,
            backgroundDuration,
            backgroundTotal: backgroundTimeRef.current,
          },
        });

        if (onForeground) {
          onForeground(backgroundDuration);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [duration, elapsedTime, handleComplete, isPaused, isRunning, onBackground, onForeground, setElapsedTime, setRemainingTime, tick, tickInterval]);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Auto-start
  // ============================================================================

  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart, isRunning, start]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    state: {
      elapsedTime: elapsedTime ?? 0,
      remainingTime: remainingTime ?? duration,
      progress,
      isRunning,
      isPaused,
    },
    actions: {
      start,
      pause,
      resume,
      stop,
      addTime,
      subtractTime,
    },
    meta: {
      backgroundTime: backgroundTimeRef.current,
      lastTickAt: lastTickRef.current,
      systemTimeOffset: systemTimeOffsetRef.current,
      estimatedCompletionAt: estimatedCompletionRef.current,
    },
  };
}

// ============================================================================
// Export
// ============================================================================

export default useSessionTimer;
