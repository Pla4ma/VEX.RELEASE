/**
 * LiveOps Config — Service
 *
 * All business logic for liveops-config goes here and ONLY here.
 * Currently business logic lives in feature-access.ts,
 * FeatureFlagService.ts, etc. This file re-exports the canonical service surface.
 */

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
export { registerFeatureHealthChecks } from './feature-health-checks';
export {
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
  FINAL_RELEASE_FEATURE_MAP,
  FINAL_RELEASE_INCLUDED_SYSTEMS,
  FINAL_RELEASE_HIDDEN_SYSTEMS,
  APP_STORE_READINESS_CHECKLIST,
  FINAL_RELEASE_READINESS_CHECKLIST,
  DEGRADED_SURFACE_BLOCKS,
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  shouldBlockFullSurface,
} from './FeatureFlagService';
export {
  setFeatureAccessMap,
  getFeatureAccessMap,
  getAvailabilityFor,
  getDegradedFeatures,
  setDegradedFeatures,
} from './feature-access-store';
