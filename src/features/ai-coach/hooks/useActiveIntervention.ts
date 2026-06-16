import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { captureSilentFailure } from '../../../utils/silent-failure';
import {
  buildActiveIntervention,
  type ActiveIntervention,
} from '../intervention/active-intervention';
import {
  fetchBehaviorProfile,
  fetchCoachState,
  fetchRecentMessages,
} from '../repository';
import { COACH_QUERY_KEYS, RETRY_CONFIG } from '../constants';

interface ActiveInterventionResult {
  intervention: ActiveIntervention | null;
  data: ActiveIntervention | null;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  dismiss: (interventionId: string) => void;
}

function normalizeError(error: unknown): Error | null {
  if (!error) {
    return null;
  }
  return error instanceof Error ? error : new Error(String(error));
}

export function useActiveIntervention(
  userId?: string,
): ActiveInterventionResult {
  const enabled = Boolean(userId);
  const [dismissedIds, setDismissedIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  const stateQuery = useQuery({
    queryKey: userId
      ? COACH_QUERY_KEYS.state(userId)
      : [...COACH_QUERY_KEYS.all, 'state', 'anonymous'],
    queryFn: () => fetchCoachState(userId ?? ''),
    enabled,
    staleTime: 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
  });

  const profileQuery = useQuery({
    queryKey: userId
      ? COACH_QUERY_KEYS.profile(userId)
      : [...COACH_QUERY_KEYS.all, 'profile', 'anonymous'],
    queryFn: () => fetchBehaviorProfile(userId ?? ''),
    enabled,
    staleTime: 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
  });

  const messagesQuery = useQuery({
    queryKey: userId
      ? COACH_QUERY_KEYS.history(userId, 20)
      : [...COACH_QUERY_KEYS.all, 'history', 'anonymous', 20],
    queryFn: () => fetchRecentMessages(userId ?? '', 20, 0),
    enabled,
    staleTime: 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
  });

  const error = useMemo(
    () =>
      normalizeError(
        stateQuery.error ?? profileQuery.error ?? messagesQuery.error,
      ),
    [messagesQuery.error, profileQuery.error, stateQuery.error],
  );

  const intervention = useMemo(() => {
    const candidate = buildActiveIntervention({
      userId,
      state: stateQuery.data ?? null,
      profile: profileQuery.data ?? null,
      messages: messagesQuery.data ?? [],
    });
    if (!candidate || dismissedIds.has(candidate.id)) {
      return null;
    }
    return candidate;
  }, [
    dismissedIds,
    messagesQuery.data,
    profileQuery.data,
    stateQuery.data,
    userId,
  ]);

  const dismiss = useCallback((interventionId: string): void => {
    setDismissedIds((current) => {
      const next = new Set(current);
      next.add(interventionId);
      return next;
    });
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        stateQuery.refetch(),
        profileQuery.refetch(),
        messagesQuery.refetch(),
      ]);
    } catch (refetchError) {
      captureSilentFailure(refetchError, {
        feature: 'ai-coach',
        operation: 'active-intervention-refetch',
        type: 'network',
      });
    }
  }, [messagesQuery, profileQuery, stateQuery]);

  return {
    intervention,
    data: intervention,
    isLoading:
      stateQuery.isLoading || profileQuery.isLoading || messagesQuery.isLoading,
    isPending:
      stateQuery.isPending || profileQuery.isPending || messagesQuery.isPending,
    isError:
      stateQuery.isError || profileQuery.isError || messagesQuery.isError,
    error,
    refetch,
    dismiss,
  };
}

export type { ActiveIntervention };
