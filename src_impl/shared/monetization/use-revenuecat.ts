import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import {
  getCustomerInfo,
  getOfferings,
  restorePurchases as restoreRevenueCatPurchases,
  revenueCatService,
} from './revenuecat-service';
import type {
  EntitlementInfo,
  PurchaseResult,
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
  UseRevenueCatState,
} from './revenuecat-types';
import {
  PurchaseEvents,
  createOfferingProperties,
  createPurchaseProperties,
} from './purchase-events';
import { hasPremiumEntitlement } from './entitlements';
import { capture, type PurchaseEvent } from '../analytics';

function buildError(code: RevenueCatError['code'], message: string): RevenueCatError {
  const error = new Error(message) as RevenueCatError;
  error.name = 'RevenueCatError';
  error.code = code;
  return error;
}

function mapOfferingToDisplayInfo(offering: PurchasesOffering): PurchasesOfferingDisplayInfo {
  const mapPackage = (
    pkg: PurchasesPackage | null
  ): PurchasesPackageDisplayInfo | null => {
    if (!pkg) {
      return null;
    }

    return {
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      product: {
        identifier: pkg.product.identifier,
        description: pkg.product.description,
        title: pkg.product.title,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
        introPrice: pkg.product.introPrice
          ? {
              price: pkg.product.introPrice.price,
              priceString: pkg.product.introPrice.priceString,
              period: pkg.product.introPrice.period,
              cycles: pkg.product.introPrice.cycles,
              periodUnit: pkg.product.introPrice.periodUnit,
              periodNumberOfUnits: pkg.product.introPrice.periodNumberOfUnits,
            }
          : null,
        discounts: pkg.product.discounts?.map((discount) => ({
          identifier: discount.identifier,
          price: discount.price,
          priceString: discount.priceString,
          cycles: discount.cycles,
          period: discount.period,
          periodUnit: discount.periodUnit,
          periodNumberOfUnits: discount.periodNumberOfUnits,
        })),
      },
    };
  };

  const packages = offering.availablePackages
    .map((item) => mapPackage(item))
    .filter((item): item is PurchasesPackageDisplayInfo => Boolean(item));

  return {
    identifier: offering.identifier,
    serverDescription: offering.serverDescription,
    metadata: offering.metadata,
    packages,
    lifetime: mapPackage(offering.lifetime),
    annual: mapPackage(offering.annual),
    sixMonth: mapPackage(offering.sixMonth),
    threeMonth: mapPackage(offering.threeMonth),
    twoMonth: mapPackage(offering.twoMonth),
    monthly: mapPackage(offering.monthly),
    weekly: mapPackage(offering.weekly),
  };
}

export type {
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  PurchaseResult,
};
export * from "./use-revenuecat.part1";
export * from "./use-revenuecat.part2";
