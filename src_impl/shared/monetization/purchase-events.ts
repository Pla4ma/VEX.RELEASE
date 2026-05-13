/**
 * Purchase Analytics Events
 *
 * Monetization event constants for tracking purchase flow.
 * All events go through the analytics layer.
 */

// ============================================================================
// Monetization Events
// ============================================================================

export const PurchaseEvents = {
  // Paywall
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',

  // Offerings
  OFFERING_LOADED: 'offering_loaded',
  OFFERING_LOAD_FAILED: 'offering_load_failed',
  OFFERING_EMPTY: 'offering_empty',

  // Purchase Flow
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  PURCHASE_CANCELLED: 'purchase_cancelled',
  PURCHASE_RESTORED: 'purchase_restored',

  // Restore Flow
  RESTORE_STARTED: 'restore_started',
  RESTORE_COMPLETED: 'restore_completed',
  RESTORE_FAILED: 'restore_failed',
  RESTORE_EMPTY: 'restore_empty',

  // Entitlements
  ENTITLEMENT_ACTIVATED: 'entitlement_activated',
  ENTITLEMENT_REVOKED: 'entitlement_revoked',
  ENTITLEMENT_EXPIRED: 'entitlement_expired',
  ENTITLEMENT_CHECKED: 'entitlement_checked',

  // Product Selection
  PACKAGE_SELECTED: 'package_selected',
  PACKAGE_VIEWED: 'package_viewed',

  // Premium Features
  PREMIUM_FEATURE_LOCKED: 'premium_feature_locked',
  PREMIUM_FEATURE_UNLOCKED: 'premium_feature_unlocked',

  // Errors
  REVENUECAT_ERROR: 'revenuecat_error',
  PURCHASE_ERROR_REPORTED: 'purchase_error_reported',
} as const;

export type PurchaseEvent = typeof PurchaseEvents[keyof typeof PurchaseEvents];

// ============================================================================
// Event Property Types
// ============================================================================
// ============================================================================
// Event Payload Helpers
// ============================================================================

export function createPaywallProperties(
  offeringId: string,
  source: string,
  packages: Array<{ identifier: string; hasTrial: boolean }>
): PaywallEventProperties {
  return {
    offering_id: offeringId,
    paywall_source: source,
    number_of_packages: packages.length,
    has_free_trial: packages.some(p => p.hasTrial),
  };
}

export function createPurchaseProperties(
  params: {
    packageId: string;
    offeringId: string;
    productId: string;
    price: number;
    currency: string;
    isRestore: boolean;
    introPrice?: number;
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }
): PurchaseEventProperties {
  return {
    package_id: params.packageId,
    offering_id: params.offeringId,
    product_id: params.productId,
    price: params.price,
    currency: params.currency,
    is_restore: params.isRestore,
    has_intro_offer: params.introPrice !== undefined && params.introPrice < params.price,
    intro_price: params.introPrice,
    success: params.success,
    error_code: params.errorCode,
    error_message: params.errorMessage,
    user_id: '', // Populated by analytics service
    timestamp: Date.now(),
  };
}

export function createEntitlementProperties(
  entitlementId: string,
  isActive: boolean,
  source: 'purchase' | 'restore' | 'initial' | 'expiration',
  details?: {
    willRenew?: boolean;
    expirationDate?: string;
    productId?: string;
  }
): EntitlementEventProperties {
  return {
    entitlement_id: entitlementId,
    is_active: isActive,
    source,
    will_renew: details?.willRenew,
    expiration_date: details?.expirationDate,
    product_id: details?.productId,
  };
}

export function createOfferingProperties(
  offeringId: string,
  packages: Array<{ packageType: string }>,
  error?: { code: string }
): OfferingEventProperties {
  const packageTypes = packages.map(p => p.packageType);

  return {
    offering_id: offeringId,
    package_count: packages.length,
    available_package_types: [...new Set(packageTypes)],
    has_lifetime: packageTypes.includes('LIFETIME'),
    has_subscription: packageTypes.some(t =>
      ['ANNUAL', 'SIX_MONTH', 'THREE_MONTH', 'TWO_MONTH', 'MONTHLY', 'WEEKLY'].includes(t)
    ),
    error_code: error?.code,
  };
}

export function createRestoreProperties(
  entitlements: string[],
  success: boolean,
  error?: { code: string; message: string }
): RestoreEventProperties {
  return {
    found_entitlements: entitlements.length > 0,
    entitlement_count: entitlements.length,
    success,
    error_code: error?.code,
    error_message: error?.message,
  };
}

export * from "./purchase-events.types";
