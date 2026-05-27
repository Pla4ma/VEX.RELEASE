import { useQuery } from "@tanstack/react-query";
import { useStudyOsPlans } from "../study-os/hooks";
import {
  computeWeeklyIntelligence,
  hasWeeklyIntelligenceData,
} from "./service";
import type { WeeklyIntelligence } from "./schemas";

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

  const query = useQuery({
    enabled: Boolean(input.userId) && input.enabled !== false && !plansPending,
    queryFn: () =>
      computeWeeklyIntelligence({ plans, streakDays: input.streakDays }),
    queryKey: ["study-intelligence", input.userId, plans?.length ?? 0],
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: query.data ?? null,
    isPending: plansPending || query.isPending,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function useHasWeeklyIntelligenceData(
  userId: string | null,
  enabled = true,
): boolean {
  const { data: plans } = useStudyOsPlans(userId, enabled);
  return hasWeeklyIntelligenceData(plans);
}
