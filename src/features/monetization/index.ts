/**
 * Monetization Feature - Public API
 *
 * Phase 10 - Monetization
 */

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

// Phase 4.1 - Premium Experience & Paywall Strategy
export {
  FREE_TIER,
  PREMIUM_TIER,
  TIER_DEFINITIONS,
  FEATURE_GATES,
  hasFeatureAccess,
  canCreateStudyPlan,
  canJoinSquad,
  getRemainingStudyPlanSlots,
  getFeatureGate,
  shouldShowPaywall,
  getPaywallContext,
  setUserSubscription,
  getUserSubscription,
  getUserTier,
  isPremium,
  isInTrial,
  getTrialDaysRemaining,
  type SubscriptionTier,
  type TierFeatures,
  type TierDefinition,
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
