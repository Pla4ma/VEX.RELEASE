import type { FeatureKey } from './feature-access';
import { setDegradedFeatures } from './feature-access-store';
import { shouldRunHealthCheck } from './feature-health-policy';

const CHECKABLE_FEATURES: FeatureKey[] = [
  'content_study',
  'content_study_advanced',
  'premium_paywall',
  'boss_tab',
  'ai_coach_advanced',
];

let registered = false;

function getEligibleFeatures(totalCompletedSessions: number): Set<FeatureKey> {
  return new Set(
    CHECKABLE_FEATURES.filter((feature) =>
      shouldRunHealthCheck(feature, totalCompletedSessions),
    ),
  );
}

async function pollFeatureHealth(
  totalCompletedSessions: number,
  isCancelled: () => boolean,
): Promise<void> {
  const [{ featureHealthRegistry }, { registerFeatureHealthChecks }] =
    await Promise.all([
      import('./feature-health'),
      import('./feature-health-checks'),
    ]);

  if (!registered) {
    registerFeatureHealthChecks();
    registered = true;
  }

  const eligible = getEligibleFeatures(totalCompletedSessions);
  if (eligible.size === 0) {
    if (!isCancelled()) {
      setDegradedFeatures(new Set());
    }
    return;
  }

  try {
    const unhealthy =
      await featureHealthRegistry.getUnhealthyFeaturesFiltered(eligible);
    if (!isCancelled()) {
      setDegradedFeatures(new Set(unhealthy));
    }
  } catch (error: unknown) {
    if (!isCancelled()) {
      setDegradedFeatures(eligible);
    }
  }
}

export function startDeferredFeatureHealth(
  totalCompletedSessions: number,
): () => void {
  let cancelled = false;

  pollFeatureHealth(totalCompletedSessions, () => cancelled);
  const interval = setInterval(() => {
    pollFeatureHealth(totalCompletedSessions, () => cancelled);
  }, 60_000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
