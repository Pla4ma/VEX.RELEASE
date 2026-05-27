/**
 * useActiveStudyPlan Hook
 * Returns the user's currently active study plan for session suggestions
 */

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store";
import { contentStudyQueryKeys } from "./queryKeys";
import { resolveActiveStudyPlan, type ActiveStudyPlan } from "./helpers";

export function useActiveStudyPlan(options: { enabled?: boolean } = {}) {
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  return useQuery<ActiveStudyPlan | null>({
    queryKey: contentStudyQueryKeys.activePlan(userId),
    queryFn: resolveActiveStudyPlan,
    enabled: Boolean(userId) && options.enabled !== false,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export type { ActiveStudyPlan };
