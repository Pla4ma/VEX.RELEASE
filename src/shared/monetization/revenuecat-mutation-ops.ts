import type { MutableRefObject } from 'react';
import type { PurchasesOffering } from 'react-native-purchases';
import { revenueCatService } from './revenuecat-service';
import { restorePurchases as restoreRevenueCatPurchases } from './revenuecat-exports';
import type {
  PurchaseResult,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
  UseRevenueCatState,
} from './revenuecat-types';
import {
  PurchaseEvents,
  createPurchaseProperties,
} from './purchase-events';
import { capture, type PurchaseEvent } from '../analytics/analytics-service';
import { buildError } from './revenuecat-helpers';

export interface PurchaseOps {
  setIsPurchasing: (v: boolean) => void;
  setPurchaseError: (v: RevenueCatError | null) => void;
  rawOfferingRef: MutableRefObject<PurchasesOffering | null>;
  offerings: PurchasesOfferingDisplayInfo | null;
  refreshCustomer: () => Promise<void>;
}

export interface RestoreOps {
  setIsRestoring: (v: boolean) => void;
  setPurchaseError: (v: RevenueCatError | null) => void;
  entitlementCount: number;
  refreshCustomer: () => Promise<void>;
}

export interface RetryOps {
  clearErrors: () => void;
  setStatus: (v: UseRevenueCatState['status']) => void;
  setIsReady: (v: boolean) => void;
  refreshOfferings: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

export async function executePurchase(
  ctx: PurchaseOps,
  packageInfo: PurchasesPackageDisplayInfo,
): Promise<PurchaseResult> {
  if (!revenueCatService.isReady()) {
    const error = buildError('CONFIGURATION_ERROR', 'RevenueCat is not ready');
    ctx.setPurchaseError(error);
    return { success: false, error, errorCode: error.code };
  }
  const rawPackage = ctx.rawOfferingRef.current?.availablePackages.find(
    (item) => item.identifier === packageInfo.identifier,
  );
  if (!rawPackage) {
    const error = buildError(
      'PRODUCT_NOT_AVAILABLE',
      'Package not found in active offering',
    );
    ctx.setPurchaseError(error);
    return { success: false, error, errorCode: error.code };
  }
  ctx.setIsPurchasing(true);
  ctx.setPurchaseError(null);
  capture(
    PurchaseEvents.PURCHASE_STARTED as PurchaseEvent,
    createPurchaseProperties({
      packageId: packageInfo.identifier,
      offeringId: ctx.offerings?.identifier ?? 'unknown',
      productId: packageInfo.product.identifier,
      price: packageInfo.product.price,
      currency: packageInfo.product.currencyCode,
      isRestore: false,
      introPrice: packageInfo.product.introPrice?.price,
      success: false,
    }),
  );
  try {
    const result = await revenueCatService.purchasePackage(rawPackage);
    if (result.success) {
      await ctx.refreshCustomer();
      capture(
        PurchaseEvents.PURCHASE_COMPLETED as PurchaseEvent,
        createPurchaseProperties({
          packageId: packageInfo.identifier,
          offeringId: ctx.offerings?.identifier ?? 'unknown',
          productId: packageInfo.product.identifier,
          price: packageInfo.product.price,
          currency: packageInfo.product.currencyCode,
          isRestore: false,
          introPrice: packageInfo.product.introPrice?.price,
          success: true,
        }),
      );
      return result;
    }
    const error = buildError(
      (result.errorCode as RevenueCatError['code']) ?? 'UNKNOWN',
      result.error?.message ?? 'Purchase failed',
    );
    ctx.setPurchaseError(error);
    capture(
      result.errorCode === 'PURCHASE_CANCELLED'
        ? (PurchaseEvents.PURCHASE_CANCELLED as PurchaseEvent)
        : (PurchaseEvents.PURCHASE_FAILED as PurchaseEvent),
      createPurchaseProperties({
        packageId: packageInfo.identifier,
        offeringId: ctx.offerings?.identifier ?? 'unknown',
        productId: packageInfo.product.identifier,
        price: packageInfo.product.price,
        currency: packageInfo.product.currencyCode,
        isRestore: false,
        introPrice: packageInfo.product.introPrice?.price,
        success: false,
        errorCode: error.code,
        errorMessage: error.message,
      }),
    );
    return { success: false, error, errorCode: error.code };
  } catch (error) {
    const rcError = buildError(
      'UNKNOWN',
      error instanceof Error ? error.message : 'Purchase failed',
    );
    ctx.setPurchaseError(rcError);
    capture(PurchaseEvents.PURCHASE_FAILED as PurchaseEvent, {
      package_id: packageInfo.identifier,
      error_code: rcError.code,
      error_message: rcError.message,
    });
    return { success: false, error: rcError, errorCode: rcError.code };
  } finally {
    ctx.setIsPurchasing(false);
  }
}

export async function executeRestore(ctx: RestoreOps): Promise<PurchaseResult> {
  if (!revenueCatService.isReady()) {
    const error = buildError('CONFIGURATION_ERROR', 'RevenueCat is not ready');
    ctx.setPurchaseError(error);
    return { success: false, error, errorCode: error.code };
  }
  ctx.setIsRestoring(true);
  ctx.setPurchaseError(null);
  capture(PurchaseEvents.RESTORE_STARTED as PurchaseEvent, {});
  try {
    const result = await restoreRevenueCatPurchases();
    if (result.success) {
      await ctx.refreshCustomer();
      capture(PurchaseEvents.RESTORE_COMPLETED as PurchaseEvent, {
        found_entitlements: ctx.entitlementCount > 0,
        entitlement_count: ctx.entitlementCount,
        success: true,
      });
      return result;
    }
    const error = buildError(
      (result.errorCode as RevenueCatError['code']) ?? 'UNKNOWN',
      result.error?.message ?? 'Restore failed',
    );
    ctx.setPurchaseError(error);
    capture(PurchaseEvents.RESTORE_FAILED as PurchaseEvent, {
      success: false,
      error_code: error.code,
      error_message: error.message,
    });
    return { success: false, error, errorCode: error.code };
  } catch (error) {
    const rcError = buildError(
      'UNKNOWN',
      error instanceof Error ? error.message : 'Restore failed',
    );
    ctx.setPurchaseError(rcError);
    capture(PurchaseEvents.RESTORE_FAILED as PurchaseEvent, {
      success: false,
      error_code: rcError.code,
      error_message: rcError.message,
    });
    return { success: false, error: rcError, errorCode: rcError.code };
  } finally {
    ctx.setIsRestoring(false);
  }
}

export async function executeRetry(ctx: RetryOps): Promise<void> {
  ctx.clearErrors();
  if (!revenueCatService.isReady()) {
    const initResult = await revenueCatService.initialize();
    ctx.setStatus(initResult.status);
    ctx.setIsReady(initResult.status === 'ready' && revenueCatService.isReady());
  }
  await Promise.all([ctx.refreshOfferings(), ctx.refreshCustomer()]);
}
