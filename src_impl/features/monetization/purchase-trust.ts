/**
 * Purchase Trust Utilities
 *
 * Handles secure purchase verification and trust signals.
 */

import { z } from "zod";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("monetization:purchase-trust");

// Purchase verification result
export interface PurchaseVerification {
  verified: boolean;
  transactionId: string;
  productId: string;
  tier: string;
  purchaseDate: number;
  expiryDate?: number;
  isTrial: boolean;
  platform: "ios" | "android" | "web";
}

// Trust signal types
export type TrustSignal = "secure_payment" | "money_back_guarantee" | "no_hidden_fees" | "cancel_anytime" | "encrypted_transaction" | "verified_reviews";

// Trust signal configuration
export interface TrustSignalConfig {
  id: TrustSignal;
  icon: string;
  title: string;
  description: string;
  priority: number;
}

// Trust signals for paywall
export const TRUST_SIGNALS: TrustSignalConfig[] = [
  {
    id: "secure_payment",
    icon: "shield-check",
    title: "Secure Payment",
    description: "256-bit SSL encryption",
    priority: 1,
  },
  {
    id: "cancel_anytime",
    icon: "x-circle",
    title: "Cancel Anytime",
    description: "No commitment required",
    priority: 2,
  },
  {
    id: "money_back_guarantee",
    icon: "refresh-cw",
    title: "7-Day Guarantee",
    description: "Full refund if not satisfied",
    priority: 3,
  },
  {
    id: "no_hidden_fees",
    icon: "eye",
    title: "No Hidden Fees",
    description: "What you see is what you pay",
    priority: 4,
  },
];

// Purchase receipt schema
export const PurchaseReceiptSchema = z.object({
  transactionId: z.string(),
  productId: z.string(),
  tier: z.enum(["plus", "pro", "elite"]),
  purchaseDate: z.number(),
  expiryDate: z.number().optional(),
  isTrial: z.boolean(),
  platform: z.enum(["ios", "android", "web"]),
  receiptData: z.string(),
});

export type PurchaseReceipt = z.infer<typeof PurchaseReceiptSchema>;

// Verify purchase receipt
export async function verifyPurchaseReceipt(receipt: PurchaseReceipt): Promise<PurchaseVerification> {
  // In production: validate with platform (Apple/Google) servers
  // const verification = await validateWithApple(receipt.receiptData);

  debug.info("Verifying purchase: %s", receipt.transactionId);

  // Mock verification
  const verification: PurchaseVerification = {
    verified: true,
    transactionId: receipt.transactionId,
    productId: receipt.productId,
    tier: receipt.tier,
    purchaseDate: receipt.purchaseDate,
    expiryDate: receipt.expiryDate,
    isTrial: receipt.isTrial,
    platform: receipt.platform,
  };

  return verification;
}

// Restore previous purchases
export async function restorePurchases(userId: string): Promise<PurchaseVerification[]> {
  debug.info("Restoring purchases for user: %s", userId);

  // In production: query platform for user's previous purchases
  // const purchases = await fetchRestoredPurchases(userId);

  return [];
}

// Check if purchase is still valid (not expired)
export function isPurchaseValid(purchase: PurchaseVerification): boolean {
  if (!purchase.expiryDate) {
    return true;
  }
  return purchase.expiryDate > Date.now();
}

// Get remaining days for subscription
export function getRemainingDays(purchase: PurchaseVerification): number {
  if (!purchase.expiryDate) {
    return Infinity;
  }
  const remaining = purchase.expiryDate - Date.now();
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}

// Format trust signals for display
export function getActiveTrustSignals(includeTrial: boolean, limit: number = 3): TrustSignalConfig[] {
  const signals = [...TRUST_SIGNALS];

  if (includeTrial) {
    signals.push({
      id: "verified_reviews",
      icon: "star",
      title: "Loved by Users",
      description: "4.9/5 from 10,000+ reviews",
      priority: 5,
    });
  }

  return signals.sort((a, b) => a.priority - b.priority).slice(0, limit);
}

// Calculate price display trust score
export function calculatePriceTrustScore(originalPrice: number, discountedPrice: number, hasTrial: boolean, hasGuarantee: boolean): number {
  let score = 50; // Base score

  // Discount transparency increases trust
  if (discountedPrice < originalPrice) {
    score += 15;
  }

  // Trial reduces risk
  if (hasTrial) {
    score += 20;
  }

  // Guarantee increases confidence
  if (hasGuarantee) {
    score += 15;
  }

  return Math.min(100, score);
}

// Generate price display explanation
export function getPriceExplanation(tier: string, price: number, period: "month" | "year", hasTrial: boolean): string {
  const dailyCost = price / 30;

  if (hasTrial) {
    return `Start free, then ${price}/${period}. That's just $${dailyCost.toFixed(2)}/day.`;
  }

  return `${price}/${period} = $${dailyCost.toFixed(2)}/day - less than a coffee.`;
}

// Verify purchase security hash
export function verifyPurchaseHash(transactionId: string, productId: string, timestamp: number, secretKey: string): string {
  // In production: use HMAC with server-side secret
  // return crypto.createHmac('sha256', secretKey).update(`${transactionId}:${productId}:${timestamp}`).digest('hex');

  // Mock hash
  return `hash-${transactionId}-${timestamp}`;
}

// Check for suspicious purchase patterns
export function isSuspiciousPurchase(purchase: PurchaseVerification, userHistory: { purchases: number; refunds: number }): boolean {
  // Flag if user has excessive refunds
  if (userHistory.refunds > 3) {
    return true;
  }

  // Flag if rapid multiple purchases
  if (userHistory.purchases > 5) {
    return true;
  }

  return false;
}

// Log purchase attempt for fraud detection
export async function logPurchaseAttempt(userId: string, tier: string, success: boolean, error?: string): Promise<void> {
  debug.info("Purchase attempt: user=%s tier=%s success=%s", userId, tier, success);

  if (error) {
    debug.error("Purchase error: %s", new Error(error));
  }

  // In production: log to fraud detection service
  // await fraudDetection.log({ userId, tier, success, error, timestamp: Date.now() });
}

// Get refund eligibility
export function getRefundEligibility(
  purchase: PurchaseVerification,
  daysSincePurchase: number,
): {
  eligible: boolean;
  reason: string;
  daysRemaining: number;
} {
  const REFUND_WINDOW_DAYS = 7;
  const daysRemaining = REFUND_WINDOW_DAYS - daysSincePurchase;

  if (daysSincePurchase <= REFUND_WINDOW_DAYS) {
    return {
      eligible: true,
      reason: "Within 7-day guarantee period",
      daysRemaining,
    };
  }

  return {
    eligible: false,
    reason: "Refund period expired",
    daysRemaining: 0,
  };
}
