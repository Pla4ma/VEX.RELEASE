/**
 * Progression Hooks
 * TanStack Query hooks for UI consumption
 */

import { useQuery } from '@tanstack/react-query';
import { progressionKeys } from './query-keys';
import * as service from '../service';
import * as repository from '../repository';
import {
  getProgressionEnhanced,
  getProgressionSummaryEnhanced,
} from '../service-read';
export { progressionKeys } from './query-keys';
export { useAddXp, usePrestige } from './progression-mutations';
export { useOptimisticXp } from './use-optimistic-xp';

// Read Hooks
// ============================================================================

export function useProgression(userId: string | null) {
  return useQuery({
    queryKey: progressionKeys.byUser(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return getProgressionEnhanced(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useProgressionSummary(userId: string | null) {
  return useQuery({
    queryKey: progressionKeys.summary(userId || ''),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return getProgressionSummaryEnhanced(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useXpHistory(
  userId: string | null,
  options?: { limit?: number; since?: number },
) {
  return useQuery({
    queryKey: [...progressionKeys.history(userId || ''), options],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return repository.fetchXpHistory(userId, options);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDailyProgress(userId: string | null, date: string) {
  return useQuery({
    queryKey: progressionKeys.daily(userId || '', date),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      return service.getDailyProgress(userId);
    },
    enabled: !!userId,
  });
}
