import { useEffect, useState } from 'react';

import { featureHealthRegistry } from '../feature-health';
import { registerFeatureHealthChecks } from '../feature-health-checks';
import { setDegradedFeatures as setGlobalDegradedFeatures } from '../feature-access-store';
import type { FeatureKey } from '../feature-access';

let registered = false;
const CRITICAL_FEATURES_ON_HEALTH_ERROR: FeatureKey[] = [
  'ai_coach_advanced',
  'content_study',
  'content_study_advanced',
  'premium_paywall',
  'boss_tab',
];

function ensureRegistered(): void {
  if (!registered) {
    registerFeatureHealthChecks();
    registered = true;
  }
}

/**
 * Polls feature health and writes degraded features to the central store.
 * Every useFeatureAccess() call reads from this same store,
 * ensuring consistent feature states everywhere.
 */
export function useFeatureHealth(): {
  degradedFeatures: Set<FeatureKey>;
  isPolling: boolean;
} {
  const [degradedFeatures, setLocalDegradedFeatures] = useState<Set<FeatureKey>>(new Set());
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    ensureRegistered();

    let cancelled = false;

    async function poll(): Promise<void> {
      setIsPolling(true);
      try {
        const unhealthy = await featureHealthRegistry.getUnhealthyFeatures();
        const unhealthySet = new Set(unhealthy);
        if (!cancelled) {
          setLocalDegradedFeatures(unhealthySet);
          setGlobalDegradedFeatures(unhealthySet);
        }
      } catch {
        if (!cancelled) {
          const safeFallback = new Set<FeatureKey>(CRITICAL_FEATURES_ON_HEALTH_ERROR);
          setLocalDegradedFeatures(safeFallback);
          setGlobalDegradedFeatures(safeFallback);
        }
      } finally {
        if (!cancelled) {
          setIsPolling(false);
        }
      }
    }

    void poll();

    const interval = setInterval(() => {
      if (!cancelled) {
        void poll();
      }
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { degradedFeatures, isPolling };
}
