import type { ValidationResult } from "./purchase-validation";

export interface Subscription {
  userId: string;
  subscriptionId: string;
  productId: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startedAt: number;
  expiresAt: number;
  autoRenew: boolean;
  platform: "ios" | "android" | "stripe";
}

export function validateSubscription(
  subscription: Subscription,
  userHistory: { previousSubscriptions: Subscription[]; totalRefunds: number },
): ValidationResult<Subscription> {
  const result: ValidationResult<Subscription> = {
    valid: true,
    errors: [],
    fraudRisk: "NONE",
  };
  const hasActive = userHistory.previousSubscriptions.some(
    (s) =>
      s.status === "active" && s.subscriptionId !== subscription.subscriptionId,
  );
  if (hasActive && subscription.status === "active") {
    result.errors.push({
      field: "subscriptionId",
      message: "User already has active subscription",
      code: "OVERLAPPING_SUBSCRIPTION",
      severity: "MEDIUM",
    });
  }
  if (userHistory.totalRefunds > 3) {
    result.errors.push({
      field: "refundHistory",
      message: `User has ${userHistory.totalRefunds} refunds`,
      code: "HIGH_REFUND_HISTORY",
      severity: "LOW",
    });
    result.fraudRisk = "LOW";
  }
  if (subscription.expiresAt < subscription.startedAt) {
    result.errors.push({
      field: "expiresAt",
      message: "Expiry before start date",
      code: "INVALID_DATES",
      severity: "HIGH",
    });
    result.fraudRisk = "HIGH";
    result.valid = false;
  }
  const previousPlatforms = new Set(
    userHistory.previousSubscriptions.map((s) => s.platform),
  );
  if (
    previousPlatforms.size > 1 &&
    !previousPlatforms.has(subscription.platform)
  ) {
    result.errors.push({
      field: "platform",
      message: "Subscription platform mismatch",
      code: "PLATFORM_INCONSISTENCY",
      severity: "LOW",
    });
  }
  return result;
}
