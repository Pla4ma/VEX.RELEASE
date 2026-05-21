import { useEffect, useState } from 'react';

import { featureHealthRegistry } from '../feature-health';
import { registerFeatureHealthChecks } from '../feature-health-checks';
import type { FeatureKey } from '../feature-access';

let registered = false;

function ensureRegistered(): void {
  if (!registered) {
    registerFeatureHealthChecks();
    registered = true;
  }
}

export function useFeatureHealth(): {
  degradedFeatures: Set<FeatureKey>;
  isPolling: boolean;
} {
  const [degradedFeatures, setDegradedFeatures] = useState<Set<FeatureKey>>(new Set());
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    ensureRegistered();

    let cancelled = false;

    async function poll(): Promise<void> {
      setIsPolling(true);
      try {
        const unhealthy = await featureHealthRegistry.getUnhealthyFeatures();
        if (!cancelled) {
          setDegradedFeatures(new Set(unhealthy));
        }
      } catch {
        if (!cancelled) {
          setDegradedFeatures(new Set());
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
