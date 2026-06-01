import { useEffect, useState } from 'react';

import { featureHealthRegistry } from '../feature-health';
import { registerFeatureHealthChecks } from '../feature-health-checks';
import { setDegradedFeatures as setGlobalDegradedFeatures } from '../feature-access-store';
import { shouldRunHealthCheck } from '../feature-health-policy';
import type { FeatureKey } from '../feature-access';

let registered = false;
const ALL_CHECKABLE_FEATURES: FeatureKey[] = [
  'content_study',
  'content_study_advanced',
  'premium_paywall',
  'boss_tab',
  'ai_coach_advanced',
];

function ensureRegistered(): void {
  if (!registered) {
    registerFeatureHealthChecks();
    registered = true;
  }
}

function getEligibleFeatures(totalCompletedSessions: number): Set<FeatureKey> {
  const eligible = ALL_CHECKABLE_FEATURES.filter((f) =>
    shouldRunHealthCheck(f, totalCompletedSessions),
  );
  return new Set(eligible);
}

/**
 * Polls feature health and writes degraded features to the central store.
 * Policy: only checks features that pass shouldRunHealthCheck() —
 * deactivated features are never polled. Proximity-gated features
 * are only checked after the user reaches the teaser session count.
 */
export function useFeatureHealth(totalCompletedSessions: number): {
  degradedFeatures: Set<FeatureKey>;
  isPolling: boolean;
} {
  const [degradedFeatures, setLocalDegradedFeatures] = useState<
    Set<FeatureKey>
  >(new Set());
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    ensureRegistered();

    const eligible = getEligibleFeatures(totalCompletedSessions);
    let cancelled = false;

    async function poll(): Promise<void> {
      setIsPolling(true);
      try {
        const unhealthy =
          await featureHealthRegistry.getUnhealthyFeaturesFiltered(eligible);
        const unhealthySet = new Set(unhealthy);
        if (!cancelled) {
          setLocalDegradedFeatures(unhealthySet);
          setGlobalDegradedFeatures(unhealthySet);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setLocalDegradedFeatures(eligible);
          setGlobalDegradedFeatures(eligible);
        }
      } finally {
        if (!cancelled) {
          setIsPolling(false);
        }
      }
    }

    poll();

    const interval = setInterval(() => {
      if (!cancelled) {
        poll();
      }
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };

  }, [totalCompletedSessions]);

  return { degradedFeatures, isPolling };
}
