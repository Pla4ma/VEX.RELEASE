/**
 * Battle Pass Feature - Barrel Export
 *
 * DEFERRED_PUBLIC_V1: Battle Pass is disabled in public V1 (see PUBLIC_V1_FEATURE_MAP).
 * No route, Home card, notification, or completion reward uses battle pass.
 * PremiumPreview and other components are deactivated.
 * This code remains for internal reference only.
 */

export type {
  BattlePass,
  BattlePassTier,
  RewardType,
  TierReward,
  UserBattlePass,
  UserBattlePassSummary,
  ClaimStatus,
  TierClaimState,
  ClaimResult,
  ProgressionCalculation,
  TierAdvanceResult,
  PremiumPurchaseResult,
  RetroactiveClaimResult,
  CreateBattlePassInput,
  CreateBattlePassTierInput,
  AddBattlePassXpInput,
  ClaimTierInput,
  PurchasePremiumInput,
  TierDisplay,
  BattlePassDisplay,
  BattlePassAnalytics,
} from './schemas';

export {
  BattlePassSchema,
  BattlePassTierSchema,
  RewardTypeSchema,
  TierRewardSchema,
  UserBattlePassSchema,
  UserBattlePassSummarySchema,
  ClaimStatusSchema,
  TierClaimStateSchema,
  ClaimResultSchema,
  AddBattlePassXpInputSchema,
  ClaimTierInputSchema,
  PurchasePremiumInputSchema,
} from './schemas';

export {
  fetchBattlePassBySeason,
  fetchBattlePassTiers,
  fetchUserBattlePass,
  createUserBattlePass,
  updateUserBattlePass,
  markTierClaimed,
  purchasePremium,
  RepositoryError,
} from './repository';

export {
  getOrCreateUserBattlePass,
  getUserBattlePassSummary,
  addBattlePassXp,
  claimTier,
  claimAllAvailable,
  purchasePremium as purchaseBattlePassPremium,
  getBattlePassDisplay,
} from './service';

export {
  battlePassKeys,
  useBattlePassBySeason,
  useBattlePassTiers,
  useUserBattlePass,
  useBattlePassDisplay,
  useAddBattlePassXp,
  useClaimTier,
  usePurchasePremium,
  useClaimAllTiers,
} from './hooks';

// Analytics
export {
  trackBattlePassView,
  trackTierClaimed,
  trackPremiumPurchase,
  trackXpGained,
  trackMilestoneReached,
  calculateEngagementMetrics,
  calculateMonetizationMetrics,
  checkBattlePassHealth,
} from './analytics';

// Components
export * from './components';
