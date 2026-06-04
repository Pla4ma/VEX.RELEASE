/**
 * feature-availability — re-exports from FeatureFlagService.
 *
 * All availability logic moved to FeatureFlagService for consolidation.
 */

export type {
  FeatureAvailability,
  FeatureAvailabilityState,
} from './FeatureFlagService';
export {
  getFeatureAvailability,
  getFeatureAvailabilityFor,
  isFeatureAvailableForNavigation,
  isFeatureAvailableForQueries,
  DEGRADED_SURFACE_BLOCKS,
  getDegradedBlockedSurfaces,
  getDegradedFallbackSurface,
  shouldBlockFullSurface,
  type DegradedFeatureKey,
} from './FeatureFlagService';
