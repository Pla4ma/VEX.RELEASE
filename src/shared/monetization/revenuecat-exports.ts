import { revenueCatService } from './revenuecat-service';
import type {
  CustomerInfoResult,
  OfferingsResult,
  PurchaseResult,
  RevenueCatStatus,
} from './revenuecat-types';

export const initializeRevenueCat = (userId?: string): Promise<{ status: 'ready' | 'missing_keys' | 'error' }> =>
  revenueCatService.initialize(userId);

export const getCustomerInfo = (): Promise<CustomerInfoResult> =>
  revenueCatService.getCustomerInfo();

export const getOfferings = (): Promise<OfferingsResult> =>
  revenueCatService.getOfferings();

export const purchasePackage = (pkg: Parameters<typeof revenueCatService.purchasePackage>[0]): Promise<PurchaseResult> =>
  revenueCatService.purchasePackage(pkg);

export const restorePurchases = (): Promise<PurchaseResult> =>
  revenueCatService.restorePurchases();

export const identifyUser = (appUserId: string): Promise<boolean> =>
  revenueCatService.identifyUser(appUserId);

export const logoutUser = (): Promise<boolean> =>
  revenueCatService.logoutUser();

export const syncPurchases = (): Promise<boolean> =>
  revenueCatService.syncPurchases();

export const isRevenueCatReady = (): boolean =>
  revenueCatService.isReady();

export const getRevenueCatStatus = (): RevenueCatStatus =>
  revenueCatService.getStatus();
