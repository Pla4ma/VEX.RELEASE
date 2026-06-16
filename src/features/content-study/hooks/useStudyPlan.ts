/**
 * useStudyPlan Hook
 * Manages study plan sessions and task completion
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import { useAuthStore } from '../../../store';
import { fetchGenerationById, fetchContentById } from '../ContentStudyService';
import { studySessionManager } from '../persistence';
import { prepareContentStudySession } from '../integration';
import { emitTaskCompleted } from '../events';
import { contentStudyQueryKeys } from './queryKeys';
import { getStudyPlanTitle } from './helpers';

export function useStudyPlan(generationId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { show } = useToast();
  const [isStartingSession, setIsStartingSession] = useState(false);

  const { data, isPending, error, refetch } = useQuery({
    queryKey: contentStudyQueryKeys.generation(generationId),
    queryFn: () => fetchGenerationById(generationId),
    enabled: !!generationId,
    staleTime: 60 * 1000,
    });






  const { data: contentData, isPending: contentPending, error: contentError, refetch: refetchContent } = useQuery({
    queryKey: [
      ...contentStudyQueryKeys.all,
      'generation-content',
      generationId,
    ],
    queryFn: async () => {
      if (!data?.contentId) {
        return null;
      }
      return fetchContentById(data.contentId);
    },
    enabled: !!data?.contentId,
    staleTime: 60 * 1000,
  });

  const startSession = useCallback(async () => {
    if (!data) {
      return null;
    }

    setIsStartingSession(true);

    try {
      const sessionConfig = prepareContentStudySession(generationId, {
        tasks: data.tasks,
        recommendedDurationMinutes:
          data.sessionPlan.recommendedDuration,
        recommendedDifficulty:
          data.sessionPlan.suggestedDifficulty,
        focusAreas: data.sessionPlan.focusAreas,
      });
      const existingSession =
        await studySessionManager.getActiveSession(generationId);

      await studySessionManager.saveSession({
        generationId,
        contentId: data.contentId,
        startTime: existingSession?.startTime ?? Date.now(),
        completedTasks: existingSession?.completedTasks ?? [],
        quizResults: existingSession?.quizResults ?? {},
        totalPauseTime: existingSession?.totalPauseTime ?? 0,
        interruptions: existingSession?.interruptions ?? 0,
        synced: existingSession?.synced ?? false,
      });

      return sessionConfig;
    } finally {
      setIsStartingSession(false);
    }
  }, [generationId, data]);

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const sessions =
        await studySessionManager.getSessionsForGeneration(generationId);
      const latestSession = sessions.reduce<typeof sessions[number] | undefined>(
        (best, session) =>
          !best || session.startTime > best.startTime ? session : best,
        undefined,
      );

      if (!latestSession) {
        throw new Error('Study plan progress could not be found.');
      }

      const completedTasks = Array.from(
        new Set([...latestSession.completedTasks, taskId]),
      );
      const generation = await fetchGenerationById(generationId);
      if (!generation) {
        throw new Error('Study plan could not be loaded.');
      }

      if (completedTasks.length >= generation.tasks.length) {
        await studySessionManager.completeSession(generationId, {
          completedTasks,
        });
      } else {
        await studySessionManager.saveSession({
          ...latestSession,
          completedTasks,
          endTime: undefined,
        });
      }

      emitTaskCompleted(generationId, taskId);
      return { generationId, completedTasks };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.activePlan(user?.id ?? ''),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'content-study', operation: 'completeTask' } });
      show({ type: 'error', title: 'Task not completed', message: 'Try again when connection returns.' });
    },
  });

  const generation = data;
  const content = contentData ?? null;
  const title = generation && getStudyPlanTitle(content, generation);

  return {
    generation,
    content,
    title,
    isLoading: isPending || contentPending,
    error:
      error?.message || contentError?.message || null,
    startSession,
    isStartingSession,
    completeTask: completeTaskMutation.mutate,
    isCompletingTask: completeTaskMutation.isPending,
    refetch: () => {
      refetch();
      refetchContent();
    },
  };
}
