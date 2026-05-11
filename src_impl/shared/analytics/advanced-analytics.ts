/**
 * Advanced Analytics System
 *
 * Phase 12.4 — Funnels, cohorts, revenue analytics, alerting
 */

import { capture } from './index';

// ============================================================================
// Funnel Analysis
// ============================================================================

export interface FunnelStep {
  name: string;
  event: string;
  count: number;
  conversionRate: number; // from previous step
  dropOffRate: number;
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  totalConversionRate: number; // from first to last step
  averageTimeToConvert: number; // minutes
}

// Standard onboarding funnel
const ONBOARDING_FUNNEL_STEPS = [
  { name: 'App Open', event: 'app_opened' },
  { name: 'Started Onboarding', event: 'onboarding_started' },
  { name: 'Completed Profile', event: 'profile_completed' },
  { name: 'First Session Started', event: 'session_started' },
  { name: 'First Session Completed', event: 'session_completed' },
  { name: 'Joined Squad', event: 'squad_joined' },
];

/**
 * Track funnel event
 */
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

/**
 * Calculate funnel metrics
 */
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

// ============================================================================
// Cohort Retention Analysis
// ============================================================================

export interface Cohort {
  id: string;
  startDate: string;
  size: number;
  retention: {
    day1: number; // percentage
    day7: number;
    day30: number;
    day90: number;
  };
  ltv: number; // average lifetime value
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

/**
 * Calculate cohort retention
 */
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

/**
 * Track user retention event
 */
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

// ============================================================================
// Revenue Analytics
// ============================================================================

export interface RevenueMetrics {
  totalRevenue: number;
  arpu: number; // Average Revenue Per User
  arppu: number; // Average Revenue Per Paying User
  conversionRate: number; // % of users who paid
  ltv: {
    average: number;
    median: number;
    p90: number; // 90th percentile
  };
  mrr: number; // Monthly Recurring Revenue
  churnRate: number; // % of subscribers who cancelled
}

export interface PurchaseEvent {
  userId: string;
  productId: string;
  amount: number;
  currency: string;
  timestamp: number;
  isSubscription: boolean;
  subscriptionPeriod?: 'monthly' | 'yearly';
}

/**
 * Track purchase event
 */
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

/**
 * Track subscription cancellation
 */
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

/**
 * Calculate revenue metrics
 */
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

// ============================================================================
// Alerting System
// ============================================================================

export interface MetricAlert {
  id: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=';
  currentValue: number;
  severity: 'WARNING' | 'CRITICAL';
  triggeredAt: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '=';
  duration: number; // minutes the condition must persist
  severity: 'WARNING' | 'CRITICAL';
  notifyChannels: string[];
}

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'alert-d1-retention-drop',
    name: 'D1 Retention Drop',
    metric: 'retention.day1',
    threshold: 10, // 10% drop
    operator: '<',
    duration: 60, // 1 hour
    severity: 'CRITICAL',
    notifyChannels: ['email', 'slack'],
  },
  {
    id: 'alert-session-crash-rate',
    name: 'Session Crash Rate High',
    metric: 'crash.session_rate',
    threshold: 1, // 1% crash rate
    operator: '>',
    duration: 30,
    severity: 'WARNING',
    notifyChannels: ['email'],
  },
  {
    id: 'alert-revenue-drop',
    name: 'Daily Revenue Drop',
    metric: 'revenue.daily',
    threshold: 20, // 20% drop
    operator: '<',
    duration: 120,
    severity: 'CRITICAL',
    notifyChannels: ['email', 'slack', 'pagerduty'],
  },
];

/**
 * Check alert rules
 */
export function checkAlerts(
  currentMetrics: Record<string, number>,
  rules: AlertRule[] = DEFAULT_ALERT_RULES
): MetricAlert[] {
  const triggered: MetricAlert[] = [];

  for (const rule of rules) {
    const currentValue = currentMetrics[rule.metric];
    if (currentValue === undefined) {continue;}

    let isTriggered = false;
    switch (rule.operator) {
      case '>':
        isTriggered = currentValue > rule.threshold;
        break;
      case '<':
        isTriggered = currentValue < rule.threshold;
        break;
      case '=':
        isTriggered = currentValue === rule.threshold;
        break;
    }

    if (isTriggered) {
      triggered.push({
        id: `alert-${Date.now()}-${rule.id}`,
        metric: rule.metric,
        threshold: rule.threshold,
        operator: rule.operator,
        currentValue,
        severity: rule.severity,
        triggeredAt: Date.now(),
      });

      // Capture alert event
      capture('alert_triggered', {
        rule_id: rule.id,
        metric: rule.metric,
        current_value: currentValue,
        threshold: rule.threshold,
        severity: rule.severity,
      } as Record<string, unknown>);
    }
  }

  return triggered;
}

/**
 * Create custom dashboard data
 */
export function createDashboardData(
  _timeRange: '1d' | '7d' | '30d' | '90d'
): {
  revenue: RevenueMetrics;
  retention: RetentionData;
  funnels: Funnel[];
  alerts: MetricAlert[];
} {
  // In production: fetch from analytics database
  return {
    revenue: {
      totalRevenue: 0,
      arpu: 0,
      arppu: 0,
      conversionRate: 0,
      ltv: { average: 0, median: 0, p90: 0 },
      mrr: 0,
      churnRate: 0,
    },
    retention: {
      cohorts: [],
      averageRetention: { day1: 0, day7: 0, day30: 0, day90: 0 },
    },
    funnels: [],
    alerts: [],
  };
}
