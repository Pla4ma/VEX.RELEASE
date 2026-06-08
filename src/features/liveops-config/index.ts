import { useMemo, useSyncExternalStore } from 'react';

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
  buildFeatureAccess,
  getProductTier,
  getStage,
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from './feature-access';
export { FEATURE_DEPENDENCIES } from './FeatureFlagService';
export { featureHealthRegistry } from './feature-health';
export type { FeatureHealthCheck, FeatureHealthStatus } from './feature-health';
export { registerFeatureHealthChecks } from './feature-health-checks';
export { useDisclosureAnalytics } from './feature-analytics';
export {
  setFeatureAccessMap,
  getFeatureAccessMap,
  getAvailabilityFor,
  getDegradedFeatures,
  setDegradedFeatures,
} from './feature-access-store';
// Final release map — re-exported from FeatureFlagService
export {
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
  FINAL_RELEASE_FEATURE_MAP,
  FINAL_RELEASE_INCLUDED_SYSTEMS,
  FINAL_RELEASE_HIDDEN_SYSTEMS,
  APP_STORE_READINESS_CHECKLIST,
  FINAL_RELEASE_READINESS_CHECKLIST,
  type FinalReleaseStatus,
  type FinalReleaseFeatureEntry,
} from './FeatureFlagService';
// Degraded surfaces — re-exported from FeatureFlagService
export {
  DEGRADED_SURFACE_BLOCKS,
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  shouldBlockFullSurface,
  type DegradedFeatureKey,
} from './FeatureFlagService';

export interface FeatureAccessResult {
  error: Error | null;
  features: FeatureAccessMap;
  inputs: { totalCompletedSessions: number };
  isLoading: boolean;
  /** Alias for isLoading — consumers migrated to TanStack Query v5 isPending convention */
  isPending: boolean;
  productTier: ProductTier;
  refetchAll: () => Promise<unknown>;
  stage: UserExperienceStage;
}

export interface FeatureAccessOptions {
  enabled?: boolean;
  fallbackTotalCompletedSessions?: number;
}

/**
 * useFeatureAccess — Single source of truth for feature availability.
 *
 * Degraded features come from the central store (populated by useFeatureHealth).
 * Callers may opt out of hydration for cold-start-safe fallback rendering.
 */
export function useFeatureAccess(
  options: FeatureAccessOptions = {},
): FeatureAccessResult {
  const enabled = options.enabled ?? true;
  const fallbackTotal = options.fallbackTotalCompletedSessions ?? 0;
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const stats = useSessionStats(enabled ? userId : '');
  const completedSessions = enabled
    ? (stats.stats?.completedSessions ?? fallbackTotal)
    : fallbackTotal;
  const motivationProfile = useOnboardingStore(
    (state) => state.motivationProfile,
  );
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

  setFeatureAccessMap(access.features);

  return {
    error: null,
    features: access.features,
    inputs: { totalCompletedSessions: completedSessions },
    isLoading: enabled ? stats.isLoading : false,
    isPending: enabled ? stats.isLoading : false,
    productTier: access.productTier,
    refetchAll: enabled ? stats.refresh : async (): Promise<void> => {},
    stage: access.stage,
  };
}
