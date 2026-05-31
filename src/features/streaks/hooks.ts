/**
 * Streaks Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as service from './service';
import * as repository from './repository';
import {
  RecordSessionInputSchema,
  UseShieldInputSchema,
  RestoreStreakInputSchema,
  type RecordSessionInput,
  type UseShieldInput,
  type RestoreStreakInput,
  type StreakEngineResult,
} from './schemas';

export type { StreakCalendarData } from './hooks-calendar';
export { useStreakCalendar } from './hooks-calendar';

// ============================================================================
// Query Keys
// ============================================================================

export const streakKeys = {
  all: ['streaks'] as const,
  byUser: (userId: string) => [...streakKeys.all, 'user', userId] as const,
  summary: (userId: string) =>
    [...streakKeys.byUser(userId), 'summary'] as const,
  comeback: (userId: string) =>
    [...streakKeys.byUser(userId), 'comeback'] as const,
  multiplier: (userId: string) =>
    [...streakKeys.byUser(userId), 'multiplier'] as const,
};

// ============================================================================
// Read Hooks
// ============================================================================

export function useStreak(userId: string | null) {
  return useQuery({
    queryKey: streakKeys.byUser(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
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
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getStreakSummary(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for risk updates
  });
}

export function useComebackState(userId: string | null) {
  return useQuery({
    queryKey: streakKeys.comeback(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
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
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getOrCreateStreak(userId).then((s) => ({
        days: s.currentDays,
        multiplier: service.getStreakMultiplier(s.currentDays),
      }));
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

export function useRecordSession() {
  const queryClient = useQueryClient();

  return useMutation<StreakEngineResult, Error, RecordSessionInput>({
    mutationFn: async (input) => {
      const validated = RecordSessionInputSchema.parse(input);
      return service.recordSession(validated);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: streakKeys.byUser(variables.userId),
      });
    },
  });
}

export function useUseShield() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, UseShieldInput>({
    mutationFn: async (input) => {
      const validated = UseShieldInputSchema.parse(input);
      return service.useShield(validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: streakKeys.byUser(variables.userId),
      });
    },
  });
}

export function useFreezeStreak() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await service.freezeStreak(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: streakKeys.byUser(userId),
      });
    },
  });
}

export function useRestoreStreak() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, RestoreStreakInput>({
    mutationFn: async (input) => {
      const validated = RestoreStreakInputSchema.parse(input);
      return service.restoreStreak(validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: streakKeys.byUser(variables.userId),
      });
    },
  });
}
