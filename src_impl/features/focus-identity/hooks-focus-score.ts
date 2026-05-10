
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store';
import { fetchCurrentFocusScore, fetchFocusScoreHistory } from './repository-focus-score';
import { focusScoreKeys } from './focus-score-query-keys';

export function useFocusScore() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data: score, status, error, refetch } = useQuery({
    queryKey: focusScoreKeys.current(userId!),
    queryFn: () => fetchCurrentFocusScore(userId!),
    enabled: !!userId,
  });

  const { data: history } = useQuery({
    queryKey: focusScoreKeys.history(userId!),
    queryFn: () => fetchFocusScoreHistory(userId!, 30),
    enabled: !!userId,
  });

  return { score, history, status, error, refetch };
}

export function useFocusScoreHistory(userId: string, days: number = 90) {
  const { data: history, status, error, refetch } = useQuery({
    queryKey: focusScoreKeys.history(userId, days),
    queryFn: () => fetchFocusScoreHistory(userId, days),
    enabled: !!userId,
  });

  return { history, status, error, refetch };
}
