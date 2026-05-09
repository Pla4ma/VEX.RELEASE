import { useQuery } from '@tanstack/react-query';

import { getWeeklyQuestStateForUser } from '../service';
import type { WeeklyQuestState } from '../schemas';

export function useWeeklyQuestState(
  userId: string | null,
  timestamp: number,
): {
  data: WeeklyQuestState | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery({
    enabled: Boolean(userId),
    queryFn: () => getWeeklyQuestStateForUser(userId ?? '', timestamp),
    queryKey: ['weekly-quest', userId, timestamp],
    staleTime: 30 * 1000,
  });

  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}
