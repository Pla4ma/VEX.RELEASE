import * as Sentry from '@sentry/react-native';
import type { CustomerInfo } from '../../shared/monetization/revenuecat-types';
import {
  initializeRevenueCat,
  restorePurchases as restoreRevenueCatPurchases,
} from '../../shared/monetization/revenuecat-facade';
import { createDebugger } from '../../utils/debug';
import {
  PurchaseTrustError,
  TRUST_SIGNALS,
  type PurchaseReceipt,
  type PurchaseVerification,
  type TrustSignalConfig,
} from './purchase-trust-types';

export {
  PurchaseReceiptSchema,
  PurchaseVerificationSchema,
  PurchaseTrustError,
  TRUST_SIGNALS,
  type PurchaseReceipt,
  type PurchaseVerification,
  type TrustSignal,
  type TrustSignalConfig,
} from './purchase-trust-types';

const debug = createDebugger('monetization:purchase-trust');

export async function verifyPurchaseReceipt(
  receipt: PurchaseReceipt,
): Promise<PurchaseVerification> {
  debug.info('Rejected raw receipt verification: %s', receipt.transactionId);

  return {
    verified: false,
    transactionId: receipt.transactionId,
    productId: receipt.productId,
    tier: receipt.tier,
    purchaseDate: receipt.purchaseDate,
    expiryDate: receipt.expiryDate,
    isTrial: receipt.isTrial,
    platform: receipt.platform,
    errorReason: 'Raw client receipts must be verified by RevenueCat.',
  };
}

export async function restorePurchases(
  userId: string,
): Promise<PurchaseVerification[]> {
  const init = await initializeRevenueCat(userId);
  if (init.status !== 'ready') {
    throw new PurchaseTrustError(
      `RevenueCat restore unavailable: ${init.status}`,
    );
  }

  const result = await restoreRevenueCatPurchases();
  if (!result.success || !result.customerInfo) {
    const message = result.error?.message ?? 'RevenueCat restore failed.';
    Sentry.captureException(result.error ?? new PurchaseTrustError(message), {
      tags: { component: 'purchase-trust', operation: 'restorePurchases' },
      extra: { userId, errorCode: result.errorCode },
    });
    throw new PurchaseTrustError(message);
  }

  return mapCustomerInfoToVerifications(result.customerInfo);
}

export function isPurchaseValid(purchase: PurchaseVerification): boolean {
  if (!purchase.verified) {
    return false;
  }
  if (!purchase.expiryDate) {
    return true;
  }
  return purchase.expiryDate > Date.now();
}

export function getRemainingDays(purchase: PurchaseVerification): number {
  if (!purchase.expiryDate) {
    return Infinity;
  }
  return Math.ceil((purchase.expiryDate - Date.now()) / (24 * 60 * 60 * 1000));
}

export function getActiveTrustSignals(
  includeTrial: boolean,
  limit: number = 3,
): TrustSignalConfig[] {
  const signals = [...TRUST_SIGNALS];
  if (includeTrial) {
    signals.push({
      id: 'verified_reviews',
      icon: 'star',
      title: 'Loved by Users',
      description: 'User feedback is verified before publication.',
      priority: 5,
    });
  }
  return signals.sort((a, b) => a.priority - b.priority).slice(0, limit);
}

export function calculatePriceTrustScore(
  originalPrice: number,
  discountedPrice: number,
  hasTrial: boolean,
  hasGuarantee: boolean,
): number {
  let score = 50;
  if (discountedPrice < originalPrice) {score += 15;}
  if (hasTrial) {score += 20;}
  if (hasGuarantee) {score += 15;}
  return Math.min(100, score);
}

export function getPriceExplanation(
  tier: string,
  price: number,
  period: 'month' | 'year',
  hasTrial: boolean,
): string {
  const dailyCost = price / 30;
  if (hasTrial) {
    return `Start free, then ${price}/${period}. That's just $${dailyCost.toFixed(2)}/day.`;
  }
  return `${tier} is ${price}/${period}, about $${dailyCost.toFixed(2)}/day.`;
}

export function verifyPurchaseHash(): string {
  throw new PurchaseTrustError(
    'Client-side purchase hash verification is unsupported.',
  );
}

export function isSuspiciousPurchase(
  purchase: PurchaseVerification,
  userHistory: { purchases: number; refunds: number },
): boolean {
  return (
    !purchase.verified || userHistory.refunds > 3 || userHistory.purchases > 5
  );
}

export async function logPurchaseAttempt(
  userId: string,
  tier: string,
  success: boolean,
  error?: string,
): Promise<void> {
  debug.info(
    'Purchase attempt: user=%s tier=%s success=%s',
    userId,
    tier,
    success,
  );
  if (error) {debug.error('Purchase error: %s', new Error(error));}
}

export function getRefundEligibility(
  purchase: PurchaseVerification,
  daysSincePurchase: number,
): { eligible: boolean; reason: string; daysRemaining: number } {
  const refundWindowDays = 7;
  const daysRemaining = refundWindowDays - daysSincePurchase;
  if (purchase.verified && daysSincePurchase <= refundWindowDays) {
    return {
      eligible: true,
      reason: 'Within 7-day guarantee period',
      daysRemaining,
    };
  }
  return {
    eligible: false,
    reason: 'Refund period expired or purchase unverified',
    daysRemaining: 0,
  };
}

function mapCustomerInfoToVerifications(
  customerInfo: CustomerInfo,
): PurchaseVerification[] {
  return Object.values(customerInfo.entitlements.active).map((entitlement) => ({
    verified: entitlement.isActive,
    transactionId: entitlement.originalPurchaseDate,
    productId: entitlement.productIdentifier,
    tier: entitlement.identifier === 'premium' ? 'premium' : 'plus',
    purchaseDate: Date.parse(entitlement.latestPurchaseDate),
    expiryDate: entitlement.expirationDate
      ? Date.parse(entitlement.expirationDate)
      : undefined,
    isTrial: entitlement.periodType === 'TRIAL',
    platform: entitlement.store === 'PLAY_STORE' ? 'android' : 'ios',
  }));
}
