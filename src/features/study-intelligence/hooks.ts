import { useQuery } from '@tanstack/react-query';
import { useStudyOsPlans } from '../study-os/hooks';
import {
  computeWeeklyIntelligence,
  hasWeeklyIntelligenceData,
} from './service';
import type { WeeklyIntelligence } from './schemas';

export function useWeeklyIntelligence(input: {
  userId: string | null;
  streakDays: number;
  enabled?: boolean;
}): {
  data: WeeklyIntelligence | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
} {
  const { data: plans, isPending: plansPending } = useStudyOsPlans(
    input.userId,
    input.enabled !== false,
  );

  const { data, isPending, isError, error, refetch } = useQuery({
    enabled: Boolean(input.userId) && input.enabled !== false && !plansPending,
    queryFn: () =>
    computeWeeklyIntelligence({ plans, streakDays: input.streakDays }),
    queryKey: ['study-intelligence', input.userId, plans?.length ?? 0],
    staleTime: 1000 * 60 * 5,
    });







  return {
    data: data ?? null,
    isPending: plansPending || isPending,
    isError: isError,
    error: error as Error | null,
    refetch: refetch,
  };
}

export function useHasWeeklyIntelligenceData(
  userId: string | null,
  enabled = true,
): boolean {
  const { data: plans } = useStudyOsPlans(userId, enabled);
  return hasWeeklyIntelligenceData(plans);
}
