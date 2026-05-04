/**
 * LiveOps Config Hooks
 *
 * TanStack Query hooks for consuming remote configuration.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { eventBus } from '../../events';
import * as service from './service';
import type { ConfigSyncOptions, ConfigSyncResult, LiveOpsConfig } from './schemas';

// ============================================================================
// Query Keys
// ============================================================================

export const configKeys = {
  all: ['liveops-config'] as const,
  current: () => [...configKeys.all, 'current'] as const,
  feature: (name: keyof LiveOpsConfig['features']) => [...configKeys.all, 'feature', name] as const,
  section: (section: string) => [...configKeys.all, 'section', section] as const,
};

// ============================================================================
// Config Sync Hook
// ============================================================================

/**
 * Hook to sync and access the current config
 */
export function useLiveOpsConfig(options: { autoSync?: boolean } = {}) {
  const { autoSync = true } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.current(),
    queryFn: async () => {
      const result = await service.syncConfig();
      if (!result.success) {
        throw new Error(result.error || 'Failed to sync config');
      }
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: autoSync,
  });

  // Listen for config updates
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all });
    });

    return unsubscribe;
  }, [queryClient]);

  const refresh = useCallback(async () => {
    const result = await queryClient.fetchQuery({
      queryKey: configKeys.current(),
      queryFn: () => service.syncConfig({ forceRefresh: true }),
    });
    return result;
  }, [queryClient]);

  return {
    ...query,
    data: query.data
      ? {
          ...query.data,
          config: service.getClientConfig(),
          lastSync: service.getClientConfig()?.fetchedAt ?? Date.now(),
        }
      : undefined,
    config: service.getClientConfig(),
    lastSync: service.getClientConfig()?.fetchedAt ?? Date.now(),
    refresh,
    version: query.data?.newVersion ?? service.getConfigVersion(),
    isLoading: service.isConfigLoading(),
    error: query.error ?? service.getLastConfigError(),
  };
}

// ============================================================================
// Feature Flag Hooks
// ============================================================================

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(featureName: keyof LiveOpsConfig['features']) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.feature(featureName),
    queryFn: () => {
      // Sync if needed
      service.syncConfig().catch(() => {
        // Silent fail, will use cached or default
      });
      return service.isEnabled(featureName);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Listen for updates
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.feature(featureName) });
    });

    return unsubscribe;
  }, [queryClient, featureName]);

  return {
    enabled: query.data ?? service.isEnabled(featureName),
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to get all feature flags
 */
export function useFeatureFlags() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('features'),
    queryFn: () => {
      service.syncConfig().catch(() => {});
      return service.getFeatureFlags();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('features') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    features: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// ============================================================================
// Config Section Hooks
// ============================================================================

/**
 * Hook to access economy configuration
 */
export function useEconomyConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('economy'),
    queryFn: () => {
      service.syncConfig().catch(() => {});
      return service.getEconomyConfig();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('economy') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to access season configuration
 */
export function useSeasonConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('seasons'),
    queryFn: () => {
      service.syncConfig().catch(() => {});
      return service.getSeasonConfig();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('seasons') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to access challenge configuration
 */
export function useChallengeConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('challenges'),
    queryFn: () => {
      service.syncConfig().catch(() => {});
      return service.getChallengeConfig();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('challenges') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to access battle pass configuration
 */
export function useBattlePassConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('battlePass'),
    queryFn: () => {
      service.syncConfig().catch(() => {});
      return service.getBattlePassConfig();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('battlePass') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook to access rate limits
 */
export function useRateLimits() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('limits'),
    queryFn: () => {
      service.syncConfig().catch(() => {});
      return service.getRateLimits();
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('limits') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    limits: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

// ============================================================================
// Maintenance Mode Hook
// ============================================================================

/**
 * Hook to check maintenance mode status
 */
export function useMaintenanceMode() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: configKeys.section('maintenance'),
    queryFn: () => ({
      isMaintenanceMode: service.isMaintenanceMode(),
      message: service.getMaintenanceMessage(),
      endTime: service.getMaintenanceEndTime(),
    }),
    staleTime: 60 * 1000, // Check every minute
  });

  useEffect(() => {
    const unsubscribe = eventBus.subscribe('config:updated', () => {
      queryClient.invalidateQueries({ queryKey: configKeys.section('maintenance') });
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    ...query.data,
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
  };
}

// ============================================================================
// Config Mutation Hooks
// ============================================================================

/**
 * Hook to force refresh config
 */
export function useForceRefreshConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await service.syncConfig({ forceRefresh: true });
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh config');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all });
    },
  });
}

/**
 * Hook to clear config cache
 */
export function useClearConfigCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => service.clearConfigCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all });
    },
  });
}
