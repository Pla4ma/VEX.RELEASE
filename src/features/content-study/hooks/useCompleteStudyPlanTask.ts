/**
 * useCompleteStudyPlanTask Hook
 * Mutation hook for marking a study plan task as complete
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import { useAuthStore } from '../../../store';
import { contentStudyQueryKeys } from './queryKeys';
import { studySessionManager } from '../persistence';

interface CompleteTaskParams {
  generationId: string;
  taskId: string;
}

export function useCompleteStudyPlanTask() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { show } = useToast();

  return useMutation({
    mutationFn: async ({ generationId, taskId }: CompleteTaskParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get existing session data
      const sessions =
        await studySessionManager.getSessionsForGeneration(generationId);
      const latestSession = [...sessions].sort(
        (a, b) => b.startTime - a.startTime,
      )[0];

      if (!latestSession) {
        throw new Error('No active study session found');
      }

      // Update completed tasks
      const completedTasks = Array.from(
        new Set([...latestSession.completedTasks, taskId]),
      );

      // Save updated session
      await studySessionManager.saveSession({
        ...latestSession,
        completedTasks,
        endTime: Date.now(),
      });

      return { generationId, taskId, completedTasks };
    },
    onSuccess: async () => {
      // Invalidate related queries
      await queryClient.invalidateQueries({
        queryKey: contentStudyQueryKeys.all,
      });
      if (user?.id) {
        await queryClient.invalidateQueries({
          queryKey: contentStudyQueryKeys.activePlan(user.id),
        });
      }
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'content-study', operation: 'completeStudyPlanTask' } });
      show({ type: 'error', title: 'Task not completed', message: 'Try again when connection returns.' });
    },
  });
}
