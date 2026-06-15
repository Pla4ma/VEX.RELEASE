import { useCallback } from 'react';
import { createDebugger } from '../../utils/debug';
import { eventBus } from '../../events/EventBus';
import { triggerHapticEvent, HapticEvents } from '../../constants/haptics';

const debug = createDebugger('session:timer');

export interface TimerActionDeps {
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number;
  remainingTime: number;
  duration: number;
  tick: () => void;
  tickInterval: number;
  hapticEnabled: boolean;
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
  lastTickRef: React.MutableRefObject<number | null>;
  estimatedCompletionRef: React.MutableRefObject<number | null>;
  setElapsedTime: (value: number | ((prev: number | undefined) => number)) => void;
  setRemainingTime: (value: number | ((prev: number | undefined) => number)) => void;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  addTime: (ms: number) => void;
  subtractTime: (ms: number) => void;
}

export function useTimerActions(deps: TimerActionDeps): TimerActions {
  const {
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
  } = deps;

  const start = useCallback(() => {
    if (isRunning) {return;}
    // setIsRunning and setIsPaused handled by caller via onStateChange
    lastTickRef.current = Date.now();
    estimatedCompletionRef.current = Date.now() + remainingTime;
    intervalRef.current = setInterval(tick, tickInterval);
    if (hapticEnabled) {triggerHapticEvent(HapticEvents.SESSION_START);}
    debug.info('Session timer started', { duration, remaining: remainingTime });
    eventBus.publish('analytics:track', {
      event: 'session_timer_started',
      properties: { duration, remaining: remainingTime },
    });
  }, [duration, hapticEnabled, isRunning, remainingTime, tick, tickInterval, intervalRef, lastTickRef, estimatedCompletionRef]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) {return;}
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (hapticEnabled) {triggerHapticEvent(HapticEvents.SESSION_PAUSE);}
    debug.info('Session timer paused', { elapsed: elapsedTime });
    eventBus.publish('analytics:track', {
      event: 'session_timer_paused',
      properties: { elapsed: elapsedTime },
    });
  }, [elapsedTime, hapticEnabled, isPaused, isRunning, intervalRef]);

  const resume = useCallback(() => {
    if (!isPaused) {return;}
    lastTickRef.current = Date.now();
    estimatedCompletionRef.current = Date.now() + remainingTime;
    intervalRef.current = setInterval(tick, tickInterval);
    if (hapticEnabled) {triggerHapticEvent(HapticEvents.SESSION_RESUME);}
    debug.info('Session timer resumed', { elapsed: elapsedTime });
    eventBus.publish('analytics:track', {
      event: 'session_timer_resumed',
      properties: { elapsed: elapsedTime },
    });
  }, [elapsedTime, hapticEnabled, isPaused, remainingTime, tick, tickInterval, intervalRef, lastTickRef, estimatedCompletionRef]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    debug.info('Session timer stopped', { elapsed: elapsedTime });
    eventBus.publish('analytics:track', {
      event: 'session_timer_stopped',
      properties: { elapsed: elapsedTime },
    });
  }, [elapsedTime, intervalRef]);

  const addTime = useCallback(
    (ms: number) => {
      setRemainingTime((prev: number | undefined) => (prev ?? duration) + ms);
      setElapsedTime((prev: number | undefined) =>
        Math.max((prev ?? 0) - ms, 0),
      );
      debug.info('Time added to session', { ms });
      eventBus.publish('analytics:track', {
        event: 'session_timer_time_added',
        properties: { added: ms },
      });
    },
    [duration, setElapsedTime, setRemainingTime],
  );

  const subtractTime = useCallback(
    (ms: number) => {
      setRemainingTime((prev: number | undefined) =>
        Math.max((prev ?? duration) - ms, 0),
      );
      setElapsedTime((prev: number | undefined) => (prev ?? 0) + ms);
      debug.info('Time subtracted from session', { ms });
      eventBus.publish('analytics:track', {
        event: 'session_timer_time_subtracted',
        properties: { subtracted: ms },
      });
    },
    [duration, setElapsedTime, setRemainingTime],
  );

  return { start, pause, resume, stop, addTime, subtractTime };
}
