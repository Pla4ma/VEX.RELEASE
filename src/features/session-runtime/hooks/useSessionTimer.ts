import { useCallback, useRef, useState } from 'react';
import { useRuntimeMMKVNumber } from '../../../persistence/useRuntimeMMKVNumber';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events/EventBus';
import { triggerHapticEvent, HapticEvents } from '../../../constants/haptics';
import {
  useSessionTimerSubscriptions,
  type UseSessionTimerOptions,
  type UseSessionTimerReturn,
} from './useSessionTimerSubscriptions';
import { useTimerActions } from './useTimerActions';

const debug = createDebugger('session:timer');
const DEFAULT_TICK_INTERVAL = 1000;
const SYSTEM_TIME_CHANGE_THRESHOLD = 30000;

export function useSessionTimer(
  options: UseSessionTimerOptions,
): UseSessionTimerReturn {
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

  const [elapsedTimeStored, setElapsedTime] = useRuntimeMMKVNumber(
    'session:timer:elapsed',
  );
  const [remainingTimeStored, setRemainingTime] = useRuntimeMMKVNumber(
    'session:timer:remaining',
  );

  const elapsedTime = elapsedTimeStored ?? 0;
  const remainingTime = remainingTimeStored ?? duration;
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const backgroundTimeRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const systemTimeOffsetRef = useRef(0);
  const estimatedCompletionRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);

  const progress = Math.min((elapsedTime / duration) * 100, 100);

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
      if (newRemaining <= 0) {
        handleComplete();
      }
      if (onProgress) {
        const newProgress = Math.min((newElapsed / duration) * 100, 100);
        onProgress(newProgress);
      }
      return newElapsed;
    });
    lastTickRef.current = now;
  }, [
    duration,
    handleComplete,
    onProgress,
    setElapsedTime,
    setRemainingTime,
    tickInterval,
  ]);

  const actions = useTimerActions({
    isRunning,
    isPaused,
    elapsedTime,
    remainingTime,
    duration,
    tick,
    tickInterval,
    hapticEnabled,
    intervalRef,
    lastTickRef,
    estimatedCompletionRef,
    setElapsedTime,
    setRemainingTime,
  });

  // Wrap start/pause/resume/stop to also update local state
  const start = useCallback(() => {
    if (isRunning) {return;}
    setIsRunning(true);
    setIsPaused(false);
    actions.start();
  }, [actions, isRunning]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) {return;}
    setIsPaused(true);
    actions.pause();
  }, [actions, isPaused, isRunning]);

  const resume = useCallback(() => {
    if (!isPaused) {return;}
    setIsPaused(false);
    actions.resume();
  }, [actions, isPaused]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    actions.stop();
  }, [actions]);

  useSessionTimerSubscriptions({
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
  });

  return {
    state: {
      elapsedTime: elapsedTime ?? 0,
      remainingTime: remainingTime ?? duration,
      progress,
      isRunning,
      isPaused,
    },
    actions: { start, pause, resume, stop, addTime: actions.addTime, subtractTime: actions.subtractTime },
    meta: {
      backgroundTime: backgroundTimeRef.current,
      lastTickAt: lastTickRef.current,
      systemTimeOffset: systemTimeOffsetRef.current,
      estimatedCompletionAt: estimatedCompletionRef.current,
    },
  };
}

export default useSessionTimer;
