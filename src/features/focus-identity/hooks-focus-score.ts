import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '../../network/useNetInfo';
import { useAuthStore } from '../../store';
import {
  getCurrentFocusScore,
  getFocusScoreHistory,
} from './focus-score-service';
import { focusScoreKeys } from './focus-score-query-keys';
import type {
  FocusScoreDashboardModel,
  FocusScoreHistoryPoint,
  FocusScoreRecord,
} from './types';

type FocusScoreHookResult = {
  score: FocusScoreRecord | null;
  history: FocusScoreHistoryPoint[];
  status: 'error' | 'pending' | 'success';
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

  const { refetch, data, status, error, isRefetching } = useQuery({
    queryKey: focusScoreKeys.current(userId ?? 'none'),
    queryFn: () => getCurrentFocusScore(userId ?? ''),
    enabled: Boolean(userId),
    });





  const { data: historyData, status: historyStatus, error: historyError, refetch: refetchHistory } = useQuery({
    queryKey: focusScoreKeys.history(userId ?? 'none', days),
    queryFn: () => getFocusScoreHistory(userId ?? '', days),
    enabled: Boolean(userId),
  });

  const refresh = refetch;
  return {
    score: data ?? null,
    history: historyData ?? [],
    status: status,
    error: error instanceof Error ? error : null,
    refetch: () => {
      refresh();
    },
    isRefetching: isRefetching,
  };
}

export function useFocusScoreHistory(
  userId: string,
  days: number = 90,
): {
  history: FocusScoreHistoryPoint[];
  status: 'error' | 'pending' | 'success';
  error: Error | null;
  refetch: () => void;
} {
  const { data, status, error, refetch: refreshHistory } = useQuery({
    queryKey: focusScoreKeys.history(userId, days),
    queryFn: () => getFocusScoreHistory(userId, days),
    enabled: !!userId,
  });
  const refresh = refreshHistory;

  return {
    history: data ?? [],
    status: status,
    error: error instanceof Error ? error : null,
    refetch: () => {
      refresh();
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
    isPending: status === 'pending',
    isError: status === 'error',
    error: error instanceof Error ? error : null,
    isRefetching,
    isOptionalDataSyncing: false,
    optionalDataError: null,
    refetch,
  };
}
