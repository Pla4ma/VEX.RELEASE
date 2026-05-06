import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNetInfo } from "../../network";
import {
  fetchCurrentFocusScore,
  fetchFocusScoreHistory,
  fetchMonthlyFocusReportInput,
  type MonthlyFocusReportInput,
} from "./repository-focus-score";
import { focusScoreKeys } from "./focus-score-query-keys";
import type { FocusScoreHistoryPoint, FocusScoreRecord } from "./types";

export interface FocusScoreDashboardModel {
  current: FocusScoreRecord | null;
  history: FocusScoreHistoryPoint[];
  monthlyInput: MonthlyFocusReportInput | null;
  isOffline: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  refetch: () => Promise<unknown>;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function useFocusScoreCard(userId: string | null) {
  const currentQuery = useQuery({
    queryKey: focusScoreKeys.current(userId ?? ""),
    queryFn: () => fetchCurrentFocusScore(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });

  return currentQuery;
}

export function useFocusScoreDashboardModel(userId: string | null, days = 30): FocusScoreDashboardModel {
  const { isConnected } = useNetInfo();
  const month = getCurrentMonth();
  const currentQuery = useQuery({
    queryKey: focusScoreKeys.current(userId ?? ""),
    queryFn: () => fetchCurrentFocusScore(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });
  const historyQuery = useQuery({
    queryKey: focusScoreKeys.history(userId ?? "", days),
    queryFn: () => fetchFocusScoreHistory(userId ?? "", days),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });
  const monthlyQuery = useQuery({
    queryKey: focusScoreKeys.monthlyInput(userId ?? "", month),
    queryFn: () => fetchMonthlyFocusReportInput(userId ?? "", month),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });

  const error = useMemo<Error | null>(() => {
    if (currentQuery.error instanceof Error) {return currentQuery.error;}
    if (historyQuery.error instanceof Error) {return historyQuery.error;}
    if (monthlyQuery.error instanceof Error) {return monthlyQuery.error;}
    return null;
  }, [currentQuery.error, historyQuery.error, monthlyQuery.error]);

  return {
    current: currentQuery.data ?? null,
    history: historyQuery.data ?? [],
    monthlyInput: monthlyQuery.data ?? null,
    isOffline: !isConnected,
    isPending: currentQuery.isPending || historyQuery.isPending || monthlyQuery.isPending,
    isError: Boolean(error),
    error,
    isRefetching: currentQuery.isRefetching || historyQuery.isRefetching || monthlyQuery.isRefetching,
    refetch: async () =>
      Promise.all([
        currentQuery.refetch(),
        historyQuery.refetch(),
        monthlyQuery.refetch(),
      ]),
  };
}
