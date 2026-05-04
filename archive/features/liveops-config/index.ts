/**
 * LiveOps Config Feature - Barrel Export
 *
 * Remote configuration and feature flag management.
 */

// Types
export type {
  LiveOpsConfig,
  FeatureFlags,
  EconomyConfig,
  SeasonConfig,
  ChallengeConfig,
  BattlePassConfig,
  NotificationConfig,
  RateLimits,
  ConfigUpdate,
  ConfigDiff,
  ClientConfig,
  ABTest,
  ABVariant,
  ABTestAudience,
  ConfigSyncOptions,
  ConfigSyncResult,
} from './schemas';
export type {
  FeatureAccessInput,
  FeatureAccessMap,
  FeatureAccessState,
  FeatureKey,
  ProductTier,
  UserExperienceStage,
  FeatureVisibility,
  FeatureVisibilityResult,
} from './feature-access';
export type {
  CanonicalProductSpine,
  DomainOwner,
} from './architecture';

// Schemas
export {
  FeatureFlagsSchema,
  EconomyConfigSchema,
  SeasonConfigSchema,
  ChallengeConfigSchema,
  BattlePassConfigSchema,
  NotificationConfigSchema,
  RateLimitsSchema,
  LiveOpsConfigSchema,
  ClientConfigSchema,
  ConfigSyncOptionsSchema,
  ConfigSyncResultSchema,
  ABTestSchema,
} from './schemas';
export {
  ExperienceStageSchema,
  FeatureAccessInputSchema,
  FeatureAccessStateSchema,
  FeatureKeySchema,
  buildFeatureAccessMap,
  getProductTier,
  getUserExperienceStage,
  canShowFeature,
  getFeatureVisibility,
  getUnlockReason,
  isFeaturePostLaunch,
} from './feature-access';
export {
  CANONICAL_PRODUCT_SPINE,
  CanonicalProductSpineSchema,
  DOMAIN_OWNERS,
  DomainOwnerSchema,
} from './architecture';

// Repository
export {
  fetchCurrentConfig,
  fetchConfigByVersion,
  fetchConfigHistory,
  createConfig,
  updateConfig,
  fetchActiveABTests,
  getUserABTestAssignment,
  assignUserToABTest,
  isFeatureEnabled,
  recordConfigFetch,
  RepositoryError,
} from './repository';

// Service
export {
  initConfigService,
  syncConfig,
  isEnabled,
  getFeatureFlags,
  getEconomyConfig,
  getSeasonConfig,
  getChallengeConfig,
  getBattlePassConfig,
  getRateLimits,
  getABTestVariant,
  isMaintenanceMode,
  getMaintenanceMessage,
  getMaintenanceEndTime,
  getConfigVersion,
  isConfigLoading,
  getLastConfigError,
  clearConfigCache,
} from './service';

// Hooks
export {
  configKeys,
  useLiveOpsConfig,
  useFeatureFlag,
  useFeatureFlags,
  useEconomyConfig,
  useSeasonConfig,
  useChallengeConfig,
  useBattlePassConfig,
  useRateLimits,
  useMaintenanceMode,
  useForceRefreshConfig,
  useClearConfigCache,
} from './hooks';
export { useFeatureAccess } from './useFeatureAccess';
export { useDisclosureAnalytics } from './analytics';

// Components
export { ConfigViewer, FeatureFlagPanel } from './components';
