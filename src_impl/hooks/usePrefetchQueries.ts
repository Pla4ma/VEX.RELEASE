/**
 * Query Prefetching Utility
 *
 * Intelligent query prefetching for common navigation patterns.
 * Prefetches data for the next likely screen during hover/press-in.
 *
 * Phase 7A.3 — Query prefetching
 *
 * Usage:
 *   const { prefetchSession, prefetchSocial, prefetchShop } = usePrefetchQueries();
 *
 *   // On press-in (before navigation):
 *   <Pressable onPressIn={prefetchSession} onPress={navigateToSession} />
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('prefetch');

// Query key patterns (should match your app's query keys)
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

interface PrefetchQueriesReturn {
  /** Prefetch session configuration and related data */
  prefetchSession: () => void;
  /** Prefetch social feed and squad data */
  prefetchSocial: () => void;
  /** Prefetch shop items and offers */
  prefetchShop: () => void;
  /** Prefetch battle pass progress */
  prefetchBattlePass: () => void;
  /** Prefetch user profile and wallet */
  prefetchProfile: () => void;
  /** Generic prefetch by query key */
  prefetchByKey: (queryKey: readonly string[]) => void;
}

/**
 * Hook for prefetching queries on navigation anticipation
 */
export function usePrefetchQueries(): PrefetchQueriesReturn {
  const queryClient = useQueryClient();

  /**
   * Prefetch session configuration
   * Trigger: User presses Start Session button
   */
  const prefetchSession = useCallback(() => {
    // Prefetch session config
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SESSION.CONFIG,
      queryFn: async () => {
        // This will be populated by the actual query function
        // when the component mounts. Prefetch just warms the cache.
        return null;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Prefetch active session (in case there's one in progress)
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SESSION.ACTIVE,
      staleTime: 30 * 1000, // 30 seconds
    });

    // Prefetch squad members (for boss battles)
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SQUAD.MEMBERS,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

    debug.debug('[Prefetch] Session queries warmed');
  }, [queryClient]);

  /**
   * Prefetch social data
   * Trigger: User presses Social tab
   */
  const prefetchSocial = useCallback(() => {
    // Prefetch feed (most important)
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SOCIAL.FEED,
      staleTime: 30 * 1000, // 30 seconds
    });

    // Prefetch rivals data
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SOCIAL.RIVALS,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Prefetch squad status
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SQUAD.STATUS,
      staleTime: 60 * 1000, // 1 minute
    });

    debug.debug('[Prefetch] Social queries warmed');
  }, [queryClient]);

  /**
   * Prefetch shop data
   * Trigger: User presses Shop tab or sees limited time offer
   */
  const prefetchShop = useCallback(() => {
    // Prefetch shop categories
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SHOP.CATEGORIES,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Prefetch limited time offers (high priority)
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SHOP.OFFERS,
      staleTime: 30 * 1000, // 30 seconds
    });

    // Prefetch user wallet (for affordability checks)
    queryClient.prefetchQuery({
      queryKey: QueryKeys.USER.WALLET,
      staleTime: 10 * 1000, // 10 seconds
    });

    debug.debug('[Prefetch] Shop queries warmed');
  }, [queryClient]);

  /**
   * Prefetch battle pass data
   * Trigger: User presses Progress tab or sees battle pass card
   */
  const prefetchBattlePass = useCallback(() => {
    // Prefetch battle pass progress
    queryClient.prefetchQuery({
      queryKey: QueryKeys.BATTLE_PASS.PROGRESS,
      staleTime: 30 * 1000, // 30 seconds
    });

    // Prefetch tiers
    queryClient.prefetchQuery({
      queryKey: QueryKeys.BATTLE_PASS.TIERS,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    debug.debug('[Prefetch] Battle pass queries warmed');
  }, [queryClient]);

  /**
   * Prefetch profile data
   * Trigger: User presses Profile tab
   */
  const prefetchProfile = useCallback(() => {
    // Prefetch user profile
    queryClient.prefetchQuery({
      queryKey: QueryKeys.USER.PROFILE,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Prefetch wallet
    queryClient.prefetchQuery({
      queryKey: QueryKeys.USER.WALLET,
      staleTime: 10 * 1000, // 10 seconds
    });

    // Prefetch inventory
    queryClient.prefetchQuery({
      queryKey: QueryKeys.USER.INVENTORY,
      staleTime: 60 * 1000, // 1 minute
    });

    // Prefetch session history
    queryClient.prefetchQuery({
      queryKey: QueryKeys.SESSION.HISTORY,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

    debug.debug('[Prefetch] Profile queries warmed');
  }, [queryClient]);

  /**
   * Generic prefetch by query key
   */
  const prefetchByKey = useCallback(
    (queryKey: readonly string[]) => {
      queryClient.prefetchQuery({
        queryKey,
        staleTime: 60 * 1000,
      });
    },
    [queryClient]
  );

  return {
    prefetchSession,
    prefetchSocial,
    prefetchShop,
    prefetchBattlePass,
    prefetchProfile,
    prefetchByKey,
  };
}

/**
 * Standalone prefetch function for use outside of hooks
 * Can be used with queryClient from context
 */
export function createPrefetcher(queryClient: ReturnType<typeof useQueryClient>) {
  return {
    session: () => {
      queryClient.prefetchQuery({
        queryKey: QueryKeys.SESSION.CONFIG,
        staleTime: 5 * 60 * 1000,
      });
    },
    social: () => {
      queryClient.prefetchQuery({
        queryKey: QueryKeys.SOCIAL.FEED,
        staleTime: 30 * 1000,
      });
    },
    shop: () => {
      queryClient.prefetchQuery({
        queryKey: QueryKeys.SHOP.OFFERS,
        staleTime: 30 * 1000,
      });
    },
  };
}

// Re-export query keys for use in components
export { QueryKeys };

export default usePrefetchQueries;

export * from "./usePrefetchQueries.types";
export * from "./usePrefetchQueries.types";
