/**
 * Coach Recommendations Hooks
 *
 * useCoachRecommendations + useActiveCoachRecommendations
 * Moved from root hooks.ts to resolve hooks.ts vs hooks/ coexistence.
 */

import { useMemo } from 'react';
import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from '@tanstack/react-query';
import { COACH_QUERY_KEYS } from '../constants';
import { fetchActiveRecommendations } from '../service/coach-service';
import type { SessionRecommendation } from './useRecommendationMutations';

type ActiveCoachRecommendationsOptions = {
  enabled?: boolean;
};

type ActiveCoachRecommendationsResult = {
  data: SessionRecommendation[] | undefined;
  primaryRecommendation: SessionRecommendation | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<SessionRecommendation[], Error>>;
};

export function useCoachRecommendations(
  userId: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery<SessionRecommendation[], Error>({
    queryKey: COACH_QUERY_KEYS.recommendations(userId ?? ''),
    queryFn: () => fetchActiveRecommendations(userId!),
    enabled: !!userId && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveCoachRecommendations(
  userId: string,
  options: ActiveCoachRecommendationsOptions | boolean = {},
): ActiveCoachRecommendationsResult {
  const enabled =
    typeof options === 'boolean' ? options : (options.enabled ?? true);
  const { data, isPending, isError, error, refetch } = useQuery<
    SessionRecommendation[],
    Error
  >({
    queryKey: COACH_QUERY_KEYS.recommendations(userId),
    queryFn: () => fetchActiveRecommendations(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
  const primaryRecommendation = useMemo(
    () =>
      (data ?? [])
        .filter(
          (item) => item.status === 'ACTIVE' && item.expiresAt > Date.now(),
        )
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ?? null,
    [data],
  );
  return { data, primaryRecommendation, isPending, isError, error, refetch };
}

export type { ActiveCoachRecommendationsResult };
