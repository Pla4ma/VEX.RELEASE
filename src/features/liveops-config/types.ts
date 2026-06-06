/**
 * LiveOps Config — Types
 *
 * Domain types for the liveops-config feature.
 * Re-exports from the canonical type modules.
 */

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

export type {
  FeatureHealthCheck,
  FeatureHealthStatus,
} from './feature-health';

export type {
  FinalReleaseStatus,
  FinalReleaseFeatureEntry,
  DegradedFeatureKey,
} from './FeatureFlagService';

export type {
  FeatureAccessResult,
  FeatureAccessOptions,
} from './index';
