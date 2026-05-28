import type {
  EntitlementInfo,
  PurchaseResult,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
} from "./revenuecat-types";
import { useRevenueCat } from "./use-revenuecat";

export function usePremiumStatus(): {
  isPremium: boolean;
  isLoading: boolean;
  entitlements: EntitlementInfo[];
  refresh: () => Promise<void>;
} {
  const { isPremium, activeEntitlements, isLoadingCustomer, refreshCustomer } =
    useRevenueCat();
  return {
    isPremium,
    isLoading: isLoadingCustomer,
    entitlements: activeEntitlements,
    refresh: refreshCustomer,
  };
}

export function usePaywall(): {
  offerings: PurchasesOfferingDisplayInfo | null;
  packages: PurchasesPackageDisplayInfo[];
  isLoading: boolean;
  error: RevenueCatError | null;
  purchase: (pkg: PurchasesPackageDisplayInfo) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
  retry: () => Promise<void>;
} {
  const {
    offerings,
    availablePackages,
    isLoadingOfferings,
    offeringsError,
    isPurchasing,
    isRestoring,
    purchasePackage,
    restorePurchases,
    retry,
  } = useRevenueCat();
  return {
    offerings,
    packages: availablePackages,
    isLoading: isLoadingOfferings || isPurchasing || isRestoring,
    error: offeringsError,
    purchase: purchasePackage,
    restore: restorePurchases,
    retry,
  };
}
