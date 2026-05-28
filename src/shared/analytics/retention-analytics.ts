import { capture } from "./index";

export interface Cohort {
  id: string;
  startDate: string;
  size: number;
  retention: { day1: number; day7: number; day30: number; day90: number };
  ltv: number;
}

export interface RetentionData {
  cohorts: Cohort[];
  averageRetention: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };
}

export function calculateCohortRetention(
  cohortUsers: string[],
  activeUsersByDay: Map<string, Set<string>>,
): Cohort["retention"] {
  if (cohortUsers.length === 0) {
    return { day1: 0, day7: 0, day30: 0, day90: 0 };
  }
  const cohortSet = new Set(cohortUsers);
  const baseSize = cohortUsers.length;
  const calculateRetention = (day: number): number => {
    const activeUsers = activeUsersByDay.get(`day${day}`) || new Set();
    const retained = [...activeUsers].filter((u) => cohortSet.has(u)).length;
    return (retained / baseSize) * 100;
  };
  return {
    day1: calculateRetention(1),
    day7: calculateRetention(7),
    day30: calculateRetention(30),
    day90: calculateRetention(90),
  };
}

export function trackRetentionEvent(
  userId: string,
  day: number,
  isActive: boolean,
): void {
  capture("retention_event", { user_id: userId, day, is_active: isActive });
}

export interface RevenueMetrics {
  totalRevenue: number;
  arpu: number;
  arppu: number;
  conversionRate: number;
  ltv: { average: number; median: number; p90: number };
  mrr: number;
  churnRate: number;
}

export interface PurchaseEvent {
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  timestamp: number;
  isSubscription: boolean;
  subscriptionPeriod?: "monthly" | "yearly";
}

export function trackPurchase(event: PurchaseEvent): void {
  capture("purchase_completed", {
    user_id: event.userId,
    product_id: event.productId,
    amount: event.amount,
    currency: event.currency,
    is_subscription: event.isSubscription,
    subscription_period: event.subscriptionPeriod,
  } as Record<string, unknown>);
  if (event.isSubscription) {
    capture("subscription_started", {
      user_id: event.userId,
      product_id: event.productId,
      period: event.subscriptionPeriod,
    });
  }
}

export function trackSubscriptionCancellation(
  userId: string,
  productId: string,
  reason?: string,
): void {
  capture("subscription_cancelled", {
    user_id: userId,
    product_id: productId,
    reason,
  });
}

export function calculateRevenueMetrics(
  purchases: PurchaseEvent[],
  totalUsers: number,
  payingUsers: string[],
): RevenueMetrics {
  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const uniquePayingUsers = new Set(payingUsers).size;
  const userRevenue = new Map<string, number>();
  for (const purchase of purchases) {
    const current = userRevenue.get(purchase.userId) || 0;
    userRevenue.set(purchase.userId, current + purchase.amount);
  }
  const ltvValues = [...userRevenue.values()].sort((a, b) => a - b);
  const averageLtv =
    ltvValues.reduce((sum, v) => sum + v, 0) / (ltvValues.length || 1);
  const medianLtv = ltvValues[Math.floor(ltvValues.length / 2)] || 0;
  const p90Ltv = ltvValues[Math.floor(ltvValues.length * 0.9)] || 0;
  const mrr = purchases
    .filter((p) => p.isSubscription)
    .reduce((sum, p) => {
      if (p.subscriptionPeriod === "yearly") {
        return sum + p.amount / 12;
      }
      return sum + p.amount;
    }, 0);
  return {
    totalRevenue,
    arpu: totalRevenue / (totalUsers || 1),
    arppu: totalRevenue / (uniquePayingUsers || 1),
    conversionRate: (uniquePayingUsers / (totalUsers || 1)) * 100,
    ltv: { average: averageLtv, median: medianLtv, p90: p90Ltv },
    mrr,
    churnRate: 0,
  };
}
