/**
 * useStudySession Hook
 *
 * React Query hook for study session management.
 * Integrates session orchestration with focus techniques and tracking.
 *
 * @phase 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useState } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getSessionOrchestrator } from '../../../session/orchestrator-factory';
import { getCoachService } from '../../ai-coach/service';
import type { SessionConfig } from '../../../session/types';
import { capture } from '../../../shared/analytics/analytics-service';
import { SessionEvents } from '../../../shared/analytics/analytics-events';
import {
  studySessionKeys,
  getSessionMode,
  getExpectedDuration,
} from './useStudySession.helpers';
import { useStudySessionReturn } from './useStudySession.return';

const debug = createDebugger('session:useStudySession');

export function useStudySession() {
  const queryClient = useQueryClient();
  const orchestrator = getSessionOrchestrator();
  const coachService = getCoachService();

  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null,
  );

  const currentSessionQuery = useQuery({
    queryKey: studySessionKeys.current(),
    queryFn: () => orchestrator.getSession(),
    staleTime: Infinity,
  });

  const sessionHistoryQuery = useQuery({
    queryKey: studySessionKeys.history(),
    queryFn: () => orchestrator.getSessionHistory(20),
    refetchInterval: 30000,
  });

  const sessionStatsQuery = useQuery({
    queryKey: studySessionKeys.stats(),
    queryFn: () => orchestrator.getSessionStats(),
    refetchInterval: 60000,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (config: SessionConfig) => {
      await orchestrator.createSession(config);
      return orchestrator.startSession();
    },
    onSuccess: (sessionState) => {
      debug.info('Study session started', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      capture(SessionEvents.SESSION_STARTED, {
        session_id: sessionState.id,
        user_id: sessionState.userId,
        mode: getSessionMode(sessionState),
        duration_seconds: getExpectedDuration(sessionState),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'session-start' } });
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: () => orchestrator.pauseSession(),
    onSuccess: (sessionState) => {
      debug.info('Study session paused', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      capture(SessionEvents.SESSION_PAUSED, {
        session_id: sessionState.id,
        user_id: sessionState.userId,
        duration_seconds: sessionState.elapsedTime,
        progress_percentage: sessionState.completionPercentage,
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'session-pause' } });
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: () => orchestrator.resumeSession(),
    onSuccess: (sessionState) => {
      debug.info('Study session resumed', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      capture(SessionEvents.SESSION_RESUMED, {
        session_id: sessionState.id,
        user_id: sessionState.userId,
        duration_seconds: sessionState.elapsedTime,
        progress_percentage: sessionState.completionPercentage,
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'session-resume' } });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (reason?: string) => orchestrator.endSession(reason),
    onSuccess: async (sessionState) => {
      debug.info('Study session ended', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.history() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.stats() });

      if (sessionState.status === 'COMPLETED') {
        // Streak recording + XP granting handled by completion-subsystems.ts
        // via Supabase-backed services — no redundant in-memory calls needed.
        capture(SessionEvents.SESSION_COMPLETED, {
          session_id: sessionState.id,
          user_id: sessionState.userId,
          mode: getSessionMode(sessionState),
          duration_seconds: sessionState.elapsedTime,
        });
      } else {
        capture(SessionEvents.SESSION_ABANDONED, {
          session_id: sessionState.id,
          user_id: sessionState.userId,
          mode: getSessionMode(sessionState),
          duration_seconds: sessionState.elapsedTime,
          progress_percentage: sessionState.completionPercentage,
          reason: 'user_abandoned',
        });
      }
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'session-end' } });
    },
  });

  return useStudySessionReturn({
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
  });
}
