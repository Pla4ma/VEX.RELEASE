import type { PurchasesPackage } from "react-native-purchases";
import type {
  CustomerInfoResult,
  OfferingsResult,
  PurchaseResult,
  RevenueCatStatus,
} from "./revenuecat-types";
import { revenueCatService } from "./revenuecat-service";

export const initializeRevenueCat = (
  userId?: string | null,
): Promise<{ status: "ready" | "missing_keys" | "error" }> =>
  revenueCatService.initialize(userId);
export const getCustomerInfo = (): Promise<CustomerInfoResult> =>
  revenueCatService.getCustomerInfo();
export const getOfferings = (): Promise<OfferingsResult> =>
  revenueCatService.getOfferings();
export const purchasePackage = (
  pkg: PurchasesPackage,
): Promise<PurchaseResult> => revenueCatService.purchasePackage(pkg);
export const restorePurchases = (): Promise<PurchaseResult> =>
  revenueCatService.restorePurchases();
export const identifyUser = (userId: string): Promise<boolean> =>
  revenueCatService.identifyUser(userId);
export const setUserId = (userId: string): Promise<boolean> =>
  revenueCatService.setUserId(userId);
export const clearUserId = (): Promise<boolean> =>
  revenueCatService.clearUserId();
export const logoutUser = (): Promise<boolean> =>
  revenueCatService.logoutUser();
export const syncPurchases = (): Promise<boolean> =>
  revenueCatService.syncPurchases();
export const isRevenueCatReady = (): boolean => revenueCatService.isReady();
export const getRevenueCatStatus = (): RevenueCatStatus =>
  revenueCatService.getStatus();
