import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { FeatureKey } from '../features/liveops-config/feature-access';
import { isCoreQueryKey, createPrefetcher } from './prefetcher';
import {
  type PrefetchPolicy,
  type PrefetchQueriesReturn,
} from './prefetch-query-keys';

export function usePrefetchQueries(
  defaultPolicy?: PrefetchPolicy,
): PrefetchQueriesReturn {
  const queryClient = useQueryClient();
  const prefetcher = useMemo(
    () => createPrefetcher(queryClient, defaultPolicy),
    [defaultPolicy, queryClient],
  );

  const prefetchSession = useCallback(() => prefetcher.session(), [prefetcher]);
  const prefetchSocial = useCallback(
    (policy?: PrefetchPolicy) => prefetcher.social(policy),
    [prefetcher],
  );
  const prefetchShop = useCallback(
    (policy?: PrefetchPolicy) => prefetcher.shop(policy),
    [prefetcher],
  );
  const prefetchBattlePass = useCallback(
    (policy?: PrefetchPolicy) => prefetcher.battlePass(policy),
    [prefetcher],
  );
  const prefetchProfile = useCallback(
    (policy?: PrefetchPolicy) => prefetcher.profile(policy),
    [prefetcher],
  );
  const prefetchByKey = useCallback(
    (queryKey: readonly string[]) => {
      if (!isCoreQueryKey(queryKey)) {return;}
      queryClient.prefetchQuery({ queryKey, staleTime: 60 * 1000 });
    },
    [queryClient],
  );
  const prefetchByFeature = useCallback(
    (
      feature: FeatureKey,
      queryKey: readonly string[],
      policy?: PrefetchPolicy,
    ) => {
      prefetcher.byFeature(feature, queryKey, policy);
    },
    [prefetcher],
  );

  return {
    prefetchSession,
    prefetchSocial,
    prefetchShop,
    prefetchBattlePass,
    prefetchProfile,
    prefetchByKey,
    prefetchByFeature,
  };
}
