import type { FeatureKey } from './feature-access';
import { setDegradedFeatures } from './feature-access-store';
import { shouldRunHealthCheck } from './FeatureFlagService';
import { captureSilentFailure } from '../../utils/silent-failure';

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
  } catch {
    if (!isCancelled()) {
      setDegradedFeatures(eligible);
    }
  }
}

function pollFeatureHealthSafely(
  totalCompletedSessions: number,
  isCancelled: () => boolean,
): void {
  void pollFeatureHealth(totalCompletedSessions, isCancelled).catch(
    (error: unknown) => {
      captureSilentFailure(error, {
        feature: 'liveops',
        operation: 'poll-feature-health',
        type: 'data',
      });
    },
  );
}

export function startDeferredFeatureHealth(
  totalCompletedSessions: number,
): () => void {
  let cancelled = false;

  pollFeatureHealthSafely(totalCompletedSessions, () => cancelled);
  const interval = setInterval(() => {
    pollFeatureHealthSafely(totalCompletedSessions, () => cancelled);
  }, 60_000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}
