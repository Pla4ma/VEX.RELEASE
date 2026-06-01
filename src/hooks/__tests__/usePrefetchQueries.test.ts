import { buildFeatureAccess } from '../../features/liveops-config/feature-access';
import { createPrefetcher, QueryKeys } from '../usePrefetchQueries';

type PrefetchOptions = {
  queryKey: readonly string[];
  staleTime: number;
  queryFn?: () => Promise<null>;
};

function createQueryClient(): {
  calls: PrefetchOptions[];
  queryClient: { prefetchQuery: (options: PrefetchOptions) => Promise<void> };
} {
  const calls: PrefetchOptions[] = [];
  return {
    calls,
    queryClient: {
      prefetchQuery: async (options: PrefetchOptions): Promise<void> => {
        calls.push(options);
      },
    },
  };
}

function queryKeys(calls: PrefetchOptions[]): readonly string[][] {
  return calls.map((call) => [...call.queryKey]);
}

describe('createPrefetcher feature availability policy', () => {
  it('prefetchSession does not prefetch squads', () => {
    const { calls, queryClient } = createQueryClient();
    const prefetcher = createPrefetcher(queryClient);

    prefetcher.session();

    expect(queryKeys(calls)).not.toContainEqual(QueryKeys.SQUAD.MEMBERS);
    expect(queryKeys(calls)).toContainEqual(QueryKeys.SESSION.CONFIG);
  });

  it('prefetchProfile does not prefetch wallet or inventory when economy is inactive', () => {
    const { calls, queryClient } = createQueryClient();
    const policy = buildFeatureAccess({ totalCompletedSessions: 0 });
    const prefetcher = createPrefetcher(queryClient, {
      featureAccess: policy.features,
      totalCompletedSessions: 0,
    });

    prefetcher.profile();

    expect(queryKeys(calls)).toContainEqual(QueryKeys.USER.PROFILE);
    expect(queryKeys(calls)).not.toContainEqual(QueryKeys.USER.WALLET);
    expect(queryKeys(calls)).not.toContainEqual(QueryKeys.USER.INVENTORY);
  });

  it('prefetchShop is no-op when shop is deactivated', () => {
    const { calls, queryClient } = createQueryClient();
    const prefetcher = createPrefetcher(queryClient, {
      featureAccess: buildFeatureAccess({ totalCompletedSessions: 999 })
        .features,
    });

    prefetcher.shop();

    expect(calls).toHaveLength(0);
  });

  it('prefetchBattlePass is no-op when battle pass is deactivated', () => {
    const { calls, queryClient } = createQueryClient();
    const prefetcher = createPrefetcher(queryClient, {
      featureAccess: buildFeatureAccess({ totalCompletedSessions: 999 })
        .features,
    });

    prefetcher.battlePass();

    expect(calls).toHaveLength(0);
  });

  it('hidden features do not prefetch on Day 0', () => {
    const { calls, queryClient } = createQueryClient();
    const policy = buildFeatureAccess({ totalCompletedSessions: 0 });
    const prefetcher = createPrefetcher(queryClient, {
      featureAccess: policy.features,
      totalCompletedSessions: 0,
    });

    prefetcher.social();
    prefetcher.shop();
    prefetcher.battlePass();

    expect(calls).toHaveLength(0);
  });

  it('active core session prefetch still works', () => {
    const { calls, queryClient } = createQueryClient();
    const prefetcher = createPrefetcher(queryClient);

    prefetcher.session();

    expect(queryKeys(calls)).toEqual([
      [...QueryKeys.SESSION.CONFIG],
      [...QueryKeys.SESSION.ACTIVE],
    ]);
  });
  it('prefetchByFeature blocks hidden feature keys', () => {
    const { calls, queryClient } = createQueryClient();
    const policy = buildFeatureAccess({ totalCompletedSessions: 0 });
    const prefetcher = createPrefetcher(queryClient, {
      featureAccess: policy.features,
      totalCompletedSessions: 0,
    });

    prefetcher.byFeature('shop', QueryKeys.SHOP.OFFERS);

    expect(calls).toHaveLength(0);
  });
});
