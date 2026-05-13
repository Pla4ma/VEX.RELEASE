import { capture } from "./index";


export function trackFunnelEvent(
  funnelId: string,
  stepName: string,
  userId: string,
  metadata?: Record<string, unknown>
): void {
  capture('funnel_step_completed', {
    funnel_id: funnelId,
    step_name: stepName,
    user_id: userId,
    ...metadata,
  } as Record<string, unknown>);
}

export function calculateFunnelMetrics(
  funnelId: string,
  stepCounts: number[]
): Funnel {
  const steps: FunnelStep[] = ONBOARDING_FUNNEL_STEPS.map((step, index) => {
    const count = stepCounts[index] || 0;
    const prevCount = index > 0 ? stepCounts[index - 1] : count;
    const conversionRate = prevCount > 0 ? (count / prevCount) * 100 : 0;
    const dropOffRate = 100 - conversionRate;

    return {
      name: step.name,
      event: step.event,
      count,
      conversionRate,
      dropOffRate,
    };
  });

  const totalConversionRate =
    stepCounts[0] > 0 ? (stepCounts[stepCounts.length - 1] / stepCounts[0]) * 100 : 0;

  return {
    id: funnelId,
    name: 'Onboarding Funnel',
    steps,
    totalConversionRate,
    averageTimeToConvert: 0, // Would need timestamp analysis
  };
}

export function calculateCohortRetention(
  cohortUsers: string[],
  activeUsersByDay: Map<string, Set<string>>
): Cohort['retention'] {
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
  isActive: boolean
): void {
  capture('retention_event', {
    user_id: userId,
    day,
    is_active: isActive,
  });
}

export function trackPurchase(event: PurchaseEvent): void {
  capture('purchase_completed', {
    user_id: event.userId,
    product_id: event.productId,
    amount: event.amount,
    currency: event.currency,
    is_subscription: event.isSubscription,
    subscription_period: event.subscriptionPeriod,
  } as Record<string, unknown>);

  if (event.isSubscription) {
    capture('subscription_started', {
      user_id: event.userId,
      product_id: event.productId,
      period: event.subscriptionPeriod,
    });
  }
}

export function trackSubscriptionCancellation(
  userId: string,
  productId: string,
  reason?: string
): void {
  capture('subscription_cancelled', {
    user_id: userId,
    product_id: productId,
    reason,
  });
}

export function calculateRevenueMetrics(
  purchases: PurchaseEvent[],
  totalUsers: number,
  payingUsers: string[]
): RevenueMetrics {
  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const uniquePayingUsers = new Set(payingUsers).size;

  // Calculate LTV distribution
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

  // Calculate MRR from subscriptions
  const mrr = purchases
    .filter((p) => p.isSubscription)
    .reduce((sum, p) => {
      if (p.subscriptionPeriod === 'yearly') {
        return sum + p.amount / 12;
      }
      return sum + p.amount;
    }, 0);

  return {
    totalRevenue,
    arpu: totalRevenue / (totalUsers || 1),
    arppu: totalRevenue / (uniquePayingUsers || 1),
    conversionRate: (uniquePayingUsers / (totalUsers || 1)) * 100,
    ltv: {
      average: averageLtv,
      median: medianLtv,
      p90: p90Ltv,
    },
    mrr,
    churnRate: 0, // Would need cancellation data
  };
}