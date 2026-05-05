/**
 * useStudySession Hook
 *
 * React Query hook for study session management.
 * Integrates session orchestration with focus techniques and tracking.
 *
 * @phase 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getSessionOrchestrator } from '../../../session/orchestrator-factory';
import { addXp as addProgressionXp } from '../../progression';
import { getEconomyService } from '../../economy';
import { getAnalyticsService } from '../../analytics';
import { getCoachService } from '../../ai-coach';
import type {
  SessionState,
  SessionPhase,
  SessionConfig,
} from '../../../session/types';
import type { FocusTechnique } from '../types';

const debug = createDebugger('session:useStudySession');

// ============================================================================
// Query Keys
// ============================================================================

const studySessionKeys = {
  all: ['studySession'] as const,
  current: () => [...studySessionKeys.all, 'current'] as const,
  history: () => [...studySessionKeys.all, 'history'] as const,
  stats: () => [...studySessionKeys.all, 'stats'] as const,
  active: () => [...studySessionKeys.all, 'active'] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useStudySession() {
  const queryClient = useQueryClient();
  const orchestrator = getSessionOrchestrator();
  const economyService = getEconomyService();
  const analyticsService = getAnalyticsService();
  const coachService = getCoachService();

  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  // ============================================================================
  // Queries
  // ============================================================================

  const currentSessionQuery = useQuery({
    queryKey: studySessionKeys.current(),
    queryFn: () => orchestrator.getSessionState(),
    refetchInterval: 1000, // 1 second for real-time updates
  });

  const sessionHistoryQuery = useQuery({
    queryKey: studySessionKeys.history(),
    queryFn: () => orchestrator.getSessionHistory(20),
    refetchInterval: 30000, // 30 seconds
  });

  const sessionStatsQuery = useQuery({
    queryKey: studySessionKeys.stats(),
    queryFn: () => orchestrator.getSessionStats(),
    refetchInterval: 60000, // 1 minute
  });

  const activeSessionQuery = useQuery({
    queryKey: studySessionKeys.active(),
    queryFn: () => orchestrator.getActiveSession(),
    refetchInterval: 1000, // 1 second
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const startSessionMutation = useMutation({
    mutationFn: (config: SessionConfig) => orchestrator.startSession(config),
    onSuccess: (sessionState) => {
      debug.info('Study session started', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });

      // Track analytics
      analyticsService.track('session_started', {
        sessionId: sessionState.id,
        technique: sessionState.technique,
        duration: sessionState.targetDuration,
      });
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: () => orchestrator.pauseSession(),
    onSuccess: (sessionState) => {
      debug.info('Study session paused', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });

      // Track analytics
      analyticsService.track('session_paused', {
        sessionId: sessionState.id,
        duration: sessionState.elapsedTime,
        phase: sessionState.currentPhase,
      });
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: () => orchestrator.resumeSession(),
    onSuccess: (sessionState) => {
      debug.info('Study session resumed', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });

      // Track analytics
      analyticsService.track('session_resumed', {
        sessionId: sessionState.id,
        duration: sessionState.elapsedTime,
        phase: sessionState.currentPhase,
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (reason?: string) => orchestrator.endSession(reason),
    onSuccess: (sessionState) => {
      debug.info('Study session ended', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.history() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.stats() });

      // Award XP and coins
      if (sessionState.completed) {
        // TODO: Fix progression service integration when functional pattern is fully implemented
        // addProgressionXp(userId, { amount: sessionState.xpEarned || 0, source: 'session_complete' });
        // TODO: Fix economy service integration when functional pattern is fully implemented
        // economyService.addCurrency({ userId, amount: sessionState.coinsEarned || 0, currency: 'COINS', source: 'SESSION_COMPLETE' });

        // Track analytics
        analyticsService.track('session_completed', {
          sessionId: sessionState.id,
          duration: sessionState.elapsedTime,
          xpEarned: sessionState.xpEarned,
          coinsEarned: sessionState.coinsEarned,
          technique: sessionState.technique,
        });
      } else {
        analyticsService.track('session_ended', {
          sessionId: sessionState.id,
          duration: sessionState.elapsedTime,
          reason,
          completed: false,
        });
      }
    },
  });

  // ============================================================================
  // Session Actions
  // ============================================================================

  const startSession = useCallback((config: SessionConfig) => {
    setSessionConfig(config);
    startSessionMutation.mutate(config);
  }, [startSessionMutation]);

  const pauseSession = useCallback(() => {
    pauseSessionMutation.mutate();
  }, [pauseSessionMutation]);

  const resumeSession = useCallback(() => {
    resumeSessionMutation.mutate();
  }, [resumeSessionMutation]);

  const endSession = useCallback((reason?: string) => {
    endSessionMutation.mutate(reason);
    setSessionConfig(null);
  }, [endSessionMutation]);

  // ============================================================================
  // Session Phase Management
  // ============================================================================

  const startBreak = useCallback(() => {
    orchestrator.startBreak();
    debug.info('Break started');
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  const endBreak = useCallback(() => {
    orchestrator.endBreak();
    debug.info('Break ended');
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  // ============================================================================
  // Session Monitoring
  // ============================================================================

  const updateFocusQuality = useCallback((quality: number) => {
    orchestrator.updateFocusQuality(quality);
    debug.info('Focus quality updated', { quality });
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  const logInterruption = useCallback((type: string, details?: Record<string, unknown>) => {
    orchestrator.logInterruption(type, details);
    debug.info('Interruption logged', { type, details });
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  const logRecovery = useCallback((type: string, details?: Record<string, unknown>) => {
    orchestrator.logRecovery(type, details);
    debug.info('Recovery logged', { type, details });
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  // ============================================================================
  // Document Management
  // ============================================================================

  const addDocument = useCallback((documentId: string) => {
    orchestrator.addDocument(documentId);
    debug.info('Document added to session', { documentId });
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  const removeDocument = useCallback((documentId: string) => {
    orchestrator.removeDocument(documentId);
    debug.info('Document removed from session', { documentId });
    queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
  }, [orchestrator, queryClient]);

  // ============================================================================
  // AI Coach Integration
  // ============================================================================

  const requestCoachAdvice = useCallback(async () => {
    if (!currentSessionQuery.data) {
      return null;
    }

    try {
      const advice = await coachService.getSessionAdvice(currentSessionQuery.data);
      debug.info('Coach advice requested', { sessionId: currentSessionQuery.data.id });
      return advice;
    } catch (error) {
      debug.error('Failed to get coach advice', error);
      return null;
    }
  }, [coachService, currentSessionQuery.data]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const currentSession = currentSessionQuery.data;
  const sessionHistory = sessionHistoryQuery.data || [];
  const sessionStats = sessionStatsQuery.data;
  const activeSession = activeSessionQuery.data;

  const isActive = currentSession?.isActive || false;
  const isPaused = currentSession?.isPaused || false;
  const isBreak = currentSession?.currentPhase === 'BREAK';
  const isWork = currentSession?.currentPhase === 'WORK';
  const isCompleted = currentSession?.completed || false;

  const progress = currentSession ?
    (currentSession.elapsedTime / (currentSession.targetDuration || 1)) * 100 : 0;

  const timeRemaining = currentSession && currentSession.targetDuration ?
    Math.max(0, currentSession.targetDuration - currentSession.elapsedTime) : 0;

  // ============================================================================
  // Error Handling
  // ============================================================================

  const error = currentSessionQuery.error ||
                sessionHistoryQuery.error ||
                sessionStatsQuery.error ||
                activeSessionQuery.error || null;

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    currentSession,
    sessionHistory,
    sessionStats,
    activeSession,
    sessionConfig,

    // State
    isActive,
    isPaused,
    isBreak,
    isWork,
    isCompleted,
    progress,
    timeRemaining,

    // Loading states
    isLoading: currentSessionQuery.isLoading ||
               sessionHistoryQuery.isLoading ||
               sessionStatsQuery.isLoading,
    isFetching: currentSessionQuery.isFetching ||
                 sessionHistoryQuery.isFetching ||
                 sessionStatsQuery.isFetching,
    isStarting: startSessionMutation.isPending,
    isPausing: pauseSessionMutation.isPending,
    isResuming: resumeSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,

    // Error states
    error,
    isError: !!error,

    // Actions
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

    // Raw queries for advanced use
    queries: {
      current: currentSessionQuery,
      history: sessionHistoryQuery,
      stats: sessionStatsQuery,
      active: activeSessionQuery,
    },
  };
}

// ============================================================================
// Helper Hook: Session Timer
// ============================================================================

export function useSessionTimer() {
  const { currentSession, isActive, isPaused } = useStudySession();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isActive || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const elapsedTime = currentSession ?
    currentSession.elapsedTime : 0;

  const timeRemaining = currentSession && currentSession.targetDuration ?
    Math.max(0, currentSession.targetDuration - elapsedTime) : 0;

  return {
    currentTime,
    elapsedTime,
    timeRemaining,
    formattedTime: new Date(elapsedTime * 1000).toISOString().substr(14, 5),
    formattedRemaining: new Date(timeRemaining * 1000).toISOString().substr(14, 5),
  };
}

// ============================================================================
// Helper Hook: Session Analytics
// ============================================================================

export function useSessionAnalytics() {
  const { currentSession } = useStudySession();
  const analyticsService = getAnalyticsService();

  const trackSessionEvent = useCallback((event: string, data?: Record<string, unknown>) => {
    if (!currentSession) {
      return;
    }

    analyticsService.track(event, {
      sessionId: currentSession.id,
      ...data,
    });
  }, [analyticsService, currentSession]);

  return {
    trackSessionEvent,
  };
}
