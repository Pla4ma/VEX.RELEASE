/**
 * useCoachState Hook
 *
 * Enhanced hook for fetching and managing coach state with offline support.
 */

import { useState, useCallback } from 'react';
import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from '@tanstack/react-query';
import { useCoachStore } from '../store';
import { fetchCoachState } from '../repository/state';
import { COACH_QUERY_KEYS } from '../constants';
import { useNetworkStatus } from './useNetworkStatus';
import type { CoachState } from '../types';

const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  retryCondition: (error: Error) => {
    if (error.message.includes('404') || error.message.includes('403')) {
      return false;
    }
    return true;
  },
};

export interface UseCoachStateResult {
  data: CoachState | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isRetrying: boolean;
  isDegraded: boolean;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<CoachState, Error>>;
  retry: () => void;
}

export function useCoachState(userId: string): UseCoachStateResult {
  const network = useNetworkStatus();
  const store = useCoachStore();
  const [isRetrying, setIsRetrying] = useState(false);
  const fallbackState = useCallback(
    (): CoachState => ({
      userId,
      currentState: 'MUTED_MODE',
      previousState: null,
      stateEnteredAt: Date.now(),
      personaId: store.selectedPersona ?? 'FRIEND',
      behaviorProfile: null,
      lastInterventionAt: null,
      interventionsToday: 0,
      muteUntil: null,
      reduceNotifications: store.reduceNotifications,
    }),
    [store.reduceNotifications, store.selectedPersona, userId],
  );
  const query = useQuery({
    queryKey: COACH_QUERY_KEYS.state(userId),
    queryFn: async () => {
      if (!network.isConnected) {
        return fallbackState();
      }
      return (await fetchCoachState(userId)) ?? fallbackState();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
    networkMode: 'offlineFirst',
  });
  const handleRetry = useCallback(() => {
    setIsRetrying(true);
    query.refetch().finally(() => setIsRetrying(false));
  }, [query]);
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRetrying,
    isDegraded: !network.isConnected || query.status === 'error',
    refetch: async (options?: RefetchOptions) => query.refetch(options),
    retry: handleRetry,
  };
}
