import { useQuery } from '@tanstack/react-query';
import { streakKeys } from './streakKeys';
import * as service from './service';

export function useStreak(userId: string | null) {
  return useQuery({
    queryKey: streakKeys.byUser(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return service.getOrCreateStreak(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useStreakSummary(userId: string | null) {
  return useQuery({
    queryKey: streakKeys.summary(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return service.getStreakSummary(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useComebackState(userId: string | null) {
  return useQuery({
    queryKey: streakKeys.comeback(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return service.detectComeback(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useStreakMultiplier(userId: string | null) {
  return useQuery({
    queryKey: streakKeys.multiplier(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID required');
      return service.getOrCreateStreak(userId).then((s) => ({
        days: s.currentDays,
        multiplier: service.getStreakMultiplier(s.currentDays),
      }));
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
