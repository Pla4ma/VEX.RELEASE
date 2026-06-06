/**
 * Streaks Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../shared/ui/components/Toast';
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
  type Streak,
  type StreakSummary,
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
  const { show } = useToast();

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
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'streaks', operation: 'recordSession' } });
      show({ type: 'error', title: 'Streak not recorded', message: 'Try again when connection returns.' });
    },
  });
}

export function useUseShield() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<boolean, Error, UseShieldInput, { key: ReturnType<typeof streakKeys.byUser>; previousStreak: Streak | undefined; previousSummary: StreakSummary | undefined }>({
    mutationFn: async (input) => {
      const validated = UseShieldInputSchema.parse(input);
      return service.useShield(validated);
    },
    onMutate: async (variables) => {
      const key = streakKeys.byUser(variables.userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousStreak = queryClient.getQueryData<Streak>(key);
      const previousSummary = queryClient.getQueryData<StreakSummary>(streakKeys.summary(variables.userId));

      if (previousStreak) {
        queryClient.setQueryData<Streak>(key, {
          ...previousStreak,
          shieldsAvailable: Math.max(0, previousStreak.shieldsAvailable - 1),
          gracePeriodUsed: true,
        });
      }

      if (previousSummary) {
        queryClient.setQueryData<StreakSummary>(streakKeys.summary(variables.userId), {
          ...previousSummary,
          shieldAvailable: false,
          isAtRisk: false,
          riskLevel: 'NONE',
        });
      }

      return { key, previousStreak, previousSummary };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: streakKeys.byUser(variables.userId),
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousStreak) {
        queryClient.setQueryData(context.key, context.previousStreak);
      }
      if (context?.previousSummary) {
        queryClient.setQueryData(streakKeys.summary(variables.userId), context.previousSummary);
      }
      Sentry.captureException(error, { tags: { feature: 'streaks', operation: 'useShield' } });
      show({ type: 'error', title: 'Shield failed', message: 'Try again when connection returns.' });
    },
  });
}

export function useFreezeStreak() {
  const queryClient = useQueryClient();
  const { show } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await service.freezeStreak(userId);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: streakKeys.byUser(userId),
      });
    },
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'streaks', operation: 'freezeStreak' } });
      show({ type: 'error', title: 'Freeze failed', message: 'Try again when connection returns.' });
    },
  });
}

export function useRestoreStreak() {
  const queryClient = useQueryClient();
  const { show } = useToast();

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
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'streaks', operation: 'restoreStreak' } });
      show({ type: 'error', title: 'Restore failed', message: 'Try again when connection returns.' });
    },
  });
}
