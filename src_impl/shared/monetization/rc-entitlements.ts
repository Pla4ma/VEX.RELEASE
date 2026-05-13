import { type CustomerInfo } from 'react-native-purchases';
import { createDebugger } from '../../utils/debug';
import type { EntitlementInfo } from './revenuecat-types';

const debug = createDebugger('monetization:revenuecat');

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
    })
  );
}

export function handleCustomerInfoUpdate(
  customerInfo: CustomerInfo,
  debugMode: boolean
): void {
  if (debugMode) {
    debug.debug(
      '[RevenueCat] Customer info updated:',
      Object.keys(customerInfo.entitlements.active)
    );
  }
}
