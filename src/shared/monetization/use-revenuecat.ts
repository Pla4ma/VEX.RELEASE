import { useCallback, useEffect, useRef, useState } from 'react';
import type { PurchasesOffering } from 'react-native-purchases';
import { revenueCatService } from './revenuecat-service';
import type {
  _EntitlementInfo,
  PurchaseResult,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
  UseRevenueCatState,
} from './revenuecat-types';
import { useMonetizationStore } from './store';
import { mapEntitlements } from './revenuecat-service-helpers';
import { refreshOfferings, refreshCustomer } from './revenuecat-query-ops';
import {
  executePurchase,
  executeRestore,
  executeRetry,
} from './revenuecat-mutation-ops';

export function useRevenueCat(): UseRevenueCatState {
  const [status, setStatus] =
    useState<UseRevenueCatState['status']>('uninitialized');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [offerings, setOfferings] =
    useState<PurchasesOfferingDisplayInfo | null>(null);
  const [availablePackages, setAvailablePackages] = useState<
    PurchasesPackageDisplayInfo[]
  >([]);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const {
    isPurchasing,
    customerInfo,
    activeEntitlements,
    isPremium,
    setIsPurchasing,
    setEntitlements: setStoreEntitlements,
    setCustomerInfo: setStoreCustomerInfo,
  } = useMonetizationStore();
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
        setCustomerInfo: setStoreCustomerInfo,
        setEntitlements: setStoreEntitlements,
        setIsPremium: (v) => {
          if (!v) {
            setStoreEntitlements([]);
          }
        },
        setError: setCustomerError,
      }),
    [setStoreCustomerInfo, setStoreEntitlements],
  );

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      setStatus('initializing');
      const result = await revenueCatService.initialize();
      if (!isMounted) {
        return;
      }
      setIsInitialized(true);
      setStatus(result.status);
      const ready = result.status === 'ready' && revenueCatService.isReady();
      setIsReady(ready);
      if (ready) {
        await Promise.all([doRefreshOfferings(), doRefreshCustomer()]);
      }
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, [doRefreshCustomer, doRefreshOfferings]);

  useEffect(() => {
    if (!isReady) {return;}
    const unsubscribe = revenueCatService.onCustomerInfoUpdate((info) => {
      const entitlements = mapEntitlements(info);
      setStoreCustomerInfo(info);
      setStoreEntitlements(entitlements);
    });
    return unsubscribe;
  }, [isReady, setStoreCustomerInfo, setStoreEntitlements]);

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
    [offerings, doRefreshCustomer, setIsPurchasing],
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
export { usePremiumStatus, usePaywall } from './use-revenuecat-derived';

// Re-export types for backward compatibility
export type {
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  PurchaseResult,
};
