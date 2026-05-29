import { useCallback } from "react";
import type { SessionConfig, SessionState } from "../../../session/types";
import type { SessionOrchestrator } from "../../../session/SessionOrchestrator";
import type { getCoachService } from "../../ai-coach/service";
import {
  studySessionKeys,
  getExpectedDuration,
} from "./useStudySession.helpers";
import type { BuildReturnArgs } from "./build-return-args";
export type { BuildReturnArgs } from "./build-return-args";

export function buildReturn(args: BuildReturnArgs) {
  const {
    queryClient,
    orchestrator,
    coachService,
    sessionConfig,
    setSessionConfig,
    currentSessionQuery,
    sessionHistoryQuery,
    sessionStatsQuery,
    startSessionMutation,
    pauseSessionMutation,
    resumeSessionMutation,
    endSessionMutation,
  } = args;
  const startSession = useCallback(
    (config: SessionConfig) => {
      setSessionConfig(config);
      startSessionMutation.mutate(config);
    },
    [startSessionMutation, setSessionConfig],
  );
  const pauseSession = useCallback(() => {
    pauseSessionMutation.mutate();
  }, [pauseSessionMutation]);
  const resumeSession = useCallback(() => {
    resumeSessionMutation.mutate();
  }, [resumeSessionMutation]);
  const endSession = useCallback(
    (reason?: string) => {
      endSessionMutation.mutate(reason);
      setSessionConfig(null);
    },
    [endSessionMutation, setSessionConfig],
  );
  const startBreak = useCallback(() => {
    orchestrator.startBreak();
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);
  const endBreak = useCallback(() => {
    orchestrator.endBreak();
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);
  const updateFocusQuality = useCallback(
    (quality: number) => {
      orchestrator.updateFocusQuality(quality);
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
    },
    [orchestrator, queryClient],
  );
  const logInterruption = useCallback(
    (type: string, details?: Record<string, unknown>) => {
      orchestrator.logInterruption(type, details);
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
    },
    [orchestrator, queryClient],
  );
  const logRecovery = useCallback(
    (type: string, details?: Record<string, unknown>) => {
      orchestrator.logRecovery(type, details);
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
    },
    [orchestrator, queryClient],
  );
  const addDocument = useCallback(
    (documentId: string) => {
      orchestrator.addDocument(documentId);
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
    },
    [orchestrator, queryClient],
  );
  const removeDocument = useCallback(
    (documentId: string) => {
      orchestrator.removeDocument(documentId);
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
    },
    [orchestrator, queryClient],
  );
  const requestCoachAdvice = useCallback(async () => {
    if (!currentSessionQuery.data) {
      return null;
    }
    try {
      return await coachService.getSessionAdvice(currentSessionQuery.data);
    } catch (error: unknown) {
      return null;
    }
  }, [coachService, currentSessionQuery.data]);
  const currentSession = currentSessionQuery.data;
  const sessionHistory = sessionHistoryQuery.data ?? [];
  const sessionStats = sessionStatsQuery.data;
  const activeSession = currentSession;
  const isActive = currentSession?.status === "ACTIVE";
  const isPaused = currentSession?.status === "PAUSED";
  const isBreak =
    currentSession?.phase === "SHORT_BREAK" ||
    currentSession?.phase === "LONG_BREAK" ||
    false;
  const isWork = currentSession?.phase === "FOCUS";
  const isCompleted = currentSession?.status === "COMPLETED";
  const progress = currentSession?.completionPercentage ?? 0;
  const duration = getExpectedDuration(currentSession ?? undefined);
  const elapsed = currentSession?.elapsedTime ?? 0;
  const timeRemaining = duration ? Math.max(0, duration - elapsed) : 0;
  const error =
    currentSessionQuery.error ??
    sessionHistoryQuery.error ??
    sessionStatsQuery.error ??
    null;
  return {
    currentSession,
    sessionHistory,
    sessionStats,
    activeSession,
    sessionConfig,
    isActive,
    isPaused,
    isBreak,
    isWork,
    isCompleted,
    progress,
    timeRemaining,
    isLoading:
      currentSessionQuery.isLoading ||
      sessionHistoryQuery.isLoading ||
      sessionStatsQuery.isLoading,
    isFetching:
      currentSessionQuery.isFetching ||
      sessionHistoryQuery.isFetching ||
      sessionStatsQuery.isFetching,
    isStarting: startSessionMutation.isPending,
    isPausing: pauseSessionMutation.isPending,
    isResuming: resumeSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    error,
    isError: !!error,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    startBreak,
    endBreak,
    updateFocusQuality,
    logInterruption,
    logRecovery,
    addDocument,
    removeDocument,
    requestCoachAdvice,
    queries: {
      current: currentSessionQuery,
      history: sessionHistoryQuery,
      stats: sessionStatsQuery,
      active: currentSessionQuery,
    },
  };
}
