/** RevenueCat Service - main class composing error, purchase, and identity helpers. */

import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { createDebugger } from '../../utils/debug';
import type { CustomerInfoResult, OfferingsResult, PurchaseResult, RevenueCatStatus } from './revenuecat-types';
import * as RCPurchases from './rc-purchases';
import * as RCIdentity from './rc-identity';
import { handleCustomerInfoUpdate } from './rc-entitlements';

const debug = createDebugger('monetization:revenuecat');
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

// ============================================================================
// RevenueCatService Class
// ============================================================================

class RevenueCatService {
  private status: RevenueCatStatus = 'uninitialized';
  private currentUserId: string | null = null;
  private debugMode = __DEV__;

  private buildContext(): RCPurchases.RCContext {
    return { isReady: () => this.isReady(), debugMode: this.debugMode };
  }
  private buildIdentityContext(): RCIdentity.RCIdentityContext {
    return { isReady: () => this.isReady(), debugMode: this.debugMode, setCurrentUserId: (id: string | null) => { this.currentUserId = id; } };
  }

  async initialize(userId?: string | null): Promise<{ status: 'ready' | 'missing_keys' | 'error' }> {
    if (!IOS_API_KEY && !ANDROID_API_KEY) {
      if (__DEV__) { debug.error('[RevenueCat] CRITICAL: No API keys configured. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in .env.local'); }
      this.status = 'missing_keys';
      return { status: 'missing_keys' };
    }
    if (this.status === 'ready') { return { status: 'ready' }; }
    if (this.status === 'initializing') {
      const ready = await this.waitForInitialization();
      return { status: ready ? 'ready' : 'error' };
    }
    this.status = 'initializing';
    try {
      const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
      if (!apiKey) {
        const error = new Error(`RevenueCat API key not configured for ${Platform.OS}`);
        if (__DEV__) { debug.error('[RevenueCat]', error); }
        Sentry.captureException(error);
        this.status = 'error';
        return { status: 'error' };
      }
      try {
        Purchases.configure({ apiKey, appUserID: undefined });
        Purchases.setLogLevel(this.debugMode ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
        Purchases.addCustomerInfoUpdateListener((customerInfo) => { this.handleCustomerInfoUpdate(customerInfo); });
      } catch (configError) {
        const configErr = configError instanceof Error ? configError : new Error(String(configError));
        if (this.debugMode) { debug.error('[RevenueCat] Configuration failed', configErr); }
        Sentry.captureException(configErr, { tags: { component: 'RevenueCatService', operation: 'configure' } });
        this.status = 'error';
        return { status: 'error' };
      }
      this.status = 'ready';
      if (this.debugMode) { debug.debug('[RevenueCat] SDK initialized successfully'); }
      if (userId) { await this.identifyUser(userId); }
      return { status: 'ready' };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.debugMode) { debug.error('[RevenueCat] Initialization failed', err); }
      Sentry.captureException(err, { tags: { component: 'RevenueCatService', operation: 'initialize' } });
      this.status = 'error';
      return { status: 'error' };
    }
  }

  private async waitForInitialization(): Promise<boolean> {
    const startTime = Date.now();
    const timeout = 5000;
    while (this.status === 'initializing') {
      if (Date.now() - startTime > timeout) { return false; }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.status === 'ready';
  }

  async getCustomerInfo(): Promise<CustomerInfoResult> { return RCPurchases.getCustomerInfo(this.buildContext()); }
  async getOfferings(): Promise<OfferingsResult> { return RCPurchases.getOfferings(this.buildContext()); }
  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> { return RCPurchases.purchasePackage(this.buildContext(), pkg); }
  async restorePurchases(): Promise<PurchaseResult> { return RCPurchases.restorePurchases(this.buildContext()); }
  async syncPurchases(): Promise<boolean> { return RCPurchases.syncPurchases(this.buildContext()); }
  private handleCustomerInfoUpdate(customerInfo: CustomerInfo): void { handleCustomerInfoUpdate(customerInfo, this.debugMode); }

  async identifyUser(appUserId: string): Promise<boolean> { return RCIdentity.identifyUser(this.buildIdentityContext(), appUserId); }
  async logoutUser(): Promise<boolean> { return RCIdentity.logoutUser(this.buildIdentityContext()); }
  async setUserId(appUserId: string): Promise<boolean> { return this.identifyUser(appUserId); }
  async clearUserId(): Promise<boolean> { return this.logoutUser(); }

  isReady(): boolean { return this.status === 'ready'; }
  getStatus(): RevenueCatStatus { return this.status; }
  getCurrentUserId(): string | null { return this.currentUserId; }
}

export const revenueCatService = new RevenueCatService();
export const initializeRevenueCat = (userId?: string | null): Promise<{ status: 'ready' | 'missing_keys' | 'error' }> => revenueCatService.initialize(userId);
export const getCustomerInfo = (): Promise<CustomerInfoResult> => revenueCatService.getCustomerInfo();
export const getOfferings = (): Promise<OfferingsResult> => revenueCatService.getOfferings();
export const purchasePackage = (pkg: PurchasesPackage): Promise<PurchaseResult> => revenueCatService.purchasePackage(pkg);
export const restorePurchases = (): Promise<PurchaseResult> => revenueCatService.restorePurchases();
export const identifyUser = (userId: string): Promise<boolean> => revenueCatService.identifyUser(userId);
export const setUserId = (userId: string): Promise<boolean> => revenueCatService.setUserId(userId);
export const clearUserId = (): Promise<boolean> => revenueCatService.clearUserId();
export const logoutUser = (): Promise<boolean> => revenueCatService.logoutUser();
export const syncPurchases = (): Promise<boolean> => revenueCatService.syncPurchases();
export const isRevenueCatReady = (): boolean => revenueCatService.isReady();
export const getRevenueCatStatus = (): RevenueCatStatus => revenueCatService.getStatus();
