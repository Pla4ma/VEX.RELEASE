import type {
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import type {
  PurchasesOfferingDisplayInfo,
  PurchasesPackageDisplayInfo,
  RevenueCatError,
} from './revenuecat-types';

export function buildError(
  code: RevenueCatError['code'],
  message: string,
): RevenueCatError {
  const error = new Error(message) as RevenueCatError;
  error.name = 'RevenueCatError';
  error.code = code;
  return error;
}

function mapPackage(
  pkg: PurchasesPackage | null,
): PurchasesPackageDisplayInfo | null {
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
}

export function mapOfferingToDisplayInfo(
  offering: PurchasesOffering,
): PurchasesOfferingDisplayInfo {
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
