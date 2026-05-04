/**
 * useInterventions Hook
 *
 * React Query hook for AI Coach interventions.
 * Detects and manages proactive interventions during study sessions.
 *
 * @phase 1
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { createDebugger } from '../../../utils/debug';
import { useSessionStore } from '../../../session/store';
import {
  detectStudyStuck,
  detectDistraction,
  detectOptimalBreak,
  type StudyStuckInput,
  type DistractionDetectedInput,
  type OptimalBreakInput,
} from '../intervention-service';
import { getInterventionRepository } from '../repository/interventions';

const debug = createDebugger('ai-coach:useInterventions');

// ============================================================================
// Types
// ============================================================================

export interface InterventionState {
  studyStuck: ReturnType<typeof detectStudyStuck> | null;
  distraction: ReturnType<typeof detectDistraction> | null;
  optimalBreak: ReturnType<typeof detectOptimalBreak> | null;
  dismissed: Set<string>;
  lastCheck: number;
}

export interface UseInterventionsOptions {
  /** Session ID to monitor */
  sessionId: string;
  /** Check interval in milliseconds (default: 30000 = 30s) */
  checkInterval?: number;
  /** Enable study stuck detection */
  enableStudyStuck?: boolean;
  /** Enable distraction detection */
  enableDistraction?: boolean;
  /** Enable optimal break detection */
  enableOptimalBreak?: boolean;
}

// ============================================================================
// Query Keys
// ============================================================================

const interventionKeys = {
  all: ['interventions'] as const,
  session: (sessionId: string) => [...interventionKeys.all, sessionId] as const,
  active: (sessionId: string) => [...interventionKeys.session(sessionId), 'active'] as const,
};

// ============================================================================
// Hook
// ============================================================================

export function useInterventions(options: UseInterventionsOptions) {
  const {
    sessionId,
    checkInterval = 30000,
    enableStudyStuck = true,
    enableDistraction = true,
    enableOptimalBreak = true,
  } = options;

  const queryClient = useQueryClient();
  const sessionState = useSessionStore();
  const dismissedRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<number>(Date.now());

  const repository = getInterventionRepository();

  // ============================================================================
  // Detection Queries
  // ============================================================================

  const studyStuckQuery = useQuery({
    queryKey: [...interventionKeys.session(sessionId), 'studyStuck'],
    queryFn: async () => {
      if (!enableStudyStuck) return null;

      // Get document state from session
      const documentId = sessionState.currentDocumentId;
      const documentName = sessionState.currentDocumentName;
      const sectionName = sessionState.currentSectionName;
      const minutesOnSection = sessionState.minutesOnCurrentSection;

      if (!documentId || minutesOnSection < 30) return null;

      const input: StudyStuckInput = {
        documentId,
        documentName: documentName || 'this document',
        sectionName,
        minutesOnSameSection: minutesOnSection,
        lastInteractionAt: Date.now(),
      };

      const result = detectStudyStuck(input);

      if (result.detected) {
        debug.info('Study stuck detected', result);
        await repository.logIntervention({
          sessionId,
          type: 'STUDY_STUCK',
          severity: result.severity,
          metadata: input,
        });
      }

      return result.detected ? result : null;
    },
    refetchInterval: checkInterval,
    enabled: enableStudyStuck && !!sessionState.currentDocumentId,
  });

  const distractionQuery = useQuery({
    queryKey: [...interventionKeys.session(sessionId), 'distraction'],
    queryFn: async () => {
      if (!enableDistraction) return null;

      // Get session metrics
      const purityScore = sessionState.purityScore;
      const purityTrend = sessionState.purityScoreTrend;
      const pausesIn10Min = sessionState.pausesInLast10Minutes;
      const backgroundSwitches = sessionState.backgroundSwitches;

      if (purityScore === null) return null;

      const input: DistractionDetectedInput = {
        sessionId,
        currentPurityScore: purityScore,
        purityScoreTrend: purityTrend || 'STABLE',
        pausesInLast10Min: pausesIn10Min || 0,
        backgroundSwitches: backgroundSwitches || 0,
      };

      const result = detectDistraction(input);

      if (result.detected) {
        debug.info('Distraction detected', result);
        await repository.logIntervention({
          sessionId,
          type: 'DISTRACTION',
          severity: result.severity,
          metadata: input,
        });
      }

      return result.detected ? result : null;
    },
    refetchInterval: checkInterval,
    enabled: enableDistraction && sessionState.purityScore !== null,
  });

  const optimalBreakQuery = useQuery({
    queryKey: [...interventionKeys.session(sessionId), 'optimalBreak'],
    queryFn: async () => {
      if (!enableOptimalBreak) return null;

      const sessionDuration = sessionState.sessionDurationMinutes;
      const purityScore = sessionState.purityScore || 0;
      const focusPattern = sessionState.focusPattern || 'MODERATE';
      const timeSinceBreak = sessionState.timeSinceLastBreak || sessionDuration;
      const preferredInterval = sessionState.preferredBreakInterval;

      if (sessionDuration < 25) return null; // Minimum session time

      const input: OptimalBreakInput = {
        sessionDuration: sessionDuration * 60, // Convert to seconds
        currentPurityScore: purityScore,
        focusPattern,
        timeSinceLastBreak: timeSinceBreak * 60, // Convert to seconds
        userPreferredBreakInterval: preferredInterval,
      };

      const result = detectOptimalBreak(input);

      if (result.shouldBreak) {
        debug.info('Optimal break detected', result);
        await repository.logIntervention({
          sessionId,
          type: 'OPTIMAL_BREAK',
          severity: result.confidence === 'HIGH' ? 'MILD' : 'MODERATE',
          metadata: { ...input, recommendedBreakDuration: result.recommendedBreakDuration },
        });
      }

      return result.shouldBreak ? result : null;
    },
    refetchInterval: checkInterval,
    enabled: enableOptimalBreak && sessionState.sessionDurationMinutes >= 25,
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const dismissMutation = useMutation({
    mutationFn: async (interventionType: string) => {
      dismissedRef.current.add(interventionType);
      await repository.dismissIntervention(sessionId, interventionType);
      debug.info('Intervention dismissed', { type: interventionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interventionKeys.session(sessionId) });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (interventionType: string) => {
      await repository.acknowledgeIntervention(sessionId, interventionType);
      debug.info('Intervention acknowledged', { type: interventionType });
    },
  });

  // ============================================================================
  // Actions
  // ============================================================================

  const dismissIntervention = useCallback(
    (type: 'studyStuck' | 'distraction' | 'optimalBreak') => {
      dismissMutation.mutate(type);
    },
    [dismissMutation]
  );

  const acknowledgeIntervention = useCallback(
    (type: 'studyStuck' | 'distraction' | 'optimalBreak') => {
      acknowledgeMutation.mutate(type);
    },
    [acknowledgeMutation]
  );

  const resetDismissed = useCallback(() => {
    dismissedRef.current.clear();
    queryClient.invalidateQueries({ queryKey: interventionKeys.session(sessionId) });
  }, [queryClient, sessionId]);

  // ============================================================================
  // Derived State
  // ============================================================================

  const hasActiveIntervention =
    (!!studyStuckQuery.data && !dismissedRef.current.has('studyStuck')) ||
    (!!distractionQuery.data && !dismissedRef.current.has('distraction')) ||
    (!!optimalBreakQuery.data && !dismissedRef.current.has('optimalBreak'));

  const activeInterventions = {
    studyStuck: studyStuckQuery.data && !dismissedRef.current.has('studyStuck')
      ? studyStuckQuery.data
      : null,
    distraction: distractionQuery.data && !dismissedRef.current.has('distraction')
      ? distractionQuery.data
      : null,
    optimalBreak: optimalBreakQuery.data && !dismissedRef.current.has('optimalBreak')
      ? optimalBreakQuery.data
      : null,
  };

  const isLoading =
    studyStuckQuery.isLoading || distractionQuery.isLoading || optimalBreakQuery.isLoading;

  // ============================================================================
  // Error Handling
  // ============================================================================

  const error =
    studyStuckQuery.error || distractionQuery.error || optimalBreakQuery.error || null;

  useEffect(() => {
    if (error) {
      debug.error('Intervention detection error:', error);
    }
  }, [error]);

  return {
    // Data
    interventions: activeInterventions,
    hasActiveIntervention,
    dismissed: dismissedRef.current,

    // Loading states
    isLoading,
    isFetching: studyStuckQuery.isFetching || distractionQuery.isFetching || optimalBreakQuery.isFetching,

    // Error states
    error,
    isError: !!error,

    // Actions
    dismissIntervention,
    acknowledgeIntervention,
    resetDismissed,

    // Raw data for advanced use
    queries: {
      studyStuck: studyStuckQuery,
      distraction: distractionQuery,
      optimalBreak: optimalBreakQuery,
    },
  };
}

// ============================================================================
// Mock Repository (for development)
// ============================================================================

class InterventionRepository {
  async logIntervention(data: {
    sessionId: string;
    type: string;
    severity: string;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    debug.log('Logging intervention:', data);
    // In production: persist to Supabase
  }

  async dismissIntervention(sessionId: string, type: string): Promise<void> {
    debug.log('Dismissing intervention:', { sessionId, type });
    // In production: update dismissed status in DB
  }

  async acknowledgeIntervention(sessionId: string, type: string): Promise<void> {
    debug.log('Acknowledging intervention:', { sessionId, type });
    // In production: update acknowledged status in DB
  }
}

const repository = new InterventionRepository();

function getInterventionRepository(): InterventionRepository {
  return repository;
}
