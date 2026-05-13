/**
 * RevenueCat Purchase Helpers
 * Standalone functions for offer retrievals, purchases, and entitlement mapping.
 */

import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import * as Sentry from '@sentry/react-native';
import { createDebugger } from '../../utils/debug';
import { normalizeError, createError, isUserCancelled } from './rc-errors';
import { mapEntitlements } from './rc-entitlements';
import type { CustomerInfoResult, OfferingsResult, PurchaseResult } from './revenuecat-types';

const debug = createDebugger('monetization:revenuecat');

// ============================================================================
// RCContext - service state needed by helpers
// ============================================================================

export interface RCContext {
  isReady: () => boolean;
  debugMode: boolean;
}

// ============================================================================
// Customer Info
// ============================================================================

export async function getCustomerInfo(
  ctx: RCContext
): Promise<CustomerInfoResult> {
  if (!ctx.isReady()) {
    return {
      success: false,
      entitlements: [],
      error: createError('CONFIGURATION_ERROR', 'RevenueCat not initialized'),
    };
  }
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return {
      success: true,
      customerInfo,
      entitlements: mapEntitlements(customerInfo),
    };
  } catch (error) {
    const err = normalizeError(error);
    debug.error('[RevenueCat] Get customer info failed', err);
    Sentry.captureException(err.underlyingError || new Error(err.message), {
      tags: { component: 'RevenueCatService', operation: 'getCustomerInfo' },
    });
    return { success: false, entitlements: [], error: err };
  }
}

// ============================================================================
// Offerings
// ============================================================================

export async function getOfferings(
  ctx: RCContext
): Promise<OfferingsResult> {
  if (!ctx.isReady()) {
    return {
      success: false,
      currentOffering: null,
      error: createError('CONFIGURATION_ERROR', 'RevenueCat not initialized'),
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
    const err = normalizeError(error);
    debug.error('[RevenueCat] Get offerings failed', err);
    Sentry.captureException(err.underlyingError || new Error(err.message), {
      tags: { component: 'RevenueCatService', operation: 'getOfferings' },
    });
    return { success: false, error: err };
  }
}

// ============================================================================
// Purchase
// ============================================================================

export async function purchasePackage(
  ctx: RCContext,
  pkg: PurchasesPackage
): Promise<PurchaseResult> {
  if (!ctx.isReady()) {
    return {
      success: false,
      error: createError('CONFIGURATION_ERROR', 'RevenueCat not initialized'),
    };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error) {
    if (isUserCancelled(error)) {
      return {
        success: false,
        error: createError('PURCHASE_CANCELLED', 'User cancelled the purchase'),
        errorCode: 'PURCHASE_CANCELLED',
      };
    }
    const err = normalizeError(error);
    debug.error('[RevenueCat] Purchase failed', err);
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

// ============================================================================
// Restore
// ============================================================================

export async function restorePurchases(
  ctx: RCContext
): Promise<PurchaseResult> {
  if (!ctx.isReady()) {
    return {
      success: false,
      error: createError('CONFIGURATION_ERROR', 'RevenueCat not initialized'),
    };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error) {
    const err = normalizeError(error);
    debug.error('[RevenueCat] Restore failed', err);
    Sentry.captureException(err.underlyingError || new Error(err.message), {
      tags: { component: 'RevenueCatService', operation: 'restorePurchases' },
    });
    return { success: false, error: err, errorCode: err.code };
  }
}

// ============================================================================
// Sync
// ============================================================================

export async function syncPurchases(ctx: RCContext): Promise<boolean> {
  if (!ctx.isReady()) {
    return false;
  }
  try {
    await Purchases.syncPurchases();
    return true;
  } catch (error) {
    const err = normalizeError(error);
    debug.error('[RevenueCat] Sync purchases failed', err);
    return false;
  }
}


