import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import * as Sentry from '@sentry/react-native';
import type { PurchaseResult } from './revenuecat-types';
import {
  createServiceError,
  isUserCancelled,
  normalizeError,
} from './revenuecat-service-helpers';

export interface PurchaseServiceDeps {
  isReady(): boolean;
  debugMode: boolean;
  reportError(operation: string, error: unknown): void;
}

export async function purchasePackage(
  deps: PurchaseServiceDeps,
  pkg: PurchasesPackage,
): Promise<PurchaseResult> {
  if (!deps.isReady()) {
    return {
      success: false,
      error: createServiceError(
        'CONFIGURATION_ERROR',
        'RevenueCat not initialized',
      ),
    };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error) {
    if (isUserCancelled(error)) {
      return {
        success: false,
        error: createServiceError(
          'PURCHASE_CANCELLED',
          'User cancelled the purchase',
        ),
        errorCode: 'PURCHASE_CANCELLED',
      };
    }
    const err = normalizeError(error);
    Sentry.captureException(err.underlyingError || new Error(err.message), {
      tags: {
        component: 'RevenueCatService',
        operation: 'purchasePackage',
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

export async function restorePurchases(
  deps: PurchaseServiceDeps,
): Promise<PurchaseResult> {
  if (!deps.isReady()) {
    return {
      success: false,
      error: createServiceError(
        'CONFIGURATION_ERROR',
        'RevenueCat not initialized',
      ),
    };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error) {
    const err = normalizeError(error);
    deps.reportError(
      'restorePurchases',
      err.underlyingError || new Error(err.message),
    );
    return { success: false, error: err, errorCode: err.code };
  }
}

export async function syncPurchases(
  deps: PurchaseServiceDeps,
): Promise<boolean> {
  if (!deps.isReady()) {return false;}
  try {
    await Purchases.syncPurchases();
    return true;
  } catch (error) {
    deps.reportError('syncPurchases', normalizeError(error));
    return false;
  }
}
