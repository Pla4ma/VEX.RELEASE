import { useQuery } from '@tanstack/react-query';
import { computeWeeklySummary } from './service';
import type { WeeklyFocusSummary } from './schemas';

export function useWeeklyFocusSummary(userId: string, weekOffset = 0): {
  data: WeeklyFocusSummary | null;
  error: Error | null;
  isError: boolean;
  isPending: boolean;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ['weekly-focus-summary', userId, weekOffset],
    queryFn: () => computeWeeklySummary({ userId, weekOffset }),
    enabled: userId.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
  const refresh = query.refetch;

  return {
    data: query.data ?? null,
    error: query.error instanceof Error ? query.error : null,
    isError: query.isError,
    isPending: query.isPending,
    refetch: () => {
      void refresh();
    },
  };
}

export type WeeklyFocusSummaryQuery = ReturnType<typeof useWeeklyFocusSummary>;
