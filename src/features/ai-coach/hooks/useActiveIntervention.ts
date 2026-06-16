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

  const { data: stateData, error: stateError, refetch: refetchState, isLoading: stateLoading, isPending: statePending, isError: stateIsError } = useQuery({
    queryKey: userId
      ? COACH_QUERY_KEYS.state(userId)
      : [...COACH_QUERY_KEYS.all, 'state', 'anonymous'],
    queryFn: () => fetchCoachState(userId ?? ''),
    enabled,
    staleTime: 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
  });

  const { data: profileData, error: profileError, refetch: refetchProfile, isLoading: profileLoading, isPending: profilePending, isError: profileIsError } = useQuery({
    queryKey: userId
      ? COACH_QUERY_KEYS.profile(userId)
      : [...COACH_QUERY_KEYS.all, 'profile', 'anonymous'],
    queryFn: () => fetchBehaviorProfile(userId ?? ''),
    enabled,
    staleTime: 60 * 1000,
    retry: RETRY_CONFIG.maxRetries,
    retryDelay: RETRY_CONFIG.retryDelay,
  });

  const { data: messagesData, error: messagesError, refetch: refetchMessages, isLoading: messagesLoading, isPending: messagesPending, isError: messagesIsError } = useQuery({
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
        stateError ?? profileError ?? messagesError,
      ),
    [messagesError, profileError, stateError],
  );

  const intervention = useMemo(() => {
    const candidate = buildActiveIntervention({
      userId,
      state: stateData ?? null,
      profile: profileData ?? null,
      messages: messagesData ?? [],
    });
    if (!candidate || dismissedIds.has(candidate.id)) {
      return null;
    }
    return candidate;
  }, [
    dismissedIds,
    messagesData,
    profileData,
    stateData,
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
        refetchState(),
        refetchProfile(),
        refetchMessages(),
      ]);
    } catch (refetchError) {
      captureSilentFailure(refetchError, {
        feature: 'ai-coach',
        operation: 'active-intervention-refetch',
        type: 'network',
      });
    }
  }, [refetchState, refetchProfile, refetchMessages]);

  return {
    intervention,
    data: intervention,
    isLoading: stateLoading || profileLoading || messagesLoading,
    isPending: statePending || profilePending || messagesPending,
    isError: stateIsError || profileIsError || messagesIsError,
    error,
    refetch,
    dismiss,
  };
}

export type { ActiveIntervention };
