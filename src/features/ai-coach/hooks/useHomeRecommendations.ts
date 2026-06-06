/**
 * Home Recommendations Hook
 *
 * Canonical home-screen recommendation hook.
 * Wraps coach recommendation queries so home containers never call
 * useQuery or repository directly.
 *
 * Data flow: Container → useHomeRecommendations → useActiveCoachRecommendations
 * → fetchActiveRecommendations (service) → repository → Supabase
 */

import { useActiveCoachRecommendations } from './useCoachRecommendations';
import type { SessionRecommendation } from './useRecommendationMutations';
import type { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

export interface HomeRecommendationsResult {
  primaryRecommendation: SessionRecommendation | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<SessionRecommendation[], Error>>;
}

export function useHomeRecommendations(
  userId: string,
  enabled: boolean,
): HomeRecommendationsResult {
  return useActiveCoachRecommendations(userId, enabled);
}
