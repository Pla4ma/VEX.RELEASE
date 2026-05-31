import type { FeatureKey } from '../features/liveops-config/feature-access';
import {
  getFeatureAvailabilityFor,
  isFeatureAvailableForQueries,
} from '../features/liveops-config/feature-availability';
import { createDebugger } from '../utils/debug';
import {
  QueryKeys,
  type PrefetchOptions,
  type PrefetchPolicy,
  type PrefetchQueryClient,
} from './prefetch-query-keys';

const debug = createDebugger('prefetch');

export function nullQuery(): Promise<null> {
  return Promise.resolve(null);
}

export function mergePolicy(
  base: PrefetchPolicy | undefined,
  next: PrefetchPolicy | undefined,
): PrefetchPolicy {
  return { ...base, ...next };
}

export function canPrefetchFeature(
  policy: PrefetchPolicy | undefined,
  feature: FeatureKey,
): boolean {
  if (policy?.totalCompletedSessions === 0) {return false;}
  const access = policy?.featureAccess?.[feature];
  if (!access) {return false;}
  return isFeatureAvailableForQueries(
    getFeatureAvailabilityFor(feature, access),
  );
}

export function isCoreQueryKey(queryKey: readonly string[]): boolean {
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
      prefetch({
        queryKey: QueryKeys.SESSION.CONFIG,
        queryFn: nullQuery,
        staleTime: 5 * 60 * 1000,
      });
      prefetch({ queryKey: QueryKeys.SESSION.ACTIVE, staleTime: 30 * 1000 });
      debug.debug('[Prefetch] Session queries warmed');
    },
    social: (policy?: PrefetchPolicy): void => {
      if (!canQuery('social_tab', policy)) {return;}
      prefetch({ queryKey: QueryKeys.SOCIAL.FEED, staleTime: 30 * 1000 });
      prefetch({ queryKey: QueryKeys.SOCIAL.RIVALS, staleTime: 2 * 60 * 1000 });
      if (canQuery('squads', policy)) {
        prefetch({ queryKey: QueryKeys.SQUAD.STATUS, staleTime: 60 * 1000 });
      }
      debug.debug('[Prefetch] Social queries warmed');
    },
    shop: (policy?: PrefetchPolicy): void => {
      if (!canQuery('shop', policy)) {return;}
      prefetch({
        queryKey: QueryKeys.SHOP.CATEGORIES,
        staleTime: 5 * 60 * 1000,
      });
      prefetch({ queryKey: QueryKeys.SHOP.OFFERS, staleTime: 30 * 1000 });
      if (canQuery('economy_basic', policy)) {
        prefetch({ queryKey: QueryKeys.USER.WALLET, staleTime: 10 * 1000 });
      }
      debug.debug('[Prefetch] Shop queries warmed');
    },
    battlePass: (policy?: PrefetchPolicy): void => {
      if (!canQuery('battle_pass', policy)) {return;}
      prefetch({
        queryKey: QueryKeys.BATTLE_PASS.PROGRESS,
        staleTime: 30 * 1000,
      });
      prefetch({
        queryKey: QueryKeys.BATTLE_PASS.TIERS,
        staleTime: 5 * 60 * 1000,
      });
      debug.debug('[Prefetch] Battle pass queries warmed');
    },
    profile: (policy?: PrefetchPolicy): void => {
      prefetch({ queryKey: QueryKeys.USER.PROFILE, staleTime: 2 * 60 * 1000 });
      prefetch({
        queryKey: QueryKeys.SESSION.HISTORY,
        staleTime: 2 * 60 * 1000,
      });
      if (canQuery('economy_basic', policy)) {
        prefetch({ queryKey: QueryKeys.USER.WALLET, staleTime: 10 * 1000 });
      }
      if (canQuery('inventory', policy)) {
        prefetch({ queryKey: QueryKeys.USER.INVENTORY, staleTime: 60 * 1000 });
      }
      debug.debug('[Prefetch] Profile queries warmed');
    },
    byFeature: (
      feature: FeatureKey,
      queryKey: readonly string[],
      policy?: PrefetchPolicy,
    ): void => {
      if (!canQuery(feature, policy)) {return;}
      prefetch({ queryKey, staleTime: 60 * 1000 });
    },
  };
}
