import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";
import { createDebugger } from "../../utils/debug";
import type {
  CustomerInfoResult,
  EntitlementInfo,
  OfferingsResult,
  PurchaseResult,
  RevenueCatError,
  RevenueCatStatus,
} from "./revenuecat-types";
interface PurchasesErrorShape {
  code: PURCHASES_ERROR_CODE;
  message: string;
}
const debug = createDebugger("monetization:revenuecat");
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
class RevenueCatService {
  private status: RevenueCatStatus = "uninitialized";
  private currentUserId: string | null = null;
  private debugMode = __DEV__;
  async initialize(
    userId?: string | null,
  ): Promise<{ status: "ready" | "missing_keys" | "error" }> {
    if (!IOS_API_KEY && !ANDROID_API_KEY) {
      if (__DEV__) {
        debug.error(
          "[RevenueCat] CRITICAL: No API keys configured. Set EXPO_PUBLIC_REVENUECAT_IOS_KEY and EXPO_PUBLIC_REVENUECAT_ANDROID_KEY in .env.local",
        );
      }
      this.status = "missing_keys";
      return { status: "missing_keys" };
    }
    if (this.status === "ready") {
      return { status: "ready" };
    }
    if (this.status === "initializing") {
      const ready = await this.waitForInitialization();
      return { status: ready ? "ready" : "error" };
    }
    this.status = "initializing";
    try {
      const apiKey = Platform.OS === "ios" ? IOS_API_KEY : ANDROID_API_KEY;
      if (!apiKey) {
        const error = new Error(
          `RevenueCat API key not configured for ${Platform.OS}`,
        );
        if (__DEV__) {
          debug.error("[RevenueCat]", error);
        }
        Sentry.captureException(error);
        this.status = "error";
        return { status: "error" };
      }
      try {
        Purchases.configure({ apiKey, appUserID: undefined });
        Purchases.setLogLevel(
          this.debugMode ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR,
        );
        Purchases.addCustomerInfoUpdateListener((customerInfo) => {
          this.handleCustomerInfoUpdate(customerInfo);
        });
      } catch (configError) {
        const configErr =
          configError instanceof Error
            ? configError
            : new Error(String(configError));
        if (this.debugMode) {
          debug.error("[RevenueCat] Configuration failed", configErr);
        }
        Sentry.captureException(configErr, {
          tags: { component: "RevenueCatService", operation: "configure" },
        });
        this.status = "error";
        return { status: "error" };
      }
      this.status = "ready";
      if (this.debugMode) {
        debug.debug("[RevenueCat] SDK initialized successfully");
      }
      if (userId) {
        await this.identifyUser(userId);
      }
      return { status: "ready" };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (this.debugMode) {
        debug.error("[RevenueCat] Initialization failed", err);
      }
      Sentry.captureException(err, {
        tags: { component: "RevenueCatService", operation: "initialize" },
      });
      this.status = "error";
      return { status: "error" };
    }
  }
  private async waitForInitialization(): Promise<boolean> {
    const startTime = Date.now();
    const timeout = 5000;
    while (this.status === "initializing") {
      if (Date.now() - startTime > timeout) {
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.status === "ready";
  }
  async getCustomerInfo(): Promise<CustomerInfoResult> {
    if (!this.isReady()) {
      return {
        success: false,
        entitlements: [],
        error: this.createError(
          "CONFIGURATION_ERROR",
          "RevenueCat not initialized",
        ),
      };
    }
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return {
        success: true,
        customerInfo,
        entitlements: this.mapEntitlements(customerInfo),
      };
    } catch (error) {
      const err = this.normalizeError(error);
      debug.error("[RevenueCat] Get customer info failed", err);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "getCustomerInfo" },
      });
      return { success: false, entitlements: [], error: err };
    }
  }
  async getOfferings(): Promise<OfferingsResult> {
    if (!this.isReady()) {
      return {
        success: false,
        currentOffering: null,
        error: this.createError(
          "CONFIGURATION_ERROR",
          "RevenueCat not initialized",
        ),
      };
    }
    try {
      const offerings = await Purchases.getOfferings();
      return {
        success: true,
        offerings,
        currentOffering: offerings.current ?? null,
      };
    } catch (error) {
      const err = this.normalizeError(error);
      debug.error("[RevenueCat] Get offerings failed", err);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "getOfferings" },
      });
      return { success: false, error: err };
    }
  }
  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: this.createError(
          "CONFIGURATION_ERROR",
          "RevenueCat not initialized",
        ),
      };
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return { success: true, customerInfo };
    } catch (error) {
      if (this.isUserCancelled(error)) {
        return {
          success: false,
          error: this.createError(
            "PURCHASE_CANCELLED",
            "User cancelled the purchase",
          ),
          errorCode: "PURCHASE_CANCELLED",
        };
      }
      const err = this.normalizeError(error);
      debug.error("[RevenueCat] Purchase failed", err);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: {
          component: "RevenueCatService",
          operation: "purchasePackage",
          productId: pkg.product.identifier,
        },
        extra: {
          productIdentifier: pkg.product.identifier,
          packageIdentifier: pkg.identifier,
        },
      });
      return { success: false, error: err, errorCode: err.code };
    }
  }
  async restorePurchases(): Promise<PurchaseResult> {
    if (!this.isReady()) {
      return {
        success: false,
        error: this.createError(
          "CONFIGURATION_ERROR",
          "RevenueCat not initialized",
        ),
      };
    }
    try {
      const customerInfo = await Purchases.restorePurchases();
      return { success: true, customerInfo };
    } catch (error) {
      const err = this.normalizeError(error);
      debug.error("[RevenueCat] Restore failed", err);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "restorePurchases" },
      });
      return { success: false, error: err, errorCode: err.code };
    }
  }
  async setUserId(appUserId: string): Promise<boolean> {
    return this.identifyUser(appUserId);
  }
  async clearUserId(): Promise<boolean> {
    return this.logoutUser();
  }
  async identifyUser(appUserId: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }
    try {
      await Purchases.logIn(appUserId);
      this.currentUserId = appUserId;
      if (this.debugMode) {
        debug.debug("[RevenueCat] User identified:", appUserId);
      }
      return true;
    } catch (error) {
      const err = this.normalizeError(error);
      if (this.debugMode) {
        debug.error("[RevenueCat] Identify user failed", err);
      }
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "identifyUser" },
        extra: { appUserId },
      });
      return false;
    }
  }
  async logoutUser(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }
    try {
      await Purchases.logOut();
      this.currentUserId = null;
      if (this.debugMode) {
        debug.debug("[RevenueCat] User logged out");
      }
      return true;
    } catch (error) {
      const err = this.normalizeError(error);
      debug.error("[RevenueCat] Logout failed", err);
      Sentry.captureException(err.underlyingError || new Error(err.message), {
        tags: { component: "RevenueCatService", operation: "logoutUser" },
      });
      return false;
    }
  }
  async syncPurchases(): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }
    try {
      await Purchases.syncPurchases();
      return true;
    } catch (error) {
      const err = this.normalizeError(error);
      debug.error("[RevenueCat] Sync purchases failed", err);
      return false;
    }
  }
  isReady(): boolean {
    return this.status === "ready";
  }
  getStatus(): RevenueCatStatus {
    return this.status;
  }
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
  private handleCustomerInfoUpdate(customerInfo: CustomerInfo): void {
    if (this.debugMode) {
      debug.debug(
        "[RevenueCat] Customer info updated:",
        Object.keys(customerInfo.entitlements.active),
      );
    }
  }
  private mapEntitlements(customerInfo: CustomerInfo): EntitlementInfo[] {
    return Object.entries(customerInfo.entitlements.active).map(
      ([identifier, entitlement]) => ({
        identifier,
        isActive: entitlement.isActive,
        willRenew: entitlement.willRenew,
        periodType: entitlement.periodType,
        latestPurchaseDate: entitlement.latestPurchaseDate,
        originalPurchaseDate: entitlement.originalPurchaseDate,
        expirationDate: entitlement.expirationDate,
        store: entitlement.store,
        productIdentifier: entitlement.productIdentifier,
        isSandbox: entitlement.isSandbox,
        unsubscribeDetectedAt: entitlement.unsubscribeDetectedAt,
        billingIssueDetectedAt: entitlement.billingIssueDetectedAt,
      }),
    );
  }
  private normalizeError(error: unknown): RevenueCatError {
    const purchasesError = error as Partial<PurchasesErrorShape>;
    if (
      purchasesError.code !== undefined &&
      Object.values(PURCHASES_ERROR_CODE).includes(purchasesError.code)
    ) {
      const err = new Error(
        purchasesError.message || String(error),
      ) as RevenueCatError;
      err.name = "RevenueCatError";
      err.code = this.mapErrorCode(purchasesError.code);
      err.underlyingError =
        error instanceof Error ? error : new Error(String(error));
      return err;
    }
    const err = new Error(
      error instanceof Error ? error.message : String(error),
    ) as RevenueCatError;
    err.name = "RevenueCatError";
    err.code = "UNKNOWN";
    err.underlyingError =
      error instanceof Error ? error : new Error(String(error));
    return err;
  }
  private createError(
    code: RevenueCatError["code"],
    message: string,
  ): RevenueCatError {
    const err = new Error(message) as RevenueCatError;
    err.name = "RevenueCatError";
    err.code = code;
    err.underlyingError = new Error(message);
    return err;
  }
  private isUserCancelled(error: unknown): boolean {
    const purchasesError = error as Partial<PurchasesErrorShape>;
    return (
      purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
    );
  }
  private mapErrorCode(code: PURCHASES_ERROR_CODE): RevenueCatError["code"] {
    switch (code) {
      case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
        return "PURCHASE_CANCELLED";
      case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
        return "STORE_PROBLEM";
      case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
        return "PURCHASE_NOT_ALLOWED";
      case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
        return "PURCHASE_INVALID";
      case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
        return "PRODUCT_NOT_AVAILABLE";
      case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
        return "PRODUCT_ALREADY_PURCHASED";
      case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
        return "RECEIPT_ALREADY_IN_USE";
      case PURCHASES_ERROR_CODE.INVALID_RECEIPT_ERROR:
        return "INVALID_RECEIPT";
      case PURCHASES_ERROR_CODE.MISSING_RECEIPT_FILE_ERROR:
        return "MISSING_RECEIPT_FILE";
      case PURCHASES_ERROR_CODE.NETWORK_ERROR:
        return "NETWORK_ERROR";
      case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
        return "INVALID_CREDENTIALS";
      case PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR:
        return "UNEXPECTED_BACKEND_ERROR";
      case PURCHASES_ERROR_CODE.INVALID_APP_USER_ID_ERROR:
        return "INVALID_APP_USER_ID";
      case PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR:
        return "OPERATION_ALREADY_IN_PROGRESS";
      case PURCHASES_ERROR_CODE.INVALID_SUBSCRIBER_ATTRIBUTES_ERROR:
        return "INVALID_SUBSCRIBER_ATTRIBUTES";
      default:
        return "UNKNOWN";
    }
  }
}
export const revenueCatService = new RevenueCatService();
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
