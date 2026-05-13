import { z } from "zod";
import { createDebugger } from "../../utils/debug";


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
      reason: 'Within 7-day guarantee period',
      daysRemaining,
    };
  }

  return {
    eligible: false,
    reason: 'Refund period expired',
    daysRemaining: 0,
  };
}