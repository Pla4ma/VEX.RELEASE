/**
 * useStudySession Hook
 *
 * React Query hook for study session management.
 * Integrates session orchestration with focus techniques and tracking.
 *
 * @phase 4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createDebugger } from '../../../utils/debug';
import { getSessionOrchestrator } from '../../../session/orchestrator-factory';
import { getCoachService } from '../../ai-coach/service';
import type { SessionConfig, SessionState } from '../../../session/types';
import { capture } from '../../../shared/analytics/analytics-service';
import { SessionEvents } from '../../../shared/analytics/analytics-events';
import { progressionService } from '../../../services/progressionService';
import { economyService } from '../../../services/economyService';
import { streakService } from '../../../services/streakService';
import { studySessionKeys, getSessionMode, getExpectedDuration } from './useStudySession.helpers';
import { buildReturn } from './useStudySession.return';

const debug = createDebugger('session:useStudySession');

export function useStudySession() {
  const queryClient = useQueryClient();
  const orchestrator = getSessionOrchestrator();
  const coachService = getCoachService();

  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  const currentSessionQuery = useQuery({
    queryKey: studySessionKeys.current(),
    queryFn: () => orchestrator.getSessionState(),
    refetchInterval: 1000,
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

  const activeSessionQuery = useQuery({
    queryKey: studySessionKeys.active(),
    queryFn: () => orchestrator.getActiveSession(),
    refetchInterval: 1000,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (config: SessionConfig) => {
      await orchestrator.createSession(config);
      return orchestrator.startSession();
    },
    onSuccess: (sessionState) => {
      debug.info('Study session started', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });

      capture(SessionEvents.SESSION_STARTED, {
        session_id: sessionState.id,
        user_id: sessionState.userId,
        mode: getSessionMode(sessionState),
        duration_seconds: getExpectedDuration(sessionState),
      });
    },
  });

  const pauseSessionMutation = useMutation({
    mutationFn: () => orchestrator.pauseSession(),
    onSuccess: (sessionState) => {
      debug.info('Study session paused', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });

      capture(SessionEvents.SESSION_PAUSED, {
        session_id: sessionState.id,
        user_id: sessionState.userId,
        duration_seconds: sessionState.elapsedTime,
        progress_percentage: sessionState.completionPercentage,
      });
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: () => orchestrator.resumeSession(),
    onSuccess: (sessionState) => {
      debug.info('Study session resumed', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });

      capture(SessionEvents.SESSION_RESUMED, {
        session_id: sessionState.id,
        user_id: sessionState.userId,
        duration_seconds: sessionState.elapsedTime,
        progress_percentage: sessionState.completionPercentage,
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: (reason?: string) => orchestrator.endSession(reason),
    onSuccess: async (sessionState) => {
      debug.info('Study session ended', { sessionId: sessionState.id });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.current() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.active() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.history() });
      queryClient.invalidateQueries({ queryKey: studySessionKeys.stats() });

      if (sessionState.status === 'COMPLETED') {
        await handleSessionRewards(sessionState);
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
  });

  return buildReturn({
    queryClient,
    orchestrator,
    coachService,
    sessionConfig,
    setSessionConfig,
    currentSessionQuery,
    sessionHistoryQuery,
    sessionStatsQuery,
    activeSessionQuery,
    startSessionMutation,
    pauseSessionMutation,
    resumeSessionMutation,
    endSessionMutation,
  });
}

async function handleSessionRewards(sessionState: SessionState): Promise<void> {
  try {
    await progressionService.grantXP({
      amount: sessionState.finalScore ?? 0,
      source: 'session_complete',
      metadata: {
        session_id: sessionState.id,
        mode: getSessionMode(sessionState),
        duration_seconds: sessionState.elapsedTime,
      },
    });
  } catch (error) {
    debug.error('Failed to grant XP:', error as Error);
  }

  try {
    const baseCoins = Math.floor((sessionState.finalScore ?? 0) / 10);
    await economyService.addCurrency({
      userId: sessionState.userId,
      amount: baseCoins,
      currency: 'COINS',
      source: 'SESSION_COMPLETE',
      metadata: { session_id: sessionState.id },
    });
  } catch (error) {
    debug.error('Failed to grant coins:', error as Error);
  }

  try {
    await streakService.updateStreak();
  } catch (error) {
    debug.error('Failed to update streak:', error as Error);
  }
}
