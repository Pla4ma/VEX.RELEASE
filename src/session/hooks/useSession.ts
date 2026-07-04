import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionOrchestrator } from '../SessionOrchestrator';
import { eventBus } from '../../events/EventBus';
import { createSessionActions } from './useSessionActions';
import type { SessionActions } from './useSessionActions';
import type { SessionConfig, SessionState } from '../types';
import { UseSessionState, UseSessionReturn, debug } from './useSessionHelpers';

export { useSessionHistory } from './useSessionHistory';
export { useSessionPresets } from './useSessionPresets';
export { useSessionStats } from './useSessionStats';

export function useSession(userId: string): UseSessionReturn {
  const orchestratorRef = useRef(getSessionOrchestrator());
  const orchestrator = orchestratorRef.current;
  const actionsRef = useRef<SessionActions>(createSessionActions(orchestrator));
  const actions = actionsRef.current;

  useEffect(() => {
    orchestrator.setUserId(userId);
  }, [orchestrator, userId]);

  const [state, setState] = useState<UseSessionState>({
    session: null,
    isActive: false,
    isPaused: false,
    remainingSeconds: 0,
    elapsedSeconds: 0,
    completionPercentage: 0,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(() => {
    try {
      const session = orchestrator.getSession();
      const isActive = orchestrator.isSessionActive();
      const isPaused = orchestrator.isPaused();
      const remainingSeconds = orchestrator.getRemainingSeconds();
      const elapsedSeconds = orchestrator.getElapsedSeconds();
      const completionPercentage = orchestrator.getPercentageComplete();
      setState((prev) => ({
        ...prev,
        session,
        isActive,
        isPaused,
        remainingSeconds,
        elapsedSeconds,
        completionPercentage,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      debug.error('useSession refresh error:', err as Error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [orchestrator]);

  const sessionIdRef = useRef(state.session?.id);
  sessionIdRef.current = state.session?.id;

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];
    unsubscribers.push(
      eventBus.subscribe('session:tick', (data) => {
        if (data.sessionId === sessionIdRef.current) {
          setState((prev) => ({
            ...prev,
            remainingSeconds: Math.ceil(data.remaining / 1000),
            elapsedSeconds: Math.floor(data.elapsed / 1000),
            completionPercentage: data.percentage,
          }));
        }
      }),
    );
    unsubscribers.push(
      eventBus.subscribe('session:started', (data) => {
        if (data.sessionId === sessionIdRef.current) {
          setState((prev) => ({ ...prev, isActive: true, isPaused: false }));
        }
      }),
    );
    unsubscribers.push(
      eventBus.subscribe('session:paused', (data) => {
        if (data.sessionId === sessionIdRef.current) {
          setState((prev) => ({ ...prev, isPaused: true }));
        }
      }),
    );
    unsubscribers.push(
      eventBus.subscribe('session:resumed', (data) => {
        if (data.sessionId === sessionIdRef.current) {
          setState((prev) => ({ ...prev, isPaused: false }));
        }
      }),
    );
    unsubscribers.push(
      eventBus.subscribe('session:completed', (data) => {
        if (data.sessionId === sessionIdRef.current) {
          setState((prev) => ({ ...prev, isActive: false, isPaused: false }));
        }
      }),
    );
    unsubscribers.push(
      eventBus.subscribe('session:abandoned', (data) => {
        if (data.sessionId === sessionIdRef.current) {
          setState((prev) => ({ ...prev, isActive: false, isPaused: false }));
        }
      }),
    );
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const wrapAction = useCallback(
    <Args extends unknown[], R>(
      action: (...args: Args) => Promise<R>,
    ): ((...args: Args) => Promise<R>) => {
      return async (...args: Args): Promise<R> => {
        setState((prev) => ({ ...prev, isLoading: true }));
        try {
          const result = await action(...args);
          setState((prev) => ({ ...prev, isLoading: false }));
          refresh();
          return result;
        } catch (err) {
          debug.error('useSession action error:', err as Error);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
          throw err;
        }
      };
    },
    [refresh],
  );

  const createSession = useCallback(
    async (config: SessionConfig): Promise<SessionState> => {
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const session = await actions.createSession(config);
        setState((prev) => ({ ...prev, isLoading: false }));
        refresh();
        return session;
      } catch (err) {
        debug.error('useSession createSession error:', err as Error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
        throw err;
      }
    },
    [actions, refresh],
  );

  return {
    ...state,
    createSession,
    startSession: wrapAction(actions.startSession),
    pauseSession: wrapAction(actions.pauseSession),
    resumeSession: wrapAction(actions.resumeSession),
    endSession: wrapAction(actions.endSession),
    abandonSession: wrapAction(actions.abandonSession),
    backgroundSession: wrapAction(actions.backgroundSession),
    foregroundSession: wrapAction(actions.foregroundSession),
    attemptRecovery: wrapAction(actions.attemptRecovery),
    applyStudyQuizBonus: actions.applyStudyQuizBonus,
    getAntiCheatScore: actions.getAntiCheatScore,
    getAntiCheatLabel: actions.getAntiCheatLabel,
    refresh,
  };
}
