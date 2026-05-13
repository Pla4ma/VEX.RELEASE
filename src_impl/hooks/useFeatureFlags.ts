/**
 * useFeatureFlags Hook
 *
 * React hook for feature flag integration with:
 * - Flag state tracking
 * - Real-time updates
 * - Loading states
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { FeatureFlagService, FeatureFlag, FeatureFlagValue } from '../features/FeatureFlagService';
import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('hooks:feature-flags');
// Singleton service instance
let featureFlagService: FeatureFlagService | null = null;

function getFeatureFlagService(): FeatureFlagService {
  if (!featureFlagService) {
    featureFlagService = new FeatureFlagService();
  }
  return featureFlagService;
}

/**
 * useFeatureFlags hook
 *
 * Hook for accessing all feature flags with real-time updates.
 *
 * @example
 * ```typescript
 * const { flags, isEnabled, loading } = useFeatureFlags();
 *
 * if (isEnabled('new_design')) {
 *   return <NewDesign />;
 * }
 * ```
 */
export function useFeatureFlags(): UseFeatureFlagsReturn {
  const service = getFeatureFlagService();

  const [state, setState] = useState<FeatureFlagsState>({
    flags: {},
    loading: true,
    error: null,
    initialized: false,
  });

  /**
   * Initialize service
   */
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (!service) {return;}

        await service.initialize();

        if (mounted) {
          setState({
            flags: service.getAll(),
            loading: false,
            error: null,
            initialized: true,
          });
        }
      } catch (error) {
        debug.error('Failed to initialize feature flags', error as Error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error as Error,
            initialized: false,
          }));
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [service]);

  /**
   * Subscribe to flag updates
   */
  useEffect(() => {
    if (!state.initialized) {return;}

    // Subscribe to flag updates
    const unsubscribe = eventBus.subscribe('feature:updated', () => {
      setState(prev => ({
        ...prev,
        flags: service.getAll(),
      }));
    });

    return unsubscribe;
  }, [state.initialized, service]);

  /**
   * Check if feature is enabled
   */
  const isEnabled = useCallback((key: string): boolean => {
    return service.isEnabled(key);
  }, [service]);

  /**
   * Get flag value
   */
  const get = useCallback((key: string): FeatureFlagValue | null => {
    return service.get(key, false as FeatureFlagValue);
  }, [service]);

  /**
   * Set flag override
   */
  const setOverride = useCallback(async (key: string, value: FeatureFlagValue): Promise<void> => {
    await service.setOverride(key, value);
    setState(prev => ({
      ...prev,
      flags: service.getAll(),
    }));
  }, [service]);

  /**
   * Clear flag override
   */
  const clearOverride = useCallback(async (key: string): Promise<void> => {
    await service.clearOverride(key);
    setState(prev => ({
      ...prev,
      flags: service.getAll(),
    }));
  }, [service]);

  /**
   * Refresh flags from remote
   */
  const refresh = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Trigger remote fetch
      await service.fetchRemote();

      setState({
        flags: service.getAll(),
        loading: false,
        error: null,
        initialized: true,
      });
    } catch (error) {
      debug.error('Failed to refresh feature flags', error as Error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [service]);

  return {
    ...state,
    isEnabled,
    get,
    setOverride,
    clearOverride,
    refresh,
  };
}

/**
 * useFeatureFlag hook
 *
 * Hook for checking a single feature flag.
 * More efficient than useFeatureFlags when you only need one flag.
 *
 * @example
 * ```typescript
 * const { enabled } = useFeatureFlag('new_design');
 *
 * return enabled ? <NewDesign /> : <OldDesign />;
 * ```
 */
export function useFeatureFlag(key: string): UseFeatureFlagReturn {
  const service = getFeatureFlagService();

  const [state, setState] = useState<UseFeatureFlagReturn>({
    enabled: false,
    value: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await service.initialize();

        if (mounted) {
          setState({
            enabled: service.isEnabled(key),
            value: service.get(key, false as FeatureFlagValue),
            loading: false,
          });
        }
      } catch (error) {
        if (mounted) {
          setState({
            enabled: false,
            value: false,
            loading: false,
          });
        }
      }
    }

    init();

    // Subscribe to updates for this specific flag
    const unsubscribe = eventBus.subscribe('feature:updated', (payload: { key: string }) => {
      if (payload.key === key) {
        setState({
          enabled: service.isEnabled(key),
          value: service.get(key, false as FeatureFlagValue),
          loading: false,
        });
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [key, service]);

  return state;
}

export * from "./useFeatureFlags.types";
