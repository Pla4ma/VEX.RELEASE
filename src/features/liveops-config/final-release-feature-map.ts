/**
 * final-release-feature-map — re-exports from FeatureFlagService.
 *
 * All release classification logic moved to FeatureFlagService for consolidation.
 */

export type {
  FinalReleaseStatus,
  FinalReleaseFeatureEntry,
} from './FeatureFlagService';
export {
  FINAL_RELEASE_FEATURE_MAP,
  FINAL_RELEASE_INCLUDED_SYSTEMS,
  FINAL_RELEASE_HIDDEN_SYSTEMS,
  APP_STORE_READINESS_CHECKLIST,
  FINAL_RELEASE_READINESS_CHECKLIST,
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
} from './FeatureFlagService';
