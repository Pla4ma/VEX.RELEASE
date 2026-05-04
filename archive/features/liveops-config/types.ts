/**
 * LiveOps Config Feature - Types
 *
 * Remote configuration and feature flag management.
 * Provides real-time config updates without app releases.
 */

// ============================================================================
// Core Config Types
// ============================================================================

export interface LiveOpsConfig {
  id: string;
  version: number;
  environment: 'development' | 'staging' | 'production';

  // Timestamps
  createdAt: number;
  updatedAt: number;
  effectiveFrom: number;
  expiresAt: number | null;

  // Config sections
  features: FeatureFlags;
  economy: EconomyConfig;
  seasons: SeasonConfig;
  challenges: ChallengeConfig;
  battlePass: BattlePassConfig;
  notifications: NotificationConfig;
  limits: RateLimits;

  // Metadata
  changedBy: string;
  changeReason: string | null;
  rollbackVersion: number | null;
}

export interface FeatureFlags {
  // Season features
  seasonsEnabled: boolean;
  premiumEnabled: boolean;

  // Challenge features
  dailyChallengesEnabled: boolean;
  weeklyChallengesEnabled: boolean;
  challengeRerollEnabled: boolean;

  // Battle Pass features
  battlePassEnabled: boolean;
  retroactiveClaimsEnabled: boolean;

  // Economy features
  shopEnabled: boolean;
  tradingEnabled: boolean;

  // Social features
  squadsEnabled: boolean;
  leaderboardsEnabled: boolean;

  // Session features
  offlineModeEnabled: boolean;
  cloudSyncEnabled: boolean;

  // AI features (future)
  aiSessionSummaryEnabled: boolean;
  aiChallengeGenerationEnabled: boolean;

  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  maintenanceEndTime: number | null;
}

export interface EconomyConfig {
  // Currency values
  gemPrices: Record<string, number>;

  // Earning multipliers
  baseXpMultiplier: number;
  streakBonusMultiplier: number;
  premiumBonusMultiplier: number;

  // Caps
  dailyXpCap: number;
  dailyGemCap: number;

  // Costs
  rerollCost: number;
  premiumPrice: number;
  battlePassPremiumPrice: number;
}

export interface SeasonConfig {
  defaultDurationDays: number;
  defaultTierCount: number;
  xpPerTier: number;
  gracePeriodDays: number;

  // Season-specific overrides
  activeSeasonId: string | null;
  nextSeasonPreviewEnabled: boolean;
}

export interface ChallengeConfig {
  dailyChallengeCount: number;
  weeklyChallengeCount: number;

  // Difficulty weights
  easyWeight: number;
  mediumWeight: number;
  hardWeight: number;
  expertWeight: number;

  // Rewards
  baseRewardMultiplier: number;
  premiumRewardMultiplier: number;

  // Reroll
  freeRerollsPerDay: number;
  maxRerollsPerDay: number;
}

export interface BattlePassConfig {
  tierCount: number;
  xpPerTier: number;
  premiumPrice: number;

  // Season reset
  resetOnSeasonEnd: boolean;
  carryOverProgress: boolean;
}

export interface NotificationConfig {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;

  // Timing
  sessionReminderMinutes: number[];
  streakWarningHours: number;
  seasonEndWarningDays: number[];

  // Rate limits
  maxNotificationsPerDay: number;
  minIntervalBetweenNotifications: number; // minutes
}

export interface RateLimits {
  // API rate limits (per minute)
  maxApiCallsPerMinute: number;
  maxBatchOperationsPerMinute: number;

  // Feature-specific limits
  maxSessionsPerDay: number;
  maxChallengesPerDay: number;
  maxShopPurchasesPerDay: number;
}

// ============================================================================
// Config Update Types
// ============================================================================

export interface ConfigUpdate {
  path: string;
  value: unknown;
  previousValue: unknown;
  updatedAt: number;
  updatedBy: string;
}

export interface ConfigDiff {
  version: number;
  previousVersion: number;
  changes: ConfigUpdate[];
  breakingChanges: boolean;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: string[];
}

export interface ConfigValidationError {
  path: string;
  message: string;
  code: string;
}

// ============================================================================
// Client Config Types
// ============================================================================

export interface ClientConfig {
  version: number;
  fetchedAt: number;
  expiresAt: number;

  features: FeatureFlags;
  economy: EconomyConfig;
  seasons: SeasonConfig;
  challenges: ChallengeConfig;
  battlePass: BattlePassConfig;
  notifications: NotificationConfig;
  limits: RateLimits;
}

export interface ConfigCacheEntry {
  config: ClientConfig;
  etag: string | null;
  stale: boolean;
}

// ============================================================================
// A/B Testing Types
// ============================================================================

export interface ABTest {
  id: string;
  name: string;
  description: string;

  // Test config
  featureFlag: string;
  variants: ABVariant[];

  // Targeting
  startAt: number;
  endAt: number | null;
  audience: ABTestAudience;

  // Allocation
  trafficAllocation: number; // 0-100
}

export interface ABVariant {
  id: string;
  name: string;
  value: unknown;
  weight: number; // 0-100, must sum to 100
}

export interface ABTestAudience {
  minLevel: number;
  maxLevel: number | null;
  platforms: ('ios' | 'android' | 'web')[];
  appVersions: string[] | null;
  regions: string[] | null;
}

export interface UserABTestAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: number;
}

// ============================================================================
// Config Sync Types
// ============================================================================

export interface ConfigSyncResult {
  success: boolean;
  updated: boolean;
  newVersion: number;
  diff: ConfigDiff | null;
  error: string | null;
}

export interface ConfigSyncOptions {
  forceRefresh: boolean;
  timeoutMs: number;
  retryAttempts: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface ConfigAnalytics {
  configVersion: number;
  fetchCount: number;
  cacheHitCount: number;
  cacheMissCount: number;

  // Feature flag usage
  featureChecks: Record<string, number>;

  // Errors
  fetchErrors: number;
  validationErrors: number;
}
