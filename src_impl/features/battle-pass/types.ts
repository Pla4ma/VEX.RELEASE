/**
 * Battle Pass Feature - Domain Types
 *
 * Dependencies:
 * - Seasons (tier progression tracking)
 * - Rewards (tier reward delivery)
 * - Economy (premium purchases)
 */

// ============================================================================
// Core Battle Pass Types
// ============================================================================

export interface BattlePass {
  id: string;
  seasonId: string;
  tierCount: number;
  xpPerTier: number;
  premiumPriceGems: number;
  theme: string | null;
  createdAt: number;
}

export interface BattlePassTier {
  id: string;
  seasonId: string;
  tierNumber: number;
  xpRequired: number;

  // Free track reward
  freeRewardId: string | null;
  freeRewardType: RewardType | null;
  freeRewardAmount: number | null;

  // Premium track reward
  premiumRewardId: string | null;
  premiumRewardType: RewardType | null;
  premiumRewardAmount: number | null;

  // Visual
  iconUrl: string | null;
  isMajorMilestone: boolean;
}

export type RewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'COSMETIC' | 'TITLE' | 'BOOST' | 'STREAK_SHIELD' | 'AVATAR_FRAME' | 'EMOTE';

// ============================================================================
// User Battle Pass Progress
// ============================================================================

export interface UserBattlePass {
  id: string;
  userId: string;
  seasonId: string;
  currentTier: number;
  tierXp: number;
  totalXp: number;
  isPremium: boolean;
  premiumPurchasedAt: number | null;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
  createdAt: number;
  updatedAt: number;
}

export interface UserBattlePassSummary {
  seasonId: string;
  currentTier: number;
  tierProgress: number; // 0-100 within current tier
  totalProgress: number; // 0-100 across all tiers
  isPremium: boolean;
  canClaimFree: boolean;
  canClaimPremium: boolean;
  unclaimedFreeTiers: number;
  unclaimedPremiumTiers: number;
  nextTierUnlocked: boolean;
  xpToNextTier: number;
}

// ============================================================================
// Tier Claim Types
// ============================================================================

export type ClaimStatus = 'AVAILABLE' | 'CLAIMED' | 'LOCKED' | 'PREMIUM_REQUIRED';

export interface TierClaimState {
  tierNumber: number;
  freeStatus: ClaimStatus;
  premiumStatus: ClaimStatus;
  freeReward: TierReward | null;
  premiumReward: TierReward | null;
  canClaimFree: boolean;
  canClaimPremium: boolean;
}

export interface TierReward {
  id: string;
  type: RewardType;
  amount: number | null;
  itemId: string | null;
  name: string;
  description: string;
  iconUrl: string | null;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface ClaimResult {
  success: boolean;
  tierNumber: number;
  track: 'FREE' | 'PREMIUM';
  rewards: TierReward[];
  error: string | null;
}

// ============================================================================
// Progression Calculation Types
// ============================================================================

export interface ProgressionCalculation {
  currentTier: number;
  tierXp: number;
  xpToNextTier: number;
  tiersGained: number;
  overflowXp: number;
}

export interface TierAdvanceResult {
  previousTier: number;
  newTier: number;
  tiersGained: number;
  newUnlockedTiers: number[];
  milestoneReached: boolean;
}

// ============================================================================
// Premium Purchase Types
// ============================================================================

export interface PremiumPurchaseResult {
  success: boolean;
  gemsDeducted: number;
  previousTier: number;
  newRewardsUnlocked: TierReward[];
  error: string | null;
}

export interface RetroactiveClaimResult {
  claimedTiers: number[];
  claimedRewards: TierReward[];
  totalValue: number;
}

// ============================================================================
// Service Input Types
// ============================================================================

export interface CreateBattlePassInput {
  seasonId: string;
  tierCount: number;
  xpPerTier: number;
  premiumPriceGems: number;
  theme?: string;
}

export interface CreateBattlePassTierInput {
  seasonId: string;
  tierNumber: number;
  xpRequired: number;
  freeReward?: Omit<TierReward, 'id'>;
  premiumReward?: Omit<TierReward, 'id'>;
  isMajorMilestone?: boolean;
}

export interface AddBattlePassXpInput {
  userId: string;
  seasonId: string;
  xpAmount: number;
  source: string;
}

export interface ClaimTierInput {
  userId: string;
  seasonId: string;
  tierNumber: number;
  track: 'FREE' | 'PREMIUM';
}

export interface PurchasePremiumInput {
  userId: string;
  seasonId: string;
  paymentMethod: 'GEMS' | 'REAL_MONEY';
}

// ============================================================================
// Battle Pass Display Types
// ============================================================================

export interface BattlePassDisplay {
  seasonId: string;
  theme: string | null;
  currentTier: number;
  totalTiers: number;
  progressPercent: number;
  isPremium: boolean;
  tiers: TierDisplay[];
}

export interface TierDisplay {
  tierNumber: number;
  xpRequired: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  isNext: boolean;
  freeReward: TierReward | null;
  premiumReward: TierReward | null;
  freeStatus: ClaimStatus;
  premiumStatus: ClaimStatus;
  isMajorMilestone: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface BattlePassAnalytics {
  totalUsers: number;
  premiumUsers: number;
  premiumConversionRate: number;
  averageTier: number;
  averageXpPerUser: number;
  totalClaims: number;
  freeClaims: number;
  premiumClaims: number;
  revenueGems: number;
}
