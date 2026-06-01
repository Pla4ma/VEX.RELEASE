import { useEffect, type RefObject } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events';

const debug = createDebugger('session:timer');

const MAX_BACKGROUND_DRIFT = 5000;

export interface SessionTimerState {
  elapsedTime: number;
  remainingTime: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
}
export interface SessionTimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addTime: (ms: number) => void;
  subtractTime: (ms: number) => void;
}
export interface SessionTimerMeta {
  backgroundTime: number;
  lastTickAt: number | null;
  systemTimeOffset: number;
  estimatedCompletionAt: number | null;
}
export interface UseSessionTimerOptions {
  duration: number;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  onBackground?: (duration: number) => void;
  onForeground?: (duration: number) => void;
  hapticEnabled?: boolean;
  tickInterval?: number;
  autoStart?: boolean;
}
export interface UseSessionTimerReturn {
  state: SessionTimerState;
  actions: SessionTimerActions;
  meta: SessionTimerMeta;
}

interface SessionTimerSubscriptionsOptions {
  duration: number;
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
  tick: () => void;
  tickInterval: number;
  handleComplete: () => void;
  setElapsedTime: (updater: (prev: number | undefined) => number) => void;
  setRemainingTime: (updater: (prev: number | undefined) => number) => void;
  backgroundTimeRef: RefObject<number>;
  backgroundedAtRef: RefObject<number | null>;
  intervalRef: RefObject<NodeJS.Timeout | null>;
  lastTickRef: RefObject<number | null>;
  onBackground?: (duration: number) => void;
  onForeground?: (duration: number) => void;
  autoStart: boolean;
  start: () => void;
}

export function useSessionTimerSubscriptions(
  options: SessionTimerSubscriptionsOptions,
): void {
  const {
    duration,
    elapsedTime,
    isRunning,
    isPaused,
    tick,
    tickInterval,
    handleComplete,
    setElapsedTime,
    setRemainingTime,
    backgroundTimeRef,
    backgroundedAtRef,
    intervalRef,
    lastTickRef,
    onBackground,
    onForeground,
    autoStart,
    start,
  } = options;

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && isRunning && !isPaused) {
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
          onBackground(0);
        }
      }
      if (nextAppState === 'active' && isRunning && backgroundedAtRef.current) {
        const backgroundDuration = Date.now() - backgroundedAtRef.current;
        backgroundTimeRef.current += backgroundDuration;
        backgroundedAtRef.current = null;
        if (backgroundDuration > MAX_BACKGROUND_DRIFT) {
          debug.warn('Extended background time detected', {
            duration: backgroundDuration,
          });
          const adjustedElapsed = elapsedTime + backgroundDuration;
          const adjustedRemaining = Math.max(duration - adjustedElapsed, 0);
          setElapsedTime(() => adjustedElapsed);
          setRemainingTime(() => adjustedRemaining);
          if (adjustedRemaining <= 0) {
            handleComplete();
            return;
          }
        }
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
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [
    duration,
    elapsedTime,
    handleComplete,
    isPaused,
    isRunning,
    onBackground,
    onForeground,
    setElapsedTime,
    setRemainingTime,
    tick,
    tickInterval,
    backgroundTimeRef,
    backgroundedAtRef,
    intervalRef,
    lastTickRef,
  ]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalRef]);

  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }
  }, [autoStart, isRunning, start]);
}
