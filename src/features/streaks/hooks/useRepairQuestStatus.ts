import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../../../store';
import { getRepairQuestStatus } from '../streak-repair-quest';
import { RepairQuestStatusOutputSchema } from '../schemas-risk-repair';
import type { RepairQuestStatusOutput } from '../schemas-risk-repair';
import type { UseStreakRepairQuestReturn } from './types';

const QUERY_KEYS = {
  repairQuestStatus: (userId: string) => [
    'streaks',
    'repairQuestStatus',
    userId,
  ],
} as const;
const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

export function useRepairQuestStatus(): Pick<
  UseStreakRepairQuestReturn,
  | 'status'
  | 'isStatusLoading'
  | 'statusError'
  | 'refetchStatus'
  | 'canStartQuest'
  | 'progressPercent'
  | 'hoursRemaining'
> {
  const userId = useAuthStore((state) => state.user?.id);
  const {
    data: status,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatusFn,
  } = useQuery({
    queryKey: QUERY_KEYS.repairQuestStatus(userId ?? ''),
    queryFn: async (): Promise<RepairQuestStatusOutput | null> => {
      if (!userId) {return null;}
      try {
        const statusData = await getRepairQuestStatus(userId);
        return RepairQuestStatusOutputSchema.parse(statusData);
      } catch (err: unknown) {
        Sentry.captureException(err, {
          tags: {
            feature: 'streaks',
            hook: 'useRepairQuestStatus',
            operation: 'fetchStatus',
          },
        });
        throw err;
      }
    },
    enabled: !!userId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: 3,
  });

  return {
    status: status ?? null,
    isStatusLoading,
    statusError: statusError as Error | null,
    refetchStatus: async () => {
      await refetchStatusFn();
    },
    canStartQuest: status?.canStartQuest ?? false,
    progressPercent: status?.progressPercent ?? 0,
    hoursRemaining: status?.hoursRemaining ?? 0,
  };
}
