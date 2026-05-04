/**
 * Seasons Feature - Zod Schemas
 *
 * Runtime validation for all season-related data
 */

import { z } from 'zod';

// ============================================================================
// Base Schema Constants
// ============================================================================

const SEASON_LIMITS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_TIER_COUNT: 10,
  MAX_TIER_COUNT: 100,
  MIN_XP_PER_TIER: 500,
  MAX_XP_PER_TIER: 5000,
  MIN_PREMIUM_PRICE: 99,
  MAX_PREMIUM_PRICE: 4999,
  MIN_SEASON_DAYS: 7,
  MAX_SEASON_DAYS: 90,
} as const;

// ============================================================================
// Core Season Schemas
// ============================================================================

export const SeasonSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
    .min(SEASON_LIMITS.MIN_NAME_LENGTH)
    .max(SEASON_LIMITS.MAX_NAME_LENGTH),
  description: z.string()
    .max(SEASON_LIMITS.MAX_DESCRIPTION_LENGTH)
    .nullable(),
  theme: z.string().max(50).nullable(),
  startAt: z.number().int().positive(),
  endAt: z.number().int().positive(),
  archivedAt: z.number().int().positive().nullable(),
  tierCount: z.number()
    .int()
    .min(SEASON_LIMITS.MIN_TIER_COUNT)
    .max(SEASON_LIMITS.MAX_TIER_COUNT),
  xpPerTier: z.number()
    .int()
    .min(SEASON_LIMITS.MIN_XP_PER_TIER)
    .max(SEASON_LIMITS.MAX_XP_PER_TIER),
  premiumPriceGems: z.number()
    .int()
    .min(SEASON_LIMITS.MIN_PREMIUM_PRICE)
    .max(SEASON_LIMITS.MAX_PREMIUM_PRICE),
  isActive: z.boolean(),
  createdAt: z.number().int().positive(),
}).strict();

export const SeasonSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  theme: z.string().nullable(),
  phase: z.enum(['PRESEASON', 'ACTIVE', 'ALMOST_ENDING', 'ENDED', 'ARCHIVED']),
  daysRemaining: z.number().int(),
  totalDays: z.number().int().positive(),
  progressPercent: z.number().min(0).max(100),
}).strict();

export const SeasonDetailSchema = SeasonSchema.extend({
  challenges: z.array(z.string().uuid()),
  milestones: z.array(z.lazy(() => SeasonMilestoneSchema)),
  totalParticipants: z.number().int().nonnegative(),
  averageProgress: z.number().min(0).max(100),
}).strict();

// ============================================================================
// Season Phase Schemas
// ============================================================================

export const SeasonPhaseInfoSchema = z.object({
  phase: z.enum(['PRESEASON', 'ACTIVE', 'ALMOST_ENDING', 'ENDED', 'ARCHIVED']),
  displayName: z.string(),
  description: z.string(),
  color: z.string(),
  icon: z.string(),
}).strict();

// ============================================================================
// Season Content Schemas
// ============================================================================

export const ThemeAssetsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundUrl: z.string().url().nullable(),
  bannerUrl: z.string().url().nullable(),
  iconUrl: z.string().url().nullable(),
}).strict();

export const StoryChapterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  unlockTier: z.number().int().positive(),
  content: z.string().min(1).max(5000),
  imageUrl: z.string().url().nullable(),
}).strict();

export const StoryContentSchema = z.object({
  title: z.string().min(1).max(200),
  chapters: z.array(StoryChapterSchema).min(1),
}).strict();

export const SeasonContentSchema = z.object({
  seasonId: z.string().uuid(),
  themeAssets: ThemeAssetsSchema,
  featuredItems: z.array(z.string().uuid()),
  exclusiveRewards: z.array(z.string().uuid()),
  storyContent: StoryContentSchema.nullable(),
}).strict();

// ============================================================================
// Season Milestone Schemas
// ============================================================================

export const SeasonMilestoneSchema = z.object({
  id: z.string().uuid(),
  seasonId: z.string().uuid(),
  tier: z.number().int().positive(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  rewardType: z.enum(['XP', 'COINS', 'GEMS', 'ITEM', 'COSMETIC', 'TITLE', 'BOOST']),
  rewardAmount: z.number().int().nonnegative(),
  rewardItemId: z.string().uuid().nullable(),
}).strict();

// ============================================================================
// User Progress Schemas
// ============================================================================

export const UserSeasonProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  currentTier: z.number().int().nonnegative(),
  tierXp: z.number().int().nonnegative(),
  totalSeasonXp: z.number().int().nonnegative(),
  isPremium: z.boolean(),
  premiumPurchasedAt: z.number().int().positive().nullable(),
  claimedTiers: z.array(z.string().uuid()),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
}).strict();

export const UserSeasonProgressSummarySchema = z.object({
  seasonId: z.string().uuid(),
  currentTier: z.number().int().nonnegative(),
  tierProgress: z.number().min(0).max(100),
  totalProgress: z.number().min(0).max(100),
  isPremium: z.boolean(),
  nextTierClaimable: z.boolean(),
  unclaimedTiers: z.number().int().nonnegative(),
}).strict();

// ============================================================================
// Service Input Schemas
// ============================================================================

export const CreateSeasonInputSchema = z.object({
  name: z.string()
    .min(SEASON_LIMITS.MIN_NAME_LENGTH)
    .max(SEASON_LIMITS.MAX_NAME_LENGTH),
  description: z.string()
    .max(SEASON_LIMITS.MAX_DESCRIPTION_LENGTH)
    .optional(),
  theme: z.string().max(50).optional(),
  startAt: z.number().int().positive(),
  endAt: z.number().int().positive(),
  tierCount: z.number()
    .int()
    .min(SEASON_LIMITS.MIN_TIER_COUNT)
    .max(SEASON_LIMITS.MAX_TIER_COUNT)
    .default(50),
  xpPerTier: z.number()
    .int()
    .min(SEASON_LIMITS.MIN_XP_PER_TIER)
    .max(SEASON_LIMITS.MAX_XP_PER_TIER)
    .default(1000),
  premiumPriceGems: z.number()
    .int()
    .min(SEASON_LIMITS.MIN_PREMIUM_PRICE)
    .max(SEASON_LIMITS.MAX_PREMIUM_PRICE)
    .default(499),
}).strict().refine((data) => {
  const duration = data.endAt - data.startAt;
  const days = duration / (1000 * 60 * 60 * 24);
  return days >= SEASON_LIMITS.MIN_SEASON_DAYS && days <= SEASON_LIMITS.MAX_SEASON_DAYS;
}, {
  message: `Season duration must be between ${SEASON_LIMITS.MIN_SEASON_DAYS} and ${SEASON_LIMITS.MAX_SEASON_DAYS} days`,
  path: ['endAt'],
});

export const UpdateSeasonInputSchema = z.object({
  name: z.string()
    .min(SEASON_LIMITS.MIN_NAME_LENGTH)
    .max(SEASON_LIMITS.MAX_NAME_LENGTH)
    .optional(),
  description: z.string()
    .max(SEASON_LIMITS.MAX_DESCRIPTION_LENGTH)
    .optional(),
  theme: z.string().max(50).optional(),
  endAt: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
}).strict();

export const GetSeasonProgressInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
}).strict();

export const AdvanceTierInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  xpAmount: z.number().int().positive(),
  source: z.string().min(1).max(100),
}).strict();

export const PurchasePremiumInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  paymentMethod: z.enum(['GEMS', 'REAL_MONEY']),
}).strict();

// ============================================================================
// Season History Schemas
// ============================================================================

export const SeasonHistorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  finalTier: z.number().int().nonnegative(),
  totalXpEarned: z.number().int().nonnegative(),
  challengesCompleted: z.number().int().nonnegative(),
  rewardsClaimed: z.number().int().nonnegative(),
  wasPremium: z.boolean(),
  completedAt: z.number().int().positive(),
}).strict();

export const LeaderboardSnapshotSchema = z.object({
  topUsers: z.array(z.object({
    userId: z.string().uuid(),
    tier: z.number().int(),
    xp: z.number().int(),
  })),
  userRank: z.number().int().positive().nullable(),
  totalParticipants: z.number().int().nonnegative(),
}).strict();

export const ArchivedSeasonSchema = z.object({
  season: SeasonSchema,
  userHistory: SeasonHistorySchema.nullable(),
  leaderboardSnapshot: LeaderboardSnapshotSchema.nullable(),
}).strict();

// ============================================================================
// Analytics Schemas
// ============================================================================

export const SeasonStatsSchema = z.object({
  seasonId: z.string().uuid(),
  totalParticipants: z.number().int().nonnegative(),
  premiumParticipants: z.number().int().nonnegative(),
  averageTier: z.number().min(0),
  totalXpEarned: z.number().int().nonnegative(),
  challengesCompleted: z.number().int().nonnegative(),
  revenueGems: z.number().int().nonnegative(),
}).strict();

export const SeasonEngagementMetricsSchema = z.object({
  dau: z.number().int().nonnegative(),
  sessionCount: z.number().int().nonnegative(),
  averageSessionDuration: z.number().nonnegative(),
  challengeCompletionRate: z.number().min(0).max(1),
  claimRate: z.number().min(0).max(1),
}).strict();

// ============================================================================
// Type Inference
// ============================================================================

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonSummary = z.infer<typeof SeasonSummarySchema>;
export type SeasonDetail = z.infer<typeof SeasonDetailSchema>;
export type SeasonPhaseInfo = z.infer<typeof SeasonPhaseInfoSchema>;
export type SeasonContent = z.infer<typeof SeasonContentSchema>;
export type SeasonMilestone = z.infer<typeof SeasonMilestoneSchema>;
export type UserSeasonProgress = z.infer<typeof UserSeasonProgressSchema>;
export type UserSeasonProgressSummary = z.infer<typeof UserSeasonProgressSummarySchema>;
export type SeasonHistory = z.infer<typeof SeasonHistorySchema>;
export type ArchivedSeason = z.infer<typeof ArchivedSeasonSchema>;
export type CreateSeasonInput = z.infer<typeof CreateSeasonInputSchema>;
export type UpdateSeasonInput = z.infer<typeof UpdateSeasonInputSchema>;
export type GetSeasonProgressInput = z.infer<typeof GetSeasonProgressInputSchema>;
export type AdvanceTierInput = z.infer<typeof AdvanceTierInputSchema>;
export type PurchasePremiumInput = z.infer<typeof PurchasePremiumInputSchema>;
export type SeasonStats = z.infer<typeof SeasonStatsSchema>;
export type SeasonEngagementMetrics = z.infer<typeof SeasonEngagementMetricsSchema>;
