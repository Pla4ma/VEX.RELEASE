import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";
import { createDebugger } from "../../utils/debug";
import type {
  CustomerInfoResult,
  OfferingsResult,
  PurchaseResult,
  RevenueCatStatus,
} from "./revenuecat-types";
import {
  createServiceError,
  isUserCancelled,
  mapEntitlements,
  normalizeError,
} from "./revenuecat-service-helpers";

const debug = createDebugger("monetization:revenuecat");
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

class RevenueCatService {
  private status: RevenueCatStatus = "uninitialized";
  private currentUserId: string | null = null;
  private debugMode = __DEV__;
  private reportError(operation: string, error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    if (this.debugMode) debug.error(`[RevenueCat] ${operation} failed`, err);
    Sentry.captureException(err, { tags: { component: "RevenueCatService", operation } });
  }
  async initialize(userId?: string | null): Promise<{ status: "ready" | "missing_keys" | "error" }> {
    if (!IOS_API_KEY && !ANDROID_API_KEY) {
      if (__DEV__) {
        debug.error("[RevenueCat] CRITICAL: No API keys configured. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in .env.local");
      }
      this.status = "missing_keys";
      return { status: "missing_keys" };
    }
    if (this.status === "ready") return { status: "ready" };
    if (this.status === "initializing") {
      return { status: (await this.waitForInitialization()) ? "ready" : "error" };
    }
    this.status = "initializing";
    try {
      const apiKey = Platform.OS === "ios" ? IOS_API_KEY : ANDROID_API_KEY;
      if (!apiKey) {
        this.reportError("configure", new Error(`RevenueCat API key not configured for ${Platform.OS}`));
        this.status = "error";
        return { status: "error" };
      }
      try {
        Purchases.configure({ apiKey, appUserID: undefined });
        Purchases.setLogLevel(this.debugMode ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
        Purchases.addCustomerInfoUpdateListener((ci) => this.handleCustomerInfoUpdate(ci));
      } catch (configError) {
        this.reportError("configure", configError);
        this.status = "error";
        return { status: "error" };
      }
      this.status = "ready";
      if (this.debugMode) debug.debug("[RevenueCat] SDK initialized successfully");
      if (userId) await this.identifyUser(userId);
      return { status: "ready" };
    } catch (error) {
      this.reportError("initialize", error);
      this.status = "error";
      return { status: "error" };
    }
  }
  private async waitForInitialization(): Promise<boolean> {
    const startTime = Date.now();
    const timeout = 5000;
    while (this.status === "initializing") {
      if (Date.now() - startTime > timeout) return false;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.status === "ready";
  }
  async getCustomerInfo(): Promise<CustomerInfoResult> {
    if (!this.isReady()) {
      return { success: false, entitlements: [], error: createServiceError("CONFIGURATION_ERROR", "RevenueCat not initialized") };
    }
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return { success: true, customerInfo, entitlements: mapEntitlements(customerInfo) };
    } catch (error) {
      const err = normalizeError(error);
      this.reportError("getCustomerInfo", err.underlyingError || new Error(err.message));
      return { success: false, entitlements: [], error: err };
    }
  }
  async getOfferings(): Promise<OfferingsResult> {
    if (!this.isReady()) {
      return { success: false, currentOffering: null, error: createServiceError("CONFIGURATION_ERROR", "RevenueCat not initialized") };
    }
    try {
      const offerings = await Purchases.getOfferings();
      return { success: true, offerings, currentOffering: offerings.current ?? null };
    } catch (error) {
      const err = normalizeError(error);
      this.reportError("getOfferings", err.underlyingError || new Error(err.message));
      return { success: false, error: err };
    }
  }
  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
    if (!this.isReady()) {
      return { success: false, error: createServiceError("CONFIGURATION_ERROR", "RevenueCat not initialized") };
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (error) {
      if (isUserCancelled(error)) {
        return { success: false, error: createServiceError("PURCHASE_CANCELLED", "User cancelled the purchase"), errorCode: "PURCHASE_CANCELLED" };
      }
      const err = normalizeError(error);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "purchasePackage", productId: pkg.product.identifier },
        extra: { productIdentifier: pkg.product.identifier, packageIdentifier: pkg.identifier },
      });
      return { success: false, error: err, errorCode: err.code };
    }
  }
  async restorePurchases(): Promise<PurchaseResult> {
    if (!this.isReady()) {
      return { success: false, error: createServiceError("CONFIGURATION_ERROR", "RevenueCat not initialized") };
    }
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (error) {
      const err = normalizeError(error);
      this.reportError("restorePurchases", err.underlyingError || new Error(err.message));
      return { success: false, error: err, errorCode: err.code };
    }
  }
  async setUserId(appUserId: string): Promise<boolean> { return this.identifyUser(appUserId); }
  async clearUserId(): Promise<boolean> { return this.logoutUser(); }
  async identifyUser(appUserId: string): Promise<boolean> {
    if (!this.isReady()) return false;
    try {
      await Purchases.logIn(appUserId);
      this.currentUserId = appUserId;
      if (this.debugMode) debug.debug("[RevenueCat] User identified:", appUserId);
      return true;
    } catch (error) {
      const err = normalizeError(error);
      if (this.debugMode) debug.error("[RevenueCat] Identify user failed", err);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "identifyUser" },
        extra: { appUserId },
      });
      return false;
    }
  }
  async logoutUser(): Promise<boolean> {
    if (!this.isReady()) return false;
    try {
      await Purchases.logOut();
      this.currentUserId = null;
      if (this.debugMode) debug.debug("[RevenueCat] User logged out");
      return true;
    } catch (error) {
      const err = normalizeError(error);
      this.reportError("logoutUser", err.underlyingError || new Error(err.message));
      return false;
    }
  }
  async syncPurchases(): Promise<boolean> {
    if (!this.isReady()) return false;
    try {
      await Purchases.syncPurchases();
      return true;
    } catch (error) {
      debug.error("[RevenueCat] Sync purchases failed", normalizeError(error));
      return false;
    }
  }
  isReady(): boolean { return this.status === "ready"; }
  getStatus(): RevenueCatStatus { return this.status; }
  getCurrentUserId(): string | null { return this.currentUserId; }
  private handleCustomerInfoUpdate(customerInfo: CustomerInfo): void {
    if (this.debugMode) {
      debug.debug("[RevenueCat] Customer info updated:", Object.keys(customerInfo.entitlements.active));
    }
  }
}

export const revenueCatService = new RevenueCatService();
