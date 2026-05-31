/**
 * Monetization Module
 *
 * RevenueCat integration for in-app purchases and subscriptions.
 *
 * Usage:
 *   import { useRevenueCat, usePremiumStatus, usePaywall } from '@/shared/monetization';
 */

// Service exports
export { revenueCatService } from './revenuecat-service';
export {
  initializeRevenueCat,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  identifyUser,
  logoutUser,
  syncPurchases,
  isRevenueCatReady,
  getRevenueCatStatus,
} from './revenuecat-exports';

// Type exports
export type {
  RevenueCatConfig,
  RevenueCatStatus,
  PurchaseState,
  PurchaseResult,
  OfferingsResult,
  CustomerInfoResult,
  EntitlementInfo,
  PurchasesPackageDisplayInfo,
  PurchasesOfferingDisplayInfo,
  RevenueCatError,
  RevenueCatErrorCode,
  PurchaseAnalyticsProperties,
  EntitlementAnalyticsProperties,
  UseRevenueCatState,
} from './revenuecat-types';

// Hook exports
export { useRevenueCat, usePremiumStatus, usePaywall } from './use-revenuecat';

export {
  KNOWN_PREMIUM_ENTITLEMENT_IDS,
  getEntitlementAccessState,
  hasPremiumEntitlement,
  isPremiumEntitlementIdentifier,
  type EntitlementAccessState,
  type PremiumEntitlementId,
} from './entitlements';

export {
  resolvePremiumStrategy,
  type PremiumHighIntentAction,
  type PremiumStrategy,
  type PremiumStrategyInput,
} from './premium-strategy';

// Event exports
export {
  PurchaseEvents,
  createPaywallProperties,
  createPurchaseProperties,
  createEntitlementProperties,
  createOfferingProperties,
  createRestoreProperties,
  type PaywallEventProperties,
  type PurchaseEventProperties,
  type EntitlementEventProperties,
  type OfferingEventProperties,
  type RestoreEventProperties,
} from './purchase-events';

// Component exports
export { VipPaywallScreen } from './components/VipPaywallScreen';
// DailyGemClaim archived - dark pattern gambling mechanics removed
export { PurchaseLoadingState } from './components/PurchaseLoadingState';
export { PurchaseErrorState } from './components/PurchaseErrorState';

// Repository exports
export * from './repository';

// Utils exports
export * from './utils';
