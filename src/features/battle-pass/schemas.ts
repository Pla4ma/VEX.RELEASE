/**
 * Battle Pass Feature - Zod Schemas
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

const BATTLE_PASS_LIMITS = {
  MIN_TIER_COUNT: 10,
  MAX_TIER_COUNT: 100,
  MIN_XP_PER_TIER: 500,
  MAX_XP_PER_TIER: 5000,
  MIN_PREMIUM_PRICE: 99,
  MAX_PREMIUM_PRICE: 4999,
} as const;

// ============================================================================
// Reward Type Schema
// ============================================================================

export const RewardTypeSchema = z.enum([
  'XP', 'COINS', 'GEMS', 'ITEM', 'COSMETIC', 'TITLE',
  'BOOST', 'STREAK_SHIELD', 'AVATAR_FRAME', 'EMOTE',
]);

// ============================================================================
// Core Battle Pass Schemas
// ============================================================================

export const BattlePassSchema = z.object({
  id: z.string().uuid(),
  seasonId: z.string().uuid(),
  tierCount: z.number()
    .int()
    .min(BATTLE_PASS_LIMITS.MIN_TIER_COUNT)
    .max(BATTLE_PASS_LIMITS.MAX_TIER_COUNT),
  xpPerTier: z.number()
    .int()
    .min(BATTLE_PASS_LIMITS.MIN_XP_PER_TIER)
    .max(BATTLE_PASS_LIMITS.MAX_XP_PER_TIER),
  premiumPriceGems: z.number()
    .int()
    .min(BATTLE_PASS_LIMITS.MIN_PREMIUM_PRICE)
    .max(BATTLE_PASS_LIMITS.MAX_PREMIUM_PRICE),
  theme: z.string().max(50).nullable(),
  createdAt: z.number().int().positive(),
}).strict();

// ============================================================================
// Tier Reward Schema (must come before BattlePassTierSchema)
// ============================================================================

export const TierRewardSchema = z.object({
  id: z.string().uuid(),
  type: RewardTypeSchema,
  amount: z.number().int().nullable(),
  itemId: z.string().uuid().nullable(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  iconUrl: z.string().url().nullable(),
  rarity: z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']),
}).strict();

// ============================================================================
// Battle Pass Tier Schema
// ============================================================================

export const BattlePassTierSchema = z.object({
  id: z.string().uuid(),
  seasonId: z.string().uuid(),
  tierNumber: z.number().int().positive(),
  xpRequired: z.number().int().positive(),
  freeRewardId: z.string().uuid().nullable(),
  freeRewardType: RewardTypeSchema.nullable(),
  freeRewardAmount: z.number().int().nullable(),
  premiumRewardId: z.string().uuid().nullable(),
  premiumRewardType: RewardTypeSchema.nullable(),
  premiumRewardAmount: z.number().int().nullable(),
  // Full reward objects (populated after fetch)
  freeReward: TierRewardSchema.nullable().optional(),
  premiumReward: TierRewardSchema.nullable().optional(),
  iconUrl: z.string().url().nullable(),
  isMajorMilestone: z.boolean(),
}).strict();

// ============================================================================
// User Progress Schemas
// ============================================================================

export const UserBattlePassSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  currentTier: z.number().int().nonnegative(),
  tierXp: z.number().int().nonnegative(),
  totalXp: z.number().int().nonnegative(),
  isPremium: z.boolean(),
  premiumPurchasedAt: z.number().int().positive().nullable(),
  claimedFreeTiers: z.array(z.number().int().positive()),
  claimedPremiumTiers: z.array(z.number().int().positive()),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
}).strict();

export const UserBattlePassSummarySchema = z.object({
  seasonId: z.string().uuid(),
  currentTier: z.number().int().nonnegative(),
  tierProgress: z.number().min(0).max(100),
  totalProgress: z.number().min(0).max(100),
  isPremium: z.boolean(),
  canClaimFree: z.boolean(),
  canClaimPremium: z.boolean(),
  unclaimedFreeTiers: z.number().int().nonnegative(),
  unclaimedPremiumTiers: z.number().int().nonnegative(),
  nextTierUnlocked: z.boolean(),
  xpToNextTier: z.number().int().nonnegative(),
}).strict();

// ============================================================================
// Claim State Schemas
// ============================================================================

export const ClaimStatusSchema = z.enum(['AVAILABLE', 'CLAIMED', 'LOCKED', 'PREMIUM_REQUIRED']);

export const TierClaimStateSchema = z.object({
  tierNumber: z.number().int().positive(),
  freeStatus: ClaimStatusSchema,
  premiumStatus: ClaimStatusSchema,
  freeReward: TierRewardSchema.nullable(),
  premiumReward: TierRewardSchema.nullable(),
  canClaimFree: z.boolean(),
  canClaimPremium: z.boolean(),
}).strict();

export const ClaimResultSchema = z.object({
  success: z.boolean(),
  tierNumber: z.number().int().positive(),
  track: z.enum(['FREE', 'PREMIUM']),
  rewards: z.array(TierRewardSchema),
  error: z.string().nullable(),
}).strict();

// ============================================================================
// Progression Calculation Schemas
// ============================================================================

export const ProgressionCalculationSchema = z.object({
  currentTier: z.number().int().nonnegative(),
  tierXp: z.number().int().nonnegative(),
  xpToNextTier: z.number().int().nonnegative(),
  tiersGained: z.number().int().nonnegative(),
  overflowXp: z.number().int().nonnegative(),
}).strict();

export const TierAdvanceResultSchema = z.object({
  previousTier: z.number().int().nonnegative(),
  newTier: z.number().int().nonnegative(),
  tiersGained: z.number().int().nonnegative(),
  newUnlockedTiers: z.array(z.number().int().positive()),
  milestoneReached: z.boolean(),
}).strict();

// ============================================================================
// Premium Purchase Schemas
// ============================================================================

export const PremiumPurchaseResultSchema = z.object({
  success: z.boolean(),
  gemsDeducted: z.number().int().nonnegative(),
  previousTier: z.number().int().nonnegative(),
  newRewardsUnlocked: z.array(TierRewardSchema),
  error: z.string().nullable(),
}).strict();

export const RetroactiveClaimResultSchema = z.object({
  claimedTiers: z.array(z.number().int().positive()),
  claimedRewards: z.array(TierRewardSchema),
  totalValue: z.number().nonnegative(),
}).strict();

// ============================================================================
// Service Input Schemas
// ============================================================================

export const CreateBattlePassInputSchema = z.object({
  seasonId: z.string().uuid(),
  tierCount: z.number()
    .int()
    .min(BATTLE_PASS_LIMITS.MIN_TIER_COUNT)
    .max(BATTLE_PASS_LIMITS.MAX_TIER_COUNT)
    .default(50),
  xpPerTier: z.number()
    .int()
    .min(BATTLE_PASS_LIMITS.MIN_XP_PER_TIER)
    .max(BATTLE_PASS_LIMITS.MAX_XP_PER_TIER)
    .default(1000),
  premiumPriceGems: z.number()
    .int()
    .min(BATTLE_PASS_LIMITS.MIN_PREMIUM_PRICE)
    .max(BATTLE_PASS_LIMITS.MAX_PREMIUM_PRICE)
    .default(499),
  theme: z.string().max(50).optional(),
}).strict();

export const CreateBattlePassTierInputSchema = z.object({
  seasonId: z.string().uuid(),
  tierNumber: z.number().int().positive(),
  xpRequired: z.number().int().positive(),
  freeReward: TierRewardSchema.omit({ id: true }).optional(),
  premiumReward: TierRewardSchema.omit({ id: true }).optional(),
  isMajorMilestone: z.boolean().default(false),
}).strict();

export const AddBattlePassXpInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  xpAmount: z.number().int().positive(),
  source: z.string().min(1).max(100),
}).strict();

export const ClaimTierInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  tierNumber: z.number().int().positive(),
  track: z.enum(['FREE', 'PREMIUM']),
}).strict();

export const PurchasePremiumInputSchema = z.object({
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  paymentMethod: z.enum(['GEMS', 'REAL_MONEY']),
}).strict();

// ============================================================================
// Display Schemas
// ============================================================================

export const TierDisplaySchema = z.object({
  tierNumber: z.number().int().positive(),
  xpRequired: z.number().int().positive(),
  isUnlocked: z.boolean(),
  isClaimed: z.boolean(),
  isNext: z.boolean(),
  freeReward: TierRewardSchema.nullable(),
  premiumReward: TierRewardSchema.nullable(),
  freeStatus: ClaimStatusSchema,
  premiumStatus: ClaimStatusSchema,
  isMajorMilestone: z.boolean(),
}).strict();

export const BattlePassDisplaySchema = z.object({
  seasonId: z.string().uuid(),
  theme: z.string().nullable(),
  currentTier: z.number().int().nonnegative(),
  totalTiers: z.number().int().positive(),
  progressPercent: z.number().min(0).max(100),
  isPremium: z.boolean(),
  tiers: z.array(TierDisplaySchema),
}).strict();

// ============================================================================
// Analytics Schemas
// ============================================================================

export const BattlePassAnalyticsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  premiumUsers: z.number().int().nonnegative(),
  premiumConversionRate: z.number().min(0).max(1),
  averageTier: z.number().min(0),
  averageXpPerUser: z.number().nonnegative(),
  totalClaims: z.number().int().nonnegative(),
  freeClaims: z.number().int().nonnegative(),
  premiumClaims: z.number().int().nonnegative(),
  revenueGems: z.number().int().nonnegative(),
}).strict();

// ============================================================================
// Type Inference
// ============================================================================

export type BattlePass = z.infer<typeof BattlePassSchema>;
export type BattlePassTier = z.infer<typeof BattlePassTierSchema>;
export type RewardType = z.infer<typeof RewardTypeSchema>;
export type TierReward = z.infer<typeof TierRewardSchema>;
export type UserBattlePass = z.infer<typeof UserBattlePassSchema>;
export type UserBattlePassSummary = z.infer<typeof UserBattlePassSummarySchema>;
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;
export type TierClaimState = z.infer<typeof TierClaimStateSchema>;
export type ClaimResult = z.infer<typeof ClaimResultSchema>;
export type ProgressionCalculation = z.infer<typeof ProgressionCalculationSchema>;
export type TierAdvanceResult = z.infer<typeof TierAdvanceResultSchema>;
export type PremiumPurchaseResult = z.infer<typeof PremiumPurchaseResultSchema>;
export type RetroactiveClaimResult = z.infer<typeof RetroactiveClaimResultSchema>;
export type CreateBattlePassInput = z.infer<typeof CreateBattlePassInputSchema>;
export type CreateBattlePassTierInput = z.infer<typeof CreateBattlePassTierInputSchema>;
export type AddBattlePassXpInput = z.infer<typeof AddBattlePassXpInputSchema>;
export type ClaimTierInput = z.infer<typeof ClaimTierInputSchema>;
export type PurchasePremiumInput = z.infer<typeof PurchasePremiumInputSchema>;
export type TierDisplay = z.infer<typeof TierDisplaySchema>;
export type BattlePassDisplay = z.infer<typeof BattlePassDisplaySchema>;
export type BattlePassAnalytics = z.infer<typeof BattlePassAnalyticsSchema>;
