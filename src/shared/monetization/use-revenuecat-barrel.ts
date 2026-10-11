/**
 * Public barrel for use-revenuecat hooks.
 *
 * Why a barrel: use-revenuecat.ts and use-revenuecat-derived.ts form a
 * natural pair (the derived hooks depend on useRevenueCat). Importing them
 * through a separate barrel file breaks the require cycle that Metro would
 * otherwise warn about, and gives downstream consumers a single import path.
 */

export { useRevenueCat } from './use-revenuecat';
export type {
  UseRevenueCatState,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  PurchaseResult,
} from './revenuecat-types';

export { usePremiumStatus, usePaywall } from './use-revenuecat-derived';
