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

  const generationQuery = useQuery({
    queryKey: contentStudyQueryKeys.generation(generationId),
    queryFn: () => fetchGenerationById(generationId),
    enabled: !!generationId,
    staleTime: 60 * 1000,
  });

  const contentQuery = useQuery({
    queryKey: [
      ...contentStudyQueryKeys.all,
      'generation-content',
      generationId,
    ],
    queryFn: async () => {
      if (!generationQuery.data?.contentId) {
        return null;
      }
      return fetchContentById(generationQuery.data.contentId);
    },
    enabled: !!generationQuery.data?.contentId,
    staleTime: 60 * 1000,
  });

  const startSession = useCallback(async () => {
    if (!generationQuery.data) {
      return null;
    }

    setIsStartingSession(true);

    try {
      const sessionConfig = prepareContentStudySession(generationId, {
        tasks: generationQuery.data.tasks,
        recommendedDurationMinutes:
          generationQuery.data.sessionPlan.recommendedDuration,
        recommendedDifficulty:
          generationQuery.data.sessionPlan.suggestedDifficulty,
        focusAreas: generationQuery.data.sessionPlan.focusAreas,
      });
      const existingSession =
        await studySessionManager.getActiveSession(generationId);

      await studySessionManager.saveSession({
        generationId,
        contentId: generationQuery.data.contentId,
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
  }, [generationId, generationQuery.data]);

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const sessions =
        await studySessionManager.getSessionsForGeneration(generationId);
      const latestSession = [...sessions].sort(
        (a, b) => b.startTime - a.startTime,
      )[0];

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

  const generation = generationQuery.data;
  const content = contentQuery.data ?? null;
  const title = generation && getStudyPlanTitle(content, generation);

  return {
    generation,
    content,
    title,
    isLoading: generationQuery.isPending || contentQuery.isPending,
    error:
      generationQuery.error?.message || contentQuery.error?.message || null,
    startSession,
    isStartingSession,
    completeTask: completeTaskMutation.mutate,
    isCompletingTask: completeTaskMutation.isPending,
    refetch: () => {
      generationQuery.refetch();
      contentQuery.refetch();
    },
  };
}
