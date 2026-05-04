/**
 * LiveOps Config Feature - Zod Schemas
 */

import { z } from 'zod';

// ============================================================================
// Environment Schema
// ============================================================================

const EnvironmentSchema = z.enum(['development', 'staging', 'production']);

// ============================================================================
// Feature Flags Schema
// ============================================================================

export const FeatureFlagsSchema = z.object({
  // Season features
  seasonsEnabled: z.boolean().default(true),
  premiumEnabled: z.boolean().default(true),

  // Challenge features
  dailyChallengesEnabled: z.boolean().default(true),
  weeklyChallengesEnabled: z.boolean().default(true),
  challengeRerollEnabled: z.boolean().default(true),

  // Battle Pass features
  battlePassEnabled: z.boolean().default(true),
  retroactiveClaimsEnabled: z.boolean().default(true),

  // Economy features
  shopEnabled: z.boolean().default(true),
  tradingEnabled: z.boolean().default(false),

  // Social features
  squadsEnabled: z.boolean().default(true),
  leaderboardsEnabled: z.boolean().default(true),

  // Session features
  offlineModeEnabled: z.boolean().default(true),
  cloudSyncEnabled: z.boolean().default(true),

  // AI features
  aiSessionSummaryEnabled: z.boolean().default(false),
  aiChallengeGenerationEnabled: z.boolean().default(false),

  // Maintenance
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().nullable().default(null),
  maintenanceEndTime: z.number().nullable().default(null),
}).strict();

// ============================================================================
// Economy Config Schema
// ============================================================================

export const EconomyConfigSchema = z.object({
  gemPrices: z.record(z.number().positive()).default({
    '100': 0.99,
    '550': 4.99,
    '1200': 9.99,
    '2500': 19.99,
    '6500': 49.99,
    '14000': 99.99,
  }),

  baseXpMultiplier: z.number().positive().default(1.0),
  streakBonusMultiplier: z.number().positive().default(0.1),
  premiumBonusMultiplier: z.number().positive().default(0.5),

  dailyXpCap: z.number().int().positive().default(10000),
  dailyGemCap: z.number().int().positive().default(1000),

  rerollCost: z.number().int().nonnegative().default(10),
  premiumPrice: z.number().int().positive().default(499),
  battlePassPremiumPrice: z.number().int().positive().default(499),
}).strict();

// ============================================================================
// Season Config Schema
// ============================================================================

export const SeasonConfigSchema = z.object({
  defaultDurationDays: z.number().int().positive().default(60),
  defaultTierCount: z.number().int().positive().default(50),
  xpPerTier: z.number().int().positive().default(1000),
  gracePeriodDays: z.number().int().positive().default(3),

  activeSeasonId: z.string().uuid().nullable().default(null),
  nextSeasonPreviewEnabled: z.boolean().default(true),
}).strict();

// ============================================================================
// Challenge Config Schema
// ============================================================================

export const ChallengeConfigSchema = z.object({
  dailyChallengeCount: z.number().int().min(1).max(5).default(3),
  weeklyChallengeCount: z.number().int().min(1).max(5).default(3),

  easyWeight: z.number().min(0).max(100).default(40),
  mediumWeight: z.number().min(0).max(100).default(35),
  hardWeight: z.number().min(0).max(100).default(20),
  expertWeight: z.number().min(0).max(100).default(5),

  baseRewardMultiplier: z.number().positive().default(1.0),
  premiumRewardMultiplier: z.number().positive().default(1.5),

  freeRerollsPerDay: z.number().int().nonnegative().default(1),
  maxRerollsPerDay: z.number().int().positive().default(10),
}).strict().refine((data) => {
  const total = data.easyWeight + data.mediumWeight + data.hardWeight + data.expertWeight;
  return total === 100;
}, {
  message: 'Difficulty weights must sum to 100',
  path: ['easyWeight'],
});

// ============================================================================
// Battle Pass Config Schema
// ============================================================================

export const BattlePassConfigSchema = z.object({
  tierCount: z.number().int().positive().default(50),
  xpPerTier: z.number().int().positive().default(1000),
  premiumPrice: z.number().int().positive().default(499),

  resetOnSeasonEnd: z.boolean().default(true),
  carryOverProgress: z.boolean().default(false),
}).strict();

// ============================================================================
// Notification Config Schema
// ============================================================================

export const NotificationConfigSchema = z.object({
  pushNotificationsEnabled: z.boolean().default(true),
  emailNotificationsEnabled: z.boolean().default(false),

  sessionReminderMinutes: z.array(z.number().int().positive()).default([5, 15, 30]),
  streakWarningHours: z.number().int().positive().default(2),
  seasonEndWarningDays: z.array(z.number().int().positive()).default([7, 3, 1]),

  maxNotificationsPerDay: z.number().int().positive().default(10),
  minIntervalBetweenNotifications: z.number().int().positive().default(30),
}).strict();

// ============================================================================
// Rate Limits Schema
// ============================================================================

export const RateLimitsSchema = z.object({
  maxApiCallsPerMinute: z.number().int().positive().default(100),
  maxBatchOperationsPerMinute: z.number().int().positive().default(10),

  maxSessionsPerDay: z.number().int().positive().default(10),
  maxChallengesPerDay: z.number().int().positive().default(20),
  maxShopPurchasesPerDay: z.number().int().positive().default(50),
}).strict();

// ============================================================================
// Main LiveOps Config Schema
// ============================================================================

export const LiveOpsConfigSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  environment: EnvironmentSchema,

  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  effectiveFrom: z.number().int().positive(),
  expiresAt: z.number().int().positive().nullable(),

  features: FeatureFlagsSchema,
  economy: EconomyConfigSchema,
  seasons: SeasonConfigSchema,
  challenges: ChallengeConfigSchema,
  battlePass: BattlePassConfigSchema,
  notifications: NotificationConfigSchema,
  limits: RateLimitsSchema,

  changedBy: z.string(),
  changeReason: z.string().nullable(),
  rollbackVersion: z.number().int().positive().nullable(),
}).strict().refine((data) => {
  if (data.expiresAt && data.expiresAt <= data.effectiveFrom) {
    return false;
  }
  return true;
}, {
  message: 'expiresAt must be after effectiveFrom',
  path: ['expiresAt'],
});

// ============================================================================
// Client Config Schema
// ============================================================================

export const ClientConfigSchema = z.object({
  version: z.number().int().positive(),
  fetchedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),

  features: FeatureFlagsSchema,
  economy: EconomyConfigSchema,
  seasons: SeasonConfigSchema,
  challenges: ChallengeConfigSchema,
  battlePass: BattlePassConfigSchema,
  notifications: NotificationConfigSchema,
  limits: RateLimitsSchema,
}).strict();

// ============================================================================
// Config Update Schema
// ============================================================================

export const ConfigUpdateSchema = z.object({
  path: z.string().min(1),
  value: z.unknown(),
  previousValue: z.unknown(),
  updatedAt: z.number().int().positive(),
  updatedBy: z.string(),
}).strict();

export const ConfigDiffSchema = z.object({
  version: z.number().int().positive(),
  previousVersion: z.number().int().positive(),
  changes: z.array(ConfigUpdateSchema),
  breakingChanges: z.boolean(),
}).strict();

// ============================================================================
// A/B Test Schemas
// ============================================================================

export const ABVariantSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  value: z.unknown(),
  weight: z.number().min(0).max(100),
}).strict();

export const ABTestAudienceSchema = z.object({
  minLevel: z.number().int().nonnegative().default(1),
  maxLevel: z.number().int().positive().nullable().default(null),
  platforms: z.array(z.enum(['ios', 'android', 'web'])).default(['ios', 'android']),
  appVersions: z.array(z.string()).nullable().default(null),
  regions: z.array(z.string()).nullable().default(null),
}).strict();

export const ABTestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),

  featureFlag: z.string().min(1),
  variants: z.array(ABVariantSchema).min(2),

  startAt: z.number().int().positive(),
  endAt: z.number().int().positive().nullable(),
  audience: ABTestAudienceSchema,

  trafficAllocation: z.number().min(0).max(100).default(100),
}).strict().refine((data) => {
  const totalWeight = data.variants.reduce((sum, v) => sum + v.weight, 0);
  return totalWeight === 100;
}, {
  message: 'Variant weights must sum to 100',
  path: ['variants'],
}).refine((data) => {
  if (data.endAt) {
    return data.endAt > data.startAt;
  }
  return true;
}, {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});

// ============================================================================
// Config Sync Schemas
// ============================================================================

export const ConfigSyncOptionsSchema = z.object({
  forceRefresh: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(5000),
  retryAttempts: z.number().int().nonnegative().default(3),
}).strict();

export const ConfigSyncResultSchema = z.object({
  success: z.boolean(),
  updated: z.boolean(),
  newVersion: z.number().int().positive(),
  diff: ConfigDiffSchema.nullable(),
  error: z.string().nullable(),
}).strict();

// ============================================================================
// Type Inference
// ============================================================================

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;
export type EconomyConfig = z.infer<typeof EconomyConfigSchema>;
export type SeasonConfig = z.infer<typeof SeasonConfigSchema>;
export type ChallengeConfig = z.infer<typeof ChallengeConfigSchema>;
export type BattlePassConfig = z.infer<typeof BattlePassConfigSchema>;
export type NotificationConfig = z.infer<typeof NotificationConfigSchema>;
export type RateLimits = z.infer<typeof RateLimitsSchema>;
export type LiveOpsConfig = z.infer<typeof LiveOpsConfigSchema>;
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export type ConfigUpdate = z.infer<typeof ConfigUpdateSchema>;
export type ConfigDiff = z.infer<typeof ConfigDiffSchema>;
export type ABVariant = z.infer<typeof ABVariantSchema>;
export type ABTestAudience = z.infer<typeof ABTestAudienceSchema>;
export type ABTest = z.infer<typeof ABTestSchema>;
export type ConfigSyncOptions = z.infer<typeof ConfigSyncOptionsSchema>;
export type ConfigSyncResult = z.infer<typeof ConfigSyncResultSchema>;
