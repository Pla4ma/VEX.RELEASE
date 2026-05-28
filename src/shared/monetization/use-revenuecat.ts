import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomerInfo, PurchasesOffering } from "react-native-purchases";
import { revenueCatService } from "./revenuecat-service";
import type {
  EntitlementInfo,
  PurchaseResult,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
  UseRevenueCatState,
} from "./revenuecat-types";
import { refreshOfferings, refreshCustomer } from "./revenuecat-query-ops";
import {
  executePurchase,
  executeRestore,
  executeRetry,
} from "./revenuecat-mutation-ops";

export function useRevenueCat(): UseRevenueCatState {
  const [status, setStatus] =
    useState<UseRevenueCatState["status"]>("uninitialized");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [offerings, setOfferings] =
    useState<PurchasesOfferingDisplayInfo | null>(null);
  const [availablePackages, setAvailablePackages] = useState<
    PurchasesPackageDisplayInfo[]
  >([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [activeEntitlements, setActiveEntitlements] = useState<
    EntitlementInfo[]
  >([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [offeringsError, setOfferingsError] = useState<RevenueCatError | null>(
    null,
  );
  const [customerError, setCustomerError] = useState<RevenueCatError | null>(
    null,
  );
  const [purchaseError, setPurchaseError] = useState<RevenueCatError | null>(
    null,
  );
  const rawOfferingRef = useRef<PurchasesOffering | null>(null);
  const hasOfferings = availablePackages.length > 0;

  const doRefreshOfferings = useCallback(
    (): Promise<void> =>
      refreshOfferings({
        setIsLoading: setIsLoadingOfferings,
        setOfferings,
        setPackages: setAvailablePackages,
        setError: setOfferingsError,
        rawOfferingRef,
      }),
    [],
  );

  const doRefreshCustomer = useCallback(
    (): Promise<void> =>
      refreshCustomer({
        setIsLoading: setIsLoadingCustomer,
        setCustomerInfo,
        setEntitlements: setActiveEntitlements,
        setIsPremium,
        setError: setCustomerError,
      }),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      setStatus("initializing");
      const result = await revenueCatService.initialize();
      if (!isMounted) {
        return;
      }
      setIsInitialized(true);
      setStatus(result.status);
      const ready = result.status === "ready" && revenueCatService.isReady();
      setIsReady(ready);
      if (ready) {
        await Promise.all([doRefreshOfferings(), doRefreshCustomer()]);
      }
    };
    void initialize();
    return () => {
      isMounted = false;
    };
  }, [doRefreshCustomer, doRefreshOfferings]);

  const purchasePackage = useCallback(
    (packageInfo: PurchasesPackageDisplayInfo): Promise<PurchaseResult> =>
      executePurchase(
        {
          setIsPurchasing,
          setPurchaseError,
          rawOfferingRef,
          offerings,
          refreshCustomer: doRefreshCustomer,
        },
        packageInfo,
      ),
    [offerings?.identifier, doRefreshCustomer],
  );

  const restorePurchases = useCallback(
    (): Promise<PurchaseResult> =>
      executeRestore({
        setIsRestoring,
        setPurchaseError,
        entitlementCount: activeEntitlements.length,
        refreshCustomer: doRefreshCustomer,
      }),
    [activeEntitlements.length, doRefreshCustomer],
  );

  const retry = useCallback(
    (): Promise<void> =>
      executeRetry({
        clearErrors: () => {
          setOfferingsError(null);
          setCustomerError(null);
          setPurchaseError(null);
        },
        setStatus,
        setIsReady,
        refreshOfferings: doRefreshOfferings,
        refreshCustomer: doRefreshCustomer,
      }),
    [doRefreshCustomer, doRefreshOfferings],
  );

  return {
    isInitialized,
    isReady,
    status,
    offerings,
    availablePackages,
    hasOfferings,
    customerInfo,
    activeEntitlements,
    isPremium,
    isLoadingOfferings,
    isLoadingCustomer,
    isPurchasing,
    isRestoring,
    offeringsError,
    customerError,
    purchaseError,
    refreshOfferings: doRefreshOfferings,
    refreshCustomer: doRefreshCustomer,
    purchasePackage,
    restorePurchases,
    identifyUser: revenueCatService.identifyUser.bind(revenueCatService),
    logoutUser: revenueCatService.logoutUser.bind(revenueCatService),
    retry,
  };
}

// Re-export derived hooks for backward compatibility
export { usePremiumStatus, usePaywall } from "./use-revenuecat-derived";

// Re-export types for backward compatibility
export type {
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  PurchaseResult,
};
