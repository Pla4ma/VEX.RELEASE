import { useQuery } from "@tanstack/react-query";
import { useNetInfo } from "../../network";
import { useAuthStore } from "../../store";
import {
  getCurrentFocusScore,
  getFocusScoreHistory,
} from "./focus-score-service";
import { focusScoreKeys } from "./focus-score-query-keys";
import type {
  FocusScoreDashboardModel,
  FocusScoreHistoryPoint,
  FocusScoreRecord,
} from "./types";

type FocusScoreHookResult = {
  score: FocusScoreRecord | null;
  history: FocusScoreHistoryPoint[];
  status: "error" | "pending" | "success";
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
};

export type { FocusScoreDashboardModel };

export function useFocusScore(
  requestedUserId?: string | null,
  days: number = 30,
): FocusScoreHookResult {
  const { user } = useAuthStore();
  const userId = requestedUserId ?? user?.id ?? null;

  const scoreQuery = useQuery({
    queryKey: focusScoreKeys.current(userId ?? "none"),
    queryFn: () => getCurrentFocusScore(userId ?? ""),
    enabled: Boolean(userId),
  });

  const historyQuery = useQuery({
    queryKey: focusScoreKeys.history(userId ?? "none", days),
    queryFn: () => getFocusScoreHistory(userId ?? "", days),
    enabled: Boolean(userId),
  });

  const refresh = scoreQuery.refetch;
  return {
    score: scoreQuery.data ?? null,
    history: historyQuery.data ?? [],
    status: scoreQuery.status,
    error: scoreQuery.error instanceof Error ? scoreQuery.error : null,
    refetch: () => {
      void refresh();
    },
    isRefetching: scoreQuery.isRefetching,
  };
}

export function useFocusScoreHistory(
  userId: string,
  days: number = 90,
): {
  history: FocusScoreHistoryPoint[];
  status: "error" | "pending" | "success";
  error: Error | null;
  refetch: () => void;
} {
  const historyQuery = useQuery({
    queryKey: focusScoreKeys.history(userId, days),
    queryFn: () => getFocusScoreHistory(userId, days),
    enabled: !!userId,
  });
  const refresh = historyQuery.refetch;

  return {
    history: historyQuery.data ?? [],
    status: historyQuery.status,
    error: historyQuery.error instanceof Error ? historyQuery.error : null,
    refetch: () => {
      void refresh();
    },
  };
}

export function useFocusScoreDashboardModel(
  userId: string | null,
  days: number = 30,
): FocusScoreDashboardModel {
  const { isOnline } = useNetInfo();
  const { score, history, status, error, refetch, isRefetching } =
    useFocusScore(userId, days);

  return {
    current: score ?? null,
    history: history ?? [],
    monthlyInput: null,
    isOffline: !isOnline,
    isPending: status === "pending",
    isError: status === "error",
    error: error instanceof Error ? error : null,
    isRefetching,
    isOptionalDataSyncing: false,
    optionalDataError: null,
    refetch,
  };
}
