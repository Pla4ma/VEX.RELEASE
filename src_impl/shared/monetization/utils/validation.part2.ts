import { captureSilentFailure } from "../../../utils/silent-failure";
import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


export function validateSubscription(
  subscription: Subscription,
  userHistory: {
    previousSubscriptions: Subscription[];
    totalRefunds: number;
  }
): ValidationResult<Subscription> {
  const result: ValidationResult<Subscription> = {
    valid: true,
    errors: [],
    fraudRisk: 'NONE',
  };

  // Check 1: Overlapping subscriptions
  const hasActive = userHistory.previousSubscriptions.some(
    s => s.status === 'active' && s.subscriptionId !== subscription.subscriptionId
  );
  if (hasActive && subscription.status === 'active') {
    result.errors.push({
      field: 'subscriptionId',
      message: 'User already has active subscription',
      code: 'OVERLAPPING_SUBSCRIPTION',
      severity: 'MEDIUM',
    });
  }

  // Check 2: Refund abuse
  if (userHistory.totalRefunds > 3) {
    result.errors.push({
      field: 'refundHistory',
      message: `User has ${userHistory.totalRefunds} refunds`,
      code: 'HIGH_REFUND_HISTORY',
      severity: 'LOW',
    });
    result.fraudRisk = 'LOW';
  }

  // Check 3: Expiry consistency
  if (subscription.expiresAt < subscription.startedAt) {
    result.errors.push({
      field: 'expiresAt',
      message: 'Expiry before start date',
      code: 'INVALID_DATES',
      severity: 'HIGH',
    });
    result.fraudRisk = 'HIGH';
    result.valid = false;
  }

  // Check 4: Platform consistency
  const previousPlatforms = new Set(userHistory.previousSubscriptions.map(s => s.platform));
  if (previousPlatforms.size > 1 && !previousPlatforms.has(subscription.platform)) {
    result.errors.push({
      field: 'platform',
      message: 'Subscription platform mismatch',
      code: 'PLATFORM_INCONSISTENCY',
      severity: 'LOW',
    });
  }

  return result;
}

export function verifyReceiptSignature(receipt: string, platform: string): boolean {
  // In production, this would verify against Apple/Google/stripe
  // For now, basic structure check

  if (platform === 'ios') {
    // Base64 check
    return /^[A-Za-z0-9+/=]+$/.test(receipt) && receipt.length > 100;
  }

  if (platform === 'android') {
    // JSON structure check
    try {
      const parsed = JSON.parse(receipt);
      return !!(parsed.orderId && parsed.purchaseToken);
    } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'safe-fallback', type: 'data' });
      return false;
    }
  }

  if (platform === 'stripe') {
    // Stripe receipt IDs start with specific prefixes
    return /^pi_[a-zA-Z0-9]{24,}$/.test(receipt);
  }

  return false;
}

export function parseReceipt(receipt: string, platform: string): Record<string, unknown> | null {
  try {
    if (platform === 'android' || platform === 'stripe') {
      return JSON.parse(receipt);
    }
    // iOS receipts are base64 encoded
    if (platform === 'ios') {
      // Would decode in production
      return { raw: receipt };
    }
  } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'safe-fallback', type: 'data' });
    return null;
  }
  return null;
}

export const MonetizationValidation = {
  validatePurchase,
  validateSubscription,
  verifyReceiptSignature,
  parseReceipt,
  VALIDATION_RULES,
  PurchaseSchema,
};