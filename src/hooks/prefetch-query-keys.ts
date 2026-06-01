import type { FeatureAccessMap, FeatureKey } from '../features/liveops-config/feature-access';

export const QueryKeys = {
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

export interface PrefetchPolicy {
  featureAccess?: FeatureAccessMap;
  totalCompletedSessions?: number;
}

export interface PrefetchOptions {
  queryKey: readonly string[];
  staleTime: number;
  queryFn?: () => Promise<null>;
}

export interface PrefetchQueryClient {
  prefetchQuery: (options: PrefetchOptions) => Promise<void>;
}

export interface PrefetchQueriesReturn {
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
