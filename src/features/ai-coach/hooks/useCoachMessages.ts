/**
 * useCoachMessages Hook
 *
 * Fetches coach messages with offline support.
 */

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from '@tanstack/react-query';
import * as repository from '../repository';
import { COACH_QUERY_KEYS, RETRY_CONFIG } from '../constants';
import { useNetworkStatus } from './useNetworkStatus';
import type { CoachMessage } from '../types';

export interface UseCoachMessagesResult {
  data: CoachMessage[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<CoachMessage[], Error>>;
}

export function useCoachMessages(userId: string): UseCoachMessagesResult {
  const network = useNetworkStatus();
  const query = useQuery({
    queryKey: COACH_QUERY_KEYS.messages(userId),
    queryFn: async () => {
      if (!network.isConnected) {
        return [];
      }
      return repository.fetchRecentMessages(userId, 50, 0);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
    networkMode: 'offlineFirst',
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: async (options?: RefetchOptions) => query.refetch(options),
  };
}
