import { useState, useEffect, useCallback, useRef } from "react";
import { getSessionService } from "../SessionService";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";
import type { SessionState, SessionConfig, SessionSummary, SessionHistoryEntry } from "../types";


export function useSession(userId: string): UseSessionReturn {
  const serviceRef = useRef(getSessionService());
  const service = serviceRef.current;

  // Initialize service with userId
  useEffect(() => {
    service.setUserId(userId);
  }, [service, userId]);

  // State
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

  // Refresh state from service
  const refresh = useCallback(() => {
    try {
      const session = service.getCurrentSession();
      const isActive = service.isSessionActive();
      const isPaused = service.isSessionPaused();
      const remainingSeconds = service.getRemainingSeconds();
      const elapsedSeconds = service.getElapsedSeconds();
      const completionPercentage = service.getCompletionPercentage();

      setState(prev => ({
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
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [service]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to session events
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Session tick updates
    unsubscribers.push(
      eventBus.subscribe('session:tick', (data) => {
        if (data.sessionId === state.session?.id) {
          setState(prev => ({
            ...prev,
            remainingSeconds: Math.ceil(data.remaining / 1000),
            elapsedSeconds: Math.floor(data.elapsed / 1000),
            completionPercentage: data.percentage,
          }));
        }
      })
    );

    // Session status changes
    unsubscribers.push(
      eventBus.subscribe('session:started', (data) => {
        if (data.sessionId === state.session?.id) {
          setState(prev => ({ ...prev, isActive: true, isPaused: false }));
        }
      })
    );

    unsubscribers.push(
      eventBus.subscribe('session:paused', (data) => {
        if (data.sessionId === state.session?.id) {
          setState(prev => ({ ...prev, isPaused: true }));
        }
      })
    );

    unsubscribers.push(
      eventBus.subscribe('session:resumed', (data) => {
        if (data.sessionId === state.session?.id) {
          setState(prev => ({ ...prev, isPaused: false }));
        }
      })
    );

    unsubscribers.push(
      eventBus.subscribe('session:completed', (data) => {
        if (data.sessionId === state.session?.id) {
          setState(prev => ({ ...prev, isActive: false, isPaused: false }));
        }
      })
    );

    unsubscribers.push(
      eventBus.subscribe('session:abandoned', (data) => {
        if (data.sessionId === state.session?.id) {
          setState(prev => ({ ...prev, isActive: false, isPaused: false }));
        }
      })
    );

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [state.session?.id]);

  // Actions
  const createSession = useCallback(async (config: SessionConfig): Promise<SessionState> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const session = await service.createCustomSession(config);
      refresh();
      return session;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const startSession = useCallback(async (countdownSeconds: number = 0): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await service.startSession(countdownSeconds);
      refresh();
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const pauseSession = useCallback(async (reason?: string): Promise<void> => {
    try {
      await service.pauseSession(reason);
      refresh();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const resumeSession = useCallback(async (): Promise<void> => {
    try {
      await service.resumeSession();
      refresh();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const endSession = useCallback(async (): Promise<SessionSummary> => {
    try {
      const summary = await service.completeSession();
      refresh();
      return summary;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const abandonSession = useCallback(async (reason?: string): Promise<void> => {
    try {
      await service.abandonSession(reason);
      refresh();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const gracefulExit = useCallback(async (reflection?: string, mood?: any): Promise<SessionSummary> => {
    try {
      const summary = await service.gracefulExit(reflection, mood);
      refresh();
      return summary;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const backgroundSession = useCallback(async (): Promise<void> => {
    try {
      await service.backgroundSession();
      refresh();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const foregroundSession = useCallback(async (): Promise<void> => {
    try {
      await service.foregroundSession();
      refresh();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const attemptRecovery = useCallback(async (type: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT'): Promise<boolean> => {
    try {
      const result = await service.attemptRecovery(type);
      refresh();
      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      throw err;
    }
  }, [service, refresh]);

  const applyStudyQuizBonus = useCallback((correctAnswers: number): void => {
    service.applyStudyQuizBonus(correctAnswers);
    refresh();
  }, [service, refresh]);

  const getAntiCheatScore = useCallback((): number => {
    return service.getCurrentPurityScore();
  }, [service]);

  const getAntiCheatLabel = useCallback((): 'Elite' | 'Good' | 'Okay' | 'Distracted' => {
    return service.getPurityLabel();
  }, [service]);

  return {
    ...state,
    createSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    gracefulExit,
    abandonSession,
    backgroundSession,
    foregroundSession,
    attemptRecovery,
    applyStudyQuizBonus,
    getAntiCheatScore,
    getAntiCheatLabel,
    refresh,
  };
}