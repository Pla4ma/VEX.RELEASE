import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Monetization Validation Utilities
 *
 * Purchase validation, receipt verification, subscription management.
 *
 * @phase 6 - Deepening: Monetization validation
 */

import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';

const debug = createDebugger('monetization:validation');

// ============================================================================
// Schemas
// ============================================================================

export const PurchaseSchema = z.object({
  productId: z.string(),
  userId: z.string(),
  transactionId: z.string(),
  receipt: z.string(),
  platform: z.enum(['ios', 'android', 'stripe']),
  price: z.number().positive(),
  currency: z.string().length(3),
  purchasedAt: z.number(),
});

export type Purchase = z.infer<typeof PurchaseSchema>;

// ============================================================================
// Validation Rules
// ============================================================================

const VALIDATION_RULES = {
  RECEIPT_EXPIRY_HOURS: 24,
  MAX_PURCHASES_PER_HOUR: 10,
  MAX_PURCHASE_AMOUNT_USD: 500,
  SUSPICIOUS_AMOUNT_THRESHOLD: 200,
} as const;

// ============================================================================
// Purchase Validation
// ============================================================================

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: ValidationError[];
  fraudRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Validate purchase transaction
 */
export function validatePurchase(
  purchase: Purchase,
  userHistory: {
    recentPurchases: Purchase[];
    totalSpent: number;
    firstPurchaseAt: number | null;
  }
): ValidationResult<Purchase> {
  const result: ValidationResult<Purchase> = {
    valid: true,
    errors: [],
    fraudRisk: 'NONE',
  };

  // Schema validation
  const schemaResult = PurchaseSchema.safeParse(purchase);
  if (!schemaResult.success) {
    result.valid = false;
    result.errors.push({
      field: 'purchase',
      message: 'Invalid purchase structure',
      code: 'INVALID_STRUCTURE',
      severity: 'CRITICAL',
    });
    result.fraudRisk = 'HIGH';
    return result;
  }

  result.data = schemaResult.data;

  // Check 1: Duplicate transaction
  const isDuplicate = userHistory.recentPurchases.some(
    p => p.transactionId === purchase.transactionId
  );
  if (isDuplicate) {
    result.errors.push({
      field: 'transactionId',
      message: 'Duplicate transaction detected',
      code: 'DUPLICATE_TRANSACTION',
      severity: 'HIGH',
    });
    result.fraudRisk = 'HIGH';
  }

  // Check 2: Receipt timestamp
  const receiptAge = Date.now() - purchase.purchasedAt;
  if (receiptAge > VALIDATION_RULES.RECEIPT_EXPIRY_HOURS * 60 * 60 * 1000) {
    result.errors.push({
      field: 'purchasedAt',
      message: `Receipt expired (${Math.floor(receiptAge / (60 * 60 * 1000))} hours old)`,
      code: 'RECEIPT_EXPIRED',
      severity: 'HIGH',
    });
    result.fraudRisk = 'MEDIUM';
  }

  // Check 3: Rate limiting (purchases per hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentCount = userHistory.recentPurchases.filter(
    p => p.purchasedAt > oneHourAgo
  ).length;

  if (recentCount >= VALIDATION_RULES.MAX_PURCHASES_PER_HOUR) {
    result.errors.push({
      field: 'rate',
      message: `Too many purchases (${recentCount} in last hour)`,
      code: 'RATE_LIMIT_EXCEEDED',
      severity: 'MEDIUM',
    });
    result.fraudRisk = 'MEDIUM';
  }

  // Check 4: Amount validation
  if (purchase.price > VALIDATION_RULES.MAX_PURCHASE_AMOUNT_USD) {
    result.errors.push({
      field: 'price',
      message: `Amount exceeds maximum $${VALIDATION_RULES.MAX_PURCHASE_AMOUNT_USD}`,
      code: 'AMOUNT_TOO_HIGH',
      severity: 'HIGH',
    });
    result.fraudRisk = 'HIGH';
  }

  if (purchase.price > VALIDATION_RULES.SUSPICIOUS_AMOUNT_THRESHOLD) {
    result.fraudRisk = 'MEDIUM';
  }

  // Check 5: Velocity check (rapid successive purchases)
  if (userHistory.recentPurchases.length > 0) {
    const lastPurchase = userHistory.recentPurchases[userHistory.recentPurchases.length - 1];
    const timeSinceLast = purchase.purchasedAt - lastPurchase.purchasedAt;

    if (timeSinceLast < 10000) { // Less than 10 seconds
      result.errors.push({
        field: 'velocity',
        message: 'Purchases too rapid',
        code: 'VELOCITY_ANOMALY',
        severity: 'MEDIUM',
      });
      result.fraudRisk = 'MEDIUM';
    }
  }

  // Check 6: First purchase timing
  if (userHistory.firstPurchaseAt) {
    const accountAge = Date.now() - userHistory.firstPurchaseAt;
    const accountAgeDays = accountAge / (24 * 60 * 60 * 1000);

    if (accountAgeDays < 1 && purchase.price > 50) {
      result.errors.push({
        field: 'accountAge',
        message: 'Large purchase on first day',
        code: 'FIRST_DAY_LARGE_PURCHASE',
        severity: 'LOW',
      });
      result.fraudRisk = 'LOW';
    }
  }

  // Finalize
  if (result.errors.some(e => e.severity === 'CRITICAL' || e.severity === 'HIGH')) {
    result.valid = false;
  }

  // Track fraud risk
  if (result.fraudRisk !== 'NONE') {
    eventBus.publish('analytics:track', {
      event: 'purchase_fraud_risk',
      properties: {
        userId: purchase.userId,
        productId: purchase.productId,
        fraudRisk: result.fraudRisk,
        errorCount: result.errors.length,
      },
    });
  }

  debug.info('Purchase validated', {
    productId: purchase.productId,
    valid: result.valid,
    fraudRisk: result.fraudRisk,
  });

  return result;
}

// ============================================================================
// Subscription Validation
// ============================================================================

export interface Subscription {
  userId: string;
  subscriptionId: string;
  productId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startedAt: number;
  expiresAt: number;
  autoRenew: boolean;
  platform: 'ios' | 'android' | 'stripe';
}

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

// ============================================================================
// Receipt Verification Helpers
// ============================================================================

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

// ============================================================================
// Export
// ============================================================================

export const MonetizationValidation = {
  validatePurchase,
  validateSubscription,
  verifyReceiptSignature,
  parseReceipt,
  VALIDATION_RULES,
  PurchaseSchema,
};

export default MonetizationValidation;
