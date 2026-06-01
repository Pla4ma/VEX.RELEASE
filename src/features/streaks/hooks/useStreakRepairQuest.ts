import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../../../store';
import { fetchActiveRepairQuestEnhanced } from '../repository/enhanced';
import { StreakRepairQuestSchema } from '../schemas-risk-repair';
import type { StreakRepairQuest } from '../schemas-risk-repair';
import type { UseStreakRepairQuestReturn } from './types';
import { useRepairQuestStatus } from './useRepairQuestStatus';
import { useRepairQuestMutations } from './use-repair-quest-mutations';

const QUERY_KEYS = {
  repairQuest: (userId: string) => ['streaks', 'repairQuest', userId],
  repairQuestStatus: (userId: string) => [
    'streaks',
    'repairQuestStatus',
    userId,
  ],
} as const;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

export function useStreakRepairQuest(): UseStreakRepairQuestReturn {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  const {
    status,
    isStatusLoading,
    statusError,
    refetchStatus: refetchStatusFn,
    canStartQuest,
    progressPercent,
    hoursRemaining,
  } = useRepairQuestStatus();

  const {
    data: quest,
    isLoading,
    error,
    refetch: refetchQuest,
  } = useQuery({
    queryKey: QUERY_KEYS.repairQuest(userId ?? ''),
    queryFn: async (): Promise<StreakRepairQuest | null> => {
      if (!userId) {return null;}
      try {
        const result = await fetchActiveRepairQuestEnhanced(userId);
        if (result.error) {throw result.error;}
        if (!result.data) {return null;}
        return StreakRepairQuestSchema.parse(result.data);
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            feature: 'streaks',
            hook: 'useStreakRepairQuest',
            operation: 'fetchQuest',
          },
        });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { createQuestMutation, recordSessionMutation } =
    useRepairQuestMutations({
      userId,
      queryKey: QUERY_KEYS.repairQuest(userId ?? ''),
      statusQueryKey: QUERY_KEYS.repairQuestStatus(userId ?? ''),
      quest,
    });

  const createQuest = useCallback(
    async (previousStreak: number) => {
      await createQuestMutation.mutateAsync(previousStreak);
    },
    [createQuestMutation],
  );

  const recordSession = useCallback(
    async (
      sessionId: string,
      duration: number,
      qualityScore: number,
    ): Promise<boolean> => {
      const result = await recordSessionMutation.mutateAsync({
        sessionId,
        duration,
        qualityScore,
      });
      return result.questCompleted;
    },
    [recordSessionMutation],
  );

  const refetch = useCallback(async () => {
    await refetchQuest();
  }, [refetchQuest]);
  const refetchStatus = useCallback(async () => {
    await refetchStatusFn();
  }, [refetchStatusFn]);
  const retry = useCallback(() => {
    refetchQuest();
  }, [refetchQuest]);
  const retryCreate = useCallback(() => {
    createQuestMutation.reset();
  }, [createQuestMutation]);
  const retryRecord = useCallback(() => {
    recordSessionMutation.reset();
  }, [recordSessionMutation]);

  const isEmpty = !quest && !isLoading && !error;

  return {
    quest: quest ?? null,
    status,
    isLoading,
    isStatusLoading,
    isCreating: createQuestMutation.isPending,
    isRecordingSession: recordSessionMutation.isPending,
    error: error as Error | null,
    statusError: statusError as Error | null,
    createError: createQuestMutation.error as Error | null,
    recordError: recordSessionMutation.error as Error | null,
    createQuest,
    recordSession,
    refetch,
    refetchStatus,
    retry,
    retryCreate,
    retryRecord,
    isEmpty,
    canStartQuest,
    progressPercent,
    hoursRemaining,
  };
}
