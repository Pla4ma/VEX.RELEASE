/**
 * Monetization Feature - Public API
 *
 * Phase 10 - Monetization
 */

// Canonical Tier Definitions (single source of truth)
export {
  TIERS,
  FREE_FEATURE_STRS,
  PREMIUM_FEATURE_STRS,
  hasFeature,
  getMaxActiveStudyPlans,
  type TierId,
  type TierDefinition,
  type TierFeatureKey,
} from './tier-definitions';

// Value Ladder
export {
  calculateLadderPosition,
  calculateUpgradeDiscount,
  formatTierPrice,
  getFeatureComparison,
  getPaywallTiming,
  getUpgradeMessage,
  TIER_CONFIGS,
  trackLadderInteraction,
  type LadderPosition,
  type TierConfig,
  type ValueTier,
} from './value-ladder';

// Paywall State Machine
export {
  canDismissPaywall,
  canPurchase,
  createInitialState,
  createPaywallTrigger,
  getPaywallStateMessage,
  getRetryAction,
  isTerminalState,
  transitionPaywallState,
  type PaywallContext,
  type PaywallEvent,
  type PaywallMachineState,
  type PaywallState,
} from './paywall-state-machine';

// Purchase Trust
export {
  calculatePriceTrustScore,
  getActiveTrustSignals,
  getPriceExplanation,
  getRefundEligibility,
  getRemainingDays,
  isPurchaseValid,
  isSuspiciousPurchase,
  logPurchaseAttempt,
  PurchaseReceiptSchema,
  restorePurchases,
  TRUST_SIGNALS,
  verifyPurchaseHash,
  verifyPurchaseReceipt,
  type PurchaseReceipt,
  type PurchaseVerification,
  type TrustSignal,
  type TrustSignalConfig,
} from './purchase-trust';

// Premium Experience & Paywall Strategy
export {
  FEATURE_GATES,
  hasFeatureAccess,
  canCreateStudyPlan,
  getRemainingStudyPlanSlots,
  getFeatureGate,
  shouldShowPaywall,
  getPaywallContext,
  PAYWALL_CONTEXTS,
  setUserSubscription,
  getUserSubscription,
  getUserTier,
  isPremium,
  isInTrial,
  getTrialDaysRemaining,
  type SubscriptionTier,
  type FeatureGate,
  type PaywallContextType,
  type PaywallContextData,
  type UserSubscription,
} from './PremiumTierSystem';

export {
  PAYWALL_MOMENTS,
  recordPaywallShow,
  getPaywallHistory,
  canShowPaywall,
  getPaywallCooldownRemaining,
  evaluateTrigger,
  selectBestPaywall,
  recordConversion,
  getConversionRate,
  getBestConvertingContext,
  shouldPreventPaywall,
  type PaywallMoment,
  type PaywallTriggerCondition,
} from './ContextualPaywall';

export {
  STREAK_SHIELD_COOLDOWN_MS,
  STREAK_SHIELD_COPY,
  assessStreakShieldMoment,
  buildStreakShieldMoment,
  createStreakShieldRecord,
} from './service';
export { useStreakShieldMoment } from './hooks';
export type {
  StreakShieldCopy,
  StreakShieldMoment,
  StreakShieldMomentInput,
  StreakShieldMomentReason,
  StreakShieldMomentResult,
  StreakShieldRecord,
  StreakShieldRouteParams,
} from './types';
