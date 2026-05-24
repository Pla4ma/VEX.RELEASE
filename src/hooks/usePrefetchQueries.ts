import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { FeatureAccessMap, FeatureKey } from '../features/liveops-config/feature-access';
import {
  getFeatureAvailability,
  isFeatureAvailableForQueries,
} from '../features/liveops-config/feature-availability';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('prefetch');

const QueryKeys = {
  SESSION: {
    CONFIG: ['session', 'config'] as const,
    ACTIVE: ['session', 'active'] as const,
    HISTORY: ['session', 'history'] as const,
  },
  SQUAD: {
    MEMBERS: ['squad', 'members'] as const,
    STATUS: ['squad', 'status'] as const,
    WARS: ['squad', 'wars'] as const,
  },
  SOCIAL: {
    FEED: ['social', 'feed'] as const,
    RIVALS: ['social', 'rivals'] as const,
    LEADERBOARD: ['social', 'leaderboard'] as const,
  },
  SHOP: {
    ITEMS: ['shop', 'items'] as const,
    CATEGORIES: ['shop', 'categories'] as const,
    OFFERS: ['shop', 'offers'] as const,
  },
  BATTLE_PASS: {
    PROGRESS: ['battle-pass', 'progress'] as const,
    TIERS: ['battle-pass', 'tiers'] as const,
  },
  USER: {
    PROFILE: ['user', 'profile'] as const,
    WALLET: ['user', 'wallet'] as const,
    INVENTORY: ['user', 'inventory'] as const,
  },
} as const;

interface PrefetchPolicy {
  featureAccess?: FeatureAccessMap;
  totalCompletedSessions?: number;
}

interface PrefetchOptions {
  queryKey: readonly string[];
  staleTime: number;
  queryFn?: () => Promise<null>;
}

interface PrefetchQueryClient {
  prefetchQuery: (options: PrefetchOptions) => Promise<void>;
}

interface PrefetchQueriesReturn {
  prefetchSession: (policy?: PrefetchPolicy) => void;
  prefetchSocial: (policy?: PrefetchPolicy) => void;
  prefetchShop: (policy?: PrefetchPolicy) => void;
  prefetchBattlePass: (policy?: PrefetchPolicy) => void;
  prefetchProfile: (policy?: PrefetchPolicy) => void;
  prefetchByKey: (queryKey: readonly string[]) => void;
  prefetchByFeature: (
    feature: FeatureKey,
    queryKey: readonly string[],
    policy?: PrefetchPolicy,
  ) => void;
}

function nullQuery(): Promise<null> {
  return Promise.resolve(null);
}

function mergePolicy(base: PrefetchPolicy | undefined, next: PrefetchPolicy | undefined): PrefetchPolicy {
  return { ...base, ...next };
}

function canPrefetchFeature(policy: PrefetchPolicy | undefined, feature: FeatureKey): boolean {
  if (policy?.totalCompletedSessions === 0) return false;
  const access = policy?.featureAccess?.[feature];
  if (!access) return false;
  return isFeatureAvailableForQueries(getFeatureAvailability(access));
}

function isCoreQueryKey(queryKey: readonly string[]): boolean {
  const coreKeys = [
    QueryKeys.SESSION.CONFIG,
    QueryKeys.SESSION.ACTIVE,
    QueryKeys.SESSION.HISTORY,
    QueryKeys.USER.PROFILE,
  ];
  return coreKeys.some((coreKey) => coreKey.join(':') === queryKey.join(':'));
}

export function createPrefetcher(
  queryClient: PrefetchQueryClient,
  defaultPolicy?: PrefetchPolicy,
) {
  const prefetch = (options: PrefetchOptions): void => {
    void queryClient.prefetchQuery(options);
  };
  const canQuery = (feature: FeatureKey, policy?: PrefetchPolicy): boolean =>
    canPrefetchFeature(mergePolicy(defaultPolicy, policy), feature);

  return {
    session: (): void => {
      prefetch({ queryKey: QueryKeys.SESSION.CONFIG, queryFn: nullQuery, staleTime: 5 * 60 * 1000 });
      prefetch({ queryKey: QueryKeys.SESSION.ACTIVE, staleTime: 30 * 1000 });
      debug.debug('[Prefetch] Session queries warmed');
    },
    social: (policy?: PrefetchPolicy): void => {
      if (!canQuery('social_tab', policy)) return;
      prefetch({ queryKey: QueryKeys.SOCIAL.FEED, staleTime: 30 * 1000 });
      prefetch({ queryKey: QueryKeys.SOCIAL.RIVALS, staleTime: 2 * 60 * 1000 });
      if (canQuery('squads', policy)) {
        prefetch({ queryKey: QueryKeys.SQUAD.STATUS, staleTime: 60 * 1000 });
      }
      debug.debug('[Prefetch] Social queries warmed');
    },
    shop: (policy?: PrefetchPolicy): void => {
      if (!canQuery('shop', policy)) return;
      prefetch({ queryKey: QueryKeys.SHOP.CATEGORIES, staleTime: 5 * 60 * 1000 });
      prefetch({ queryKey: QueryKeys.SHOP.OFFERS, staleTime: 30 * 1000 });
      if (canQuery('economy_basic', policy)) {
        prefetch({ queryKey: QueryKeys.USER.WALLET, staleTime: 10 * 1000 });
      }
      debug.debug('[Prefetch] Shop queries warmed');
    },
    battlePass: (policy?: PrefetchPolicy): void => {
      if (!canQuery('battle_pass', policy)) return;
      prefetch({ queryKey: QueryKeys.BATTLE_PASS.PROGRESS, staleTime: 30 * 1000 });
      prefetch({ queryKey: QueryKeys.BATTLE_PASS.TIERS, staleTime: 5 * 60 * 1000 });
      debug.debug('[Prefetch] Battle pass queries warmed');
    },
    profile: (policy?: PrefetchPolicy): void => {
      prefetch({ queryKey: QueryKeys.USER.PROFILE, staleTime: 2 * 60 * 1000 });
      prefetch({ queryKey: QueryKeys.SESSION.HISTORY, staleTime: 2 * 60 * 1000 });
      if (canQuery('economy_basic', policy)) {
        prefetch({ queryKey: QueryKeys.USER.WALLET, staleTime: 10 * 1000 });
      }
      if (canQuery('inventory', policy)) {
        prefetch({ queryKey: QueryKeys.USER.INVENTORY, staleTime: 60 * 1000 });
      }
      debug.debug('[Prefetch] Profile queries warmed');
    },
    byFeature: (feature: FeatureKey, queryKey: readonly string[], policy?: PrefetchPolicy): void => {
      if (!canQuery(feature, policy)) return;
      prefetch({ queryKey, staleTime: 60 * 1000 });
    },
  };
}

export function usePrefetchQueries(defaultPolicy?: PrefetchPolicy): PrefetchQueriesReturn {
  const queryClient = useQueryClient();
  const prefetcher = useMemo(
    () => createPrefetcher(queryClient, defaultPolicy),
    [defaultPolicy, queryClient],
  );

  const prefetchSession = useCallback(() => prefetcher.session(), [prefetcher]);
  const prefetchSocial = useCallback((policy?: PrefetchPolicy) => prefetcher.social(policy), [prefetcher]);
  const prefetchShop = useCallback((policy?: PrefetchPolicy) => prefetcher.shop(policy), [prefetcher]);
  const prefetchBattlePass = useCallback(
    (policy?: PrefetchPolicy) => prefetcher.battlePass(policy),
    [prefetcher],
  );
  const prefetchProfile = useCallback((policy?: PrefetchPolicy) => prefetcher.profile(policy), [prefetcher]);
  const prefetchByKey = useCallback((queryKey: readonly string[]) => {
    if (!isCoreQueryKey(queryKey)) return;
    void queryClient.prefetchQuery({ queryKey, staleTime: 60 * 1000 });
  }, [queryClient]);
  const prefetchByFeature = useCallback((
    feature: FeatureKey,
    queryKey: readonly string[],
    policy?: PrefetchPolicy,
  ) => {
    prefetcher.byFeature(feature, queryKey, policy);
  }, [prefetcher]);

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

export { QueryKeys };
export type { PrefetchPolicy };
export default usePrefetchQueries;
