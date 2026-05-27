import { useQuery } from "@tanstack/react-query";

import { getSessionHistoryViewModel } from "./service";
import type { SessionHistoryViewModel } from "./schemas";

const EMPTY_HISTORY: SessionHistoryViewModel = {
  items: [],
  stats: {
    totalSessions: 0,
    completedSessions: 0,
    totalFocusSeconds: 0,
    averageScore: null,
  },
};

export function useSessionHistoryRecords(
  userId: string | null,
  limit = 50,
): {
  data: SessionHistoryViewModel;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ["session-history", userId, limit],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return EMPTY_HISTORY;
      }
      return getSessionHistoryViewModel(userId, limit);
    },
  });
  const retryHistory = query.refetch;

  return {
    data: query.data ?? EMPTY_HISTORY,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error instanceof Error ? query.error : null,
    refetch: () => {
      void retryHistory();
    },
  };
}
