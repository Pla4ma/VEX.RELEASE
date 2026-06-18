
import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events/EventBus';

const debug = createDebugger('monetization:validation');

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

export const VALIDATION_RULES = {
  RECEIPT_EXPIRY_HOURS: 24,
  MAX_PURCHASES_PER_HOUR: 10,
  MAX_PURCHASE_AMOUNT_USD: 500,
  SUSPICIOUS_AMOUNT_THRESHOLD: 200,
} as const;

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

export function validatePurchase(
  purchase: Purchase,
  userHistory: {
    recentPurchases: Purchase[];
    totalSpent: number;
    firstPurchaseAt: number | null;
  },
): ValidationResult<Purchase> {
  const result: ValidationResult<Purchase> = {
    valid: true,
    errors: [],
    fraudRisk: 'NONE',
  };
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
  const isDuplicate = userHistory.recentPurchases.some(
    (p) => p.transactionId === purchase.transactionId,
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
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentCount = userHistory.recentPurchases.filter(
    (p) => p.purchasedAt > oneHourAgo,
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
  if (userHistory.recentPurchases.length > 0) {
    const lastPurchase =
      userHistory.recentPurchases[userHistory.recentPurchases.length - 1];
    const timeSinceLast = purchase.purchasedAt - (lastPurchase?.purchasedAt ?? 0);
    if (timeSinceLast < 10000) {
      result.errors.push({
        field: 'velocity',
        message: 'Purchases too rapid',
        code: 'VELOCITY_ANOMALY',
        severity: 'MEDIUM',
      });
      result.fraudRisk = 'MEDIUM';
    }
  }
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
  if (
    result.errors.some(
      (e) => e.severity === 'CRITICAL' || e.severity === 'HIGH',
    )
  ) {
    result.valid = false;
  }
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
