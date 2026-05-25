import { useMemo, useEffect, useSyncExternalStore } from 'react';

import { useSessionStats } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import { useOnboardingStore } from '../onboarding/store';
import {
  buildFeatureAccess,
  type FeatureAccessMap,
  type FeatureKey,
  type ProductTier,
  type UserExperienceStage,
} from './feature-access';
import {
  getDegradedFeatures,
  setFeatureAccessMap,
  subscribeToDegradedFeatures,
} from './feature-access-store';

export type {
  FeatureAccess,
  FeatureAvailability,
  FeatureAvailabilityState,
  FeatureAccessInputs,
  FeatureAccessMap,
  FeatureKey,
  MotivationProfile,
  MotivationProfileType,
  ProductTier,
  UserExperienceStage,
  FeatureReleaseState,
} from './feature-access';
export {
  getProductTier,
  getStage,
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from './feature-access';
export { FEATURE_DEPENDENCIES } from './feature-dependencies';
export { featureHealthRegistry } from './feature-health';
export type { FeatureHealthCheck, FeatureHealthStatus } from './feature-health';
export { registerFeatureHealthChecks } from './feature-health-checks';
export { useDisclosureAnalytics } from './feature-analytics';
export { setFeatureAccessMap, getFeatureAccessMap, getAvailabilityFor, getDegradedFeatures, setDegradedFeatures } from './feature-access-store';

export interface FeatureAccessResult {
  error: Error | null;
  features: FeatureAccessMap;
  inputs: { totalCompletedSessions: number };
  isLoading: boolean;
  productTier: ProductTier;
  refetchAll: () => Promise<unknown>;
  stage: UserExperienceStage;
}

/**
 * useFeatureAccess — Single source of truth for feature availability.
 *
 * Degraded features come from the central store (populated by useFeatureHealth).
 * No parameter needed — every call site sees the same health-adjusted map.
 */
export function useFeatureAccess(): FeatureAccessResult {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const stats = useSessionStats(userId);
  const completedSessions = stats.stats?.completedSessions ?? 0;
  const motivationProfile = useOnboardingStore((state) => state.motivationProfile);
  const degradedFeatures = useSyncExternalStore(
    subscribeToDegradedFeatures,
    getDegradedFeatures,
    getDegradedFeatures,
  );

  const access = useMemo(
    () =>
      buildFeatureAccess({
        totalCompletedSessions: completedSessions,
        motivationProfile: motivationProfile ?? undefined,
        degradedFeatures,
      }),
    [completedSessions, motivationProfile, degradedFeatures],
  );

  useEffect(() => {
    setFeatureAccessMap(access.features);
  }, [access.features]);

  return {
    error: null,
    features: access.features,
    inputs: { totalCompletedSessions: completedSessions },
    isLoading: stats.isLoading,
    productTier: access.productTier,
    refetchAll: stats.refresh,
    stage: access.stage,
  };
}
