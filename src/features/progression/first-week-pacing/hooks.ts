/**
 * First Week Pacing Hooks
 *
 * React hooks for accessing first week progression data and state.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import * as service from './service';
import { useAuthStore } from '../../../store';
import type { FirstWeekProgress, FirstWeekSession } from './schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const firstWeekKeys = {
  all: ['first-week'] as const,
  byUser: (userId: string) => [...firstWeekKeys.all, 'user', userId] as const,
};

// ============================================================================
// Read Hooks
// ============================================================================

export function useFirstWeekProgress(userId: string) {
  return useQuery({
    queryKey: firstWeekKeys.byUser(userId),
    queryFn: () => service.getFirstWeekProgress(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 2, // Check every 2 minutes
  });
}

export function useCurrentFirstWeekProgress() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? '';

  return useFirstWeekProgress(userId);
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useProgressToNextSession() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      completedSession,
      xpEarned,
      sessionData,
    }: {
      userId: string;
      completedSession:
        | 'SESSION_1'
        | 'SESSION_2'
        | 'SESSION_3'
        | 'SESSION_4'
        | 'SESSION_5'
        | 'SESSION_6'
        | 'SESSION_7';
      xpEarned: number;
      sessionData?: Record<string, unknown>;
    }) => {
      return service.progressToNextSession(
        userId,
        completedSession,
        xpEarned,
        sessionData,
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: firstWeekKeys.byUser(variables.userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'first-week-pacing', operation: 'progressToNextSession' } });
      show({ type: 'error', title: 'Progress not saved', message: 'Try again when connection returns.' });
    },
  });
}

// ============================================================================
// Utility Hooks
// ============================================================================

export function useFirstWeekCompletion(
  progress: FirstWeekProgress | null | undefined,
): number {
  if (!progress) {
    return 0;
  }

  const totalSessions = 7;
  return (progress.sessionsCompleted / totalSessions) * 100;
}

export function useSessionUnlocks(session: string) {
  return service.getSessionUnlocks(session as FirstWeekSession);
}

export function useSessionXpReward(session: string) {
  return service.getSessionXpReward(session as FirstWeekSession);
}

export function useCompanionReaction(session: string) {
  return service.getCompanionReaction(session as FirstWeekSession);
}

export function useTutorialSteps(session: string) {
  return service.getTutorialSteps(session as FirstWeekSession);
}

export function useIsInFirstWeek(
  progress: FirstWeekProgress | null | undefined,
): boolean {
  if (!progress) {
    return false;
  }
  return service.isInFirstWeek(progress);
}

export function useNextSession(
  progress: FirstWeekProgress | null | undefined,
): FirstWeekSession | null {
  if (!progress) {
    return null;
  }

  const sessions: FirstWeekSession[] = [
    'SESSION_1',
    'SESSION_2',
    'SESSION_3',
    'SESSION_4',
    'SESSION_5',
    'SESSION_6',
    'SESSION_7',
  ];

  const currentIndex = sessions.indexOf(progress.currentSession);
  if (currentIndex === -1 || currentIndex >= sessions.length - 1) {
    return null;
  }

  return sessions[currentIndex + 1] ?? null;
}
