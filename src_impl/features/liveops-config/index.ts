import { useMemo, useEffect } from 'react';

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
import { setFeatureAccessMap } from './feature-access-store';

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
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from './feature-access';
export { FEATURE_DEPENDENCIES } from './feature-dependencies';
export { featureHealthRegistry } from './feature-health';
export type { FeatureHealthCheck, FeatureHealthStatus } from './feature-health';
export { registerFeatureHealthChecks } from './feature-health-checks';
export { useDisclosureAnalytics } from './feature-analytics';
export { setFeatureAccessMap, getFeatureAccessMap, getAvailabilityFor } from './feature-access-store';

export interface FeatureAccessResult {
  error: Error | null;
  features: FeatureAccessMap;
  inputs: { totalCompletedSessions: number };
  isLoading: boolean;
  productTier: ProductTier;
  refetchAll: () => Promise<unknown>;
  stage: UserExperienceStage;
}

export function useFeatureAccess(
  degradedFeatures?: Set<FeatureKey>,
): FeatureAccessResult {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const stats = useSessionStats(userId);
  const completedSessions = stats.stats?.completedSessions ?? 0;
  const motivationProfile = useOnboardingStore((state) => state.motivationProfile);

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
