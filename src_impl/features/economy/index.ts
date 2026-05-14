/**
 * Economy Feature
 * Export all economy-related modules
 *
 * Note: Types are exported from schemas.ts (inferred from Zod)
 * types.ts contains pure TypeScript interfaces for reference only
 */

// Schemas (exports types via z.infer<typeof Schema>)
export * from './schemas';

// Repository
export * from './repository';

// Service
export * from './service';

// Hooks
export * from './hooks';

// Analytics
export * from './analytics';

// Components
export * from './components/SimpleWalletBadge';
export * from './components/EarnMoreSheet';
export * from './components';

// PHASE 5: Economy Stakes - Streak Insurance
export {
  checkInsuranceStatus,
  purchaseInsurance,
  consumeInsurance,
  getInsuranceCost,
  getInsuranceDetails,
  INSURANCE_COST_GEMS,
  INSURANCE_DURATION_DAYS,
  type StreakInsurance,
  type InsuranceStatus,
  type PurchaseResult,
} from './StreakInsurance';

// Streak Wager system archived - gambling dark patterns removed

// Earn Premium System
export {
  earnPremiumSystem,
  EarnPremiumSystem,
  EarnPremiumAchievementType,
  EarnPremiumRewardSchema,
  EarnPremiumStatusSchema,
  CheckEligibilityInputSchema,
  checkEarnPremiumEligibility,
  claimEarnPremiumReward,
  hasUnclaimedPremiumRewards,
} from './EarnPremiumSystem';
export type {
  EarnPremiumReward,
  EarnPremiumStatus,
  CheckEligibilityInput,
} from './EarnPremiumSystem';

// PHASE 6: Rewards, Progression, And Economy Integrity
export * from './currency-boundaries';
export * from './anti-duplication';
