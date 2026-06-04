/**
 * feature-health-policy — re-exports from FeatureFlagService.
 *
 * Policy logic moved to FeatureFlagService for consolidation.
 */
export {
  shouldRunHealthCheck,
  getDeactivatedFeatureKeys,
} from './FeatureFlagService';
