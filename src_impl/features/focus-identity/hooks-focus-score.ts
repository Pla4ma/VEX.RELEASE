
import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '../../network';
import { useAuthStore } from '../../store';
import { fetchCurrentFocusScore, fetchFocusScoreHistory } from './repository-focus-score';
import { focusScoreKeys } from './focus-score-query-keys';
import type { FocusScoreDashboardModel } from './types';

export function useFocusScore() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data: score, status, error, refetch, isRefetching } = useQuery({
    queryKey: focusScoreKeys.current(userId!),
    queryFn: () => fetchCurrentFocusScore(userId!),
    enabled: !!userId,
  });

  const { data: history } = useQuery({
    queryKey: focusScoreKeys.history(userId!, 30),
    queryFn: () => fetchFocusScoreHistory(userId!, 30),
    enabled: !!userId,
  });

  return { score, history, status, error, refetch, isRefetching };
}

export function useFocusScoreHistory(userId: string, days: number = 90) {
  const { data: history, status, error, refetch } = useQuery({
    queryKey: focusScoreKeys.history(userId, days),
    queryFn: () => fetchFocusScoreHistory(userId, days),
    enabled: !!userId,
  });

  return { history, status, error, refetch };
}

export function useFocusScoreDashboardModel(userId: string | null, days: number = 30): FocusScoreDashboardModel {
  const { isOnline } = useNetInfo();
  const { score, history, status, error, refetch } = useFocusScore();

  return {
    current: score ?? null,
    history: history ?? [],
    monthlyInput: null,
    isOffline: !isOnline,
    isPending: status === 'pending',
    isError: status === 'error',
    error: error instanceof Error ? error : null,
    isRefetching: false,
    isOptionalDataSyncing: false,
    optionalDataError: null,
    refetch: () => void (refetch)(),
  };
}
