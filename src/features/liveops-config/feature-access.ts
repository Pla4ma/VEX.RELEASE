/**
 * feature-access — public API for building feature access maps.
 *
 * Logic delegated to FeatureFlagService; this module re-exports the
 * public surface and adds React wiring for buildFeatureAccess.
 */

import {
  DEFAULT_COPY,
  FEATURE_COPY,
  FEATURE_PRIORITIES,
  FEATURE_BUILD_ORDER,
  computeFeatureAccess,
  getStage,
  getProductTier,
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from './FeatureFlagService';
import type {
  UserExperienceStage,
  ProductTier,
  FeatureKey,
  FeatureAccess,
  FeatureAccessMap,
  FeatureAccessInputs,
} from './feature-access-types';

export type {
  UserExperienceStage,
  ProductTier,
  FeatureReleaseState,
  FeatureKey,
  FeatureAccess,
  FeatureAccessMap,
  MotivationProfileType,
  MotivationProfile,
  FeatureAccessInputs,
} from './feature-access-types';

export { getStage, getProductTier };

export function buildFeatureAccess(inputs: FeatureAccessInputs): {
  features: FeatureAccessMap;
  productTier: ProductTier;
  stage: UserExperienceStage;
} {
  const stage = getStage(inputs.totalCompletedSessions);
  const productTier = getProductTier(stage, inputs.totalCompletedSessions);
  const profile = inputs.motivationProfile;
  const degraded = inputs.degradedFeatures ?? new Set<FeatureKey>();

  const features = {} as FeatureAccessMap;
  const unlockedSoFar = new Set<FeatureKey>();

  for (const key of FEATURE_BUILD_ORDER) {
    const resolved = computeFeatureAccess({
      feature: key,
      sessions: inputs.totalCompletedSessions,
      profile,
      unlockedFeatures: unlockedSoFar,
    });
    const isDegraded = degraded.has(key);

    features[key] = {
      ...DEFAULT_COPY,
      ...FEATURE_COPY[key],
      key,
      isUnlocked: resolved.isUnlocked,
      isVisible: resolved.isVisible,
      isTeased: resolved.isTeased,
      isDegraded,
      disableOnDegraded: key === 'premium_paywall',
      priority: FEATURE_PRIORITIES[key] ?? 99,
      releaseState: resolved.releaseState,
    };

    if (resolved.isUnlocked && !isDegraded) {
      unlockedSoFar.add(key);
    }
  }

  return { features, productTier, stage };
}

export {
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
} from './FeatureFlagService';
export type {
  FeatureAvailability,
  FeatureAvailabilityState,
} from './FeatureFlagService';
