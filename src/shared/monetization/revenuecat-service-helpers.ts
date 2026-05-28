import { PURCHASES_ERROR_CODE, type CustomerInfo } from "react-native-purchases";
import type { EntitlementInfo, RevenueCatError } from "./revenuecat-types";

interface PurchasesErrorShape {
  code: PURCHASES_ERROR_CODE;
  message: string;
}

export function normalizeError(error: unknown): RevenueCatError {
  const purchasesError = error as Partial<PurchasesErrorShape>;
  if (
    purchasesError.code !== undefined &&
    Object.values(PURCHASES_ERROR_CODE).includes(purchasesError.code)
  ) {
    const err = new Error(
      purchasesError.message || String(error),
    ) as RevenueCatError;
    err.name = "RevenueCatError";
    err.code = mapErrorCode(purchasesError.code);
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

export function createServiceError(
  code: RevenueCatError["code"],
  message: string,
): RevenueCatError {
  const err = new Error(message) as RevenueCatError;
  err.name = "RevenueCatError";
  err.code = code;
  err.underlyingError = new Error(message);
  return err;
}

export function isUserCancelled(error: unknown): boolean {
  const purchasesError = error as Partial<PurchasesErrorShape>;
  return (
    purchasesError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

export function mapErrorCode(code: PURCHASES_ERROR_CODE): RevenueCatError["code"] {
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

export function mapEntitlements(customerInfo: CustomerInfo): EntitlementInfo[] {
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
