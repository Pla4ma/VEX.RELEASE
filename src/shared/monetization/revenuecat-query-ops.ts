import type { MutableRefObject } from 'react';
import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { revenueCatService } from './revenuecat-service';
import { getCustomerInfo, getOfferings } from './revenuecat-exports';
import type {
  EntitlementInfo,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
} from './revenuecat-types';
import {
  PurchaseEvents,
  createOfferingProperties,
} from './purchase-events';
import { hasPremiumEntitlement } from './entitlements';
import { capture, type PurchaseEvent } from '../analytics/analytics-service';
import { buildError, mapOfferingToDisplayInfo } from './revenuecat-helpers';

export interface OfferingsOps {
  setIsLoading: (v: boolean) => void;
  setOfferings: (v: PurchasesOfferingDisplayInfo | null) => void;
  setPackages: (v: PurchasesPackageDisplayInfo[]) => void;
  setError: (v: RevenueCatError | null) => void;
  rawOfferingRef: MutableRefObject<PurchasesOffering | null>;
}

export interface CustomerOps {
  setIsLoading: (v: boolean) => void;
  setCustomerInfo: (v: CustomerInfo | null) => void;
  setEntitlements: (v: EntitlementInfo[]) => void;
  setIsPremium: (v: boolean) => void;
  setError: (v: RevenueCatError | null) => void;
}

export async function refreshOfferings(ctx: OfferingsOps): Promise<void> {
  if (!revenueCatService.isReady()) {
    const error = buildError('CONFIGURATION_ERROR', 'RevenueCat is not ready');
    ctx.setOfferings(null);
    ctx.setPackages([]);
    ctx.setError(error);
    return;
  }
  ctx.setIsLoading(true);
  ctx.setError(null);
  try {
    const result = await getOfferings();
    if (!result.success || !result.currentOffering) {
      ctx.rawOfferingRef.current = null;
      ctx.setOfferings(null);
      ctx.setPackages([]);
      const error = result.error
        ? buildError('OFFERINGS_NOT_LOADED', result.error.message)
        : buildError('EMPTY_OFFERINGS', 'No active offerings found');
      ctx.setError(error);
      capture(PurchaseEvents.OFFERING_EMPTY as PurchaseEvent, {
        error_code: error.code,
      });
      return;
    }
    ctx.rawOfferingRef.current = result.currentOffering;
    const displayOffering = mapOfferingToDisplayInfo(result.currentOffering);
    ctx.setOfferings(displayOffering);
    ctx.setPackages(displayOffering.packages);
    capture(
      PurchaseEvents.OFFERING_LOADED as PurchaseEvent,
      createOfferingProperties(
        displayOffering.identifier,
        displayOffering.packages.map((item) => ({
          packageType: item.packageType,
        })),
      ),
    );
  } catch (error) {
    const rcError = buildError(
      'OFFERINGS_NOT_LOADED',
      error instanceof Error ? error.message : 'Failed to load offerings',
    );
    ctx.setOfferings(null);
    ctx.setPackages([]);
    ctx.setError(rcError);
    capture(PurchaseEvents.OFFERING_LOAD_FAILED as PurchaseEvent, {
      error_code: rcError.code,
      error_message: rcError.message,
    });
  } finally {
    ctx.setIsLoading(false);
  }
}

export async function refreshCustomer(ctx: CustomerOps): Promise<void> {
  if (!revenueCatService.isReady()) {
    const error = buildError('CONFIGURATION_ERROR', 'RevenueCat is not ready');
    ctx.setError(error);
    return;
  }
  ctx.setIsLoading(true);
  ctx.setError(null);
  try {
    const result = await getCustomerInfo();
    if (!result.success) {
      const error = buildError(
        'CONFIGURATION_ERROR',
        result.error?.message ?? 'Failed to load customer info',
      );
      ctx.setCustomerInfo(null);
      ctx.setEntitlements([]);
      ctx.setIsPremium(false);
      ctx.setError(error);
      return;
    }
    ctx.setCustomerInfo(result.customerInfo ?? null);
    ctx.setEntitlements(result.entitlements);
    ctx.setIsPremium(hasPremiumEntitlement(result.entitlements));
  } catch (error) {
    const rcError = buildError(
      'CONFIGURATION_ERROR',
      error instanceof Error ? error.message : 'Failed to load customer info',
    );
    ctx.setCustomerInfo(null);
    ctx.setEntitlements([]);
    ctx.setIsPremium(false);
    ctx.setError(rcError);
  } finally {
    ctx.setIsLoading(false);
  }
}
