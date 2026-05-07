/**
 * VEX Analytics Infrastructure
 *
 * Phase 6.2 - Analytics & Experimentation
 * Comprehensive analytics system tracking the 10/10 success metrics:
 * - Retention: Day 1/7/30
 * - Engagement: Sessions/week, plan completion
 * - Monetization: Premium conversion, LTV
 * - Product Quality: NPS, crash-free rate
 *
 * Dependencies:
 * - Analytics (base system)
 * - Sessions (engagement tracking)
 * - Content Study (plan completion)
 * - Monetization (conversion tracking)
 * - Streaks (survival rate)
 */

import { eventBus } from "../events";

// ============================================================================
// Success Metrics (10/10 Definition)
// ============================================================================

export interface MetricWithTarget {
  current: number;
  target: number;
  trend: "up" | "down" | "flat";
}

export interface VEXSuccessMetrics {
  // User Engagement
  day1Retention: MetricWithTarget;
  day7Retention: MetricWithTarget;
  day30Retention: MetricWithTarget;
  sessionsPerWeek: MetricWithTarget;
  studyPlanCompletionRate: MetricWithTarget;

  // Product Quality
  appStoreRating: MetricWithTarget;
  supportTicketsPerWeek: MetricWithTarget;
  crashFreeRate: MetricWithTarget;

  // Monetization
  premiumConversionRate: MetricWithTarget;
  ltv: MetricWithTarget;
  paywallConversionRate: MetricWithTarget;

  // User Sentiment
  npsScore: MetricWithTarget;
  clarityScore: MetricWithTarget; // "I know exactly what to do"
  helpfulnessScore: MetricWithTarget; // "Helps me study better"
  returnIntentScore: MetricWithTarget; // "Want to come back tomorrow"
}

type TargetOnlyMetric = { target: number };

export type VEXTargetMetrics = {
  [K in keyof VEXSuccessMetrics]: TargetOnlyMetric;
};

// Target metrics from the 10/10 plan
export const TARGET_METRICS: VEXTargetMetrics = {
  day1Retention: { target: 0.8 }, // 80% (from 60%)
  day7Retention: { target: 0.45 }, // 45% (from 25%)
  day30Retention: { target: 0.25 }, // 25% (from 10%)
  sessionsPerWeek: { target: 6 }, // 6 sessions (from 3)
  studyPlanCompletionRate: { target: 0.7 }, // 70% (from 30%)
  appStoreRating: { target: 4.8 }, // 4.8 stars (from 4.2)
  supportTicketsPerWeek: { target: 10 }, // 10 tickets (from 50)
  crashFreeRate: { target: 0.999 }, // 99.9% (from 98%)
  premiumConversionRate: { target: 0.08 }, // 8% (from 2%)
  ltv: { target: 45 }, // $45 (from $12)
  paywallConversionRate: { target: 0.15 }, // 15% (from 5%)
  npsScore: { target: 50 }, // 50 (from 20)
  clarityScore: { target: 0.9 }, // 90% (from 40%)
  helpfulnessScore: { target: 0.85 }, // 85% (from 50%)
  returnIntentScore: { target: 0.8 }, // 80% (from 45%)
};

// ============================================================================
// Retention Tracking
// ============================================================================

export interface RetentionCohort {
  cohortDate: string; // YYYY-MM-DD
  cohortSize: number;
  day1: number;
  day7: number;
  day30: number;
  day90?: number;
}

const retentionCohorts = new Map<string, RetentionCohort>();

/**
 * Track user retention
 */
export function trackRetentionEvent(userId: string, event: "first_open" | "session" | "return"): void {
  const today = new Date().toISOString().split("T")[0];
  const userFirstOpen = getUserFirstOpen(userId);

  if (event === "first_open") {
    // New cohort
    const cohort = retentionCohorts.get(today) || {
      cohortDate: today,
      cohortSize: 0,
      day1: 0,
      day7: 0,
      day30: 0,
    };
    cohort.cohortSize++;
    retentionCohorts.set(today, cohort);
    storeUserFirstOpen(userId, today);
    return;
  }

  if (!userFirstOpen) {
    return;
  }

  // Calculate days since first open
  const daysSince = daysBetween(userFirstOpen, today);
  const cohort = retentionCohorts.get(userFirstOpen);
  if (!cohort) {
    return;
  }

  // Update retention for appropriate day
  if (daysSince === 1) {
    cohort.day1++;
  }
  if (daysSince === 7) {
    cohort.day7++;
  }
  if (daysSince === 30) {
    cohort.day30++;
  }
}

function getUserFirstOpen(userId: string): string | null {
  // Would integrate with persistent storage
  return null;
}

function storeUserFirstOpen(userId: string, date: string): void {
  // Would integrate with persistent storage
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate current retention rates
 */
export function calculateRetentionRates(): {
  day1: number;
  day7: number;
  day30: number;
} {
  const cohorts = Array.from(retentionCohorts.values());
  if (cohorts.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  // Use cohorts old enough to have day30 data
  const matureCohorts = cohorts.filter((c) => {
    const cohortDate = new Date(c.cohortDate);
    const daysSince = (Date.now() - cohortDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  });

  if (matureCohorts.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  const totalSize = matureCohorts.reduce((sum, c) => sum + c.cohortSize, 0);
  if (totalSize === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  return {
    day1: matureCohorts.reduce((sum, c) => sum + c.day1, 0) / totalSize,
    day7: matureCohorts.reduce((sum, c) => sum + c.day7, 0) / totalSize,
    day30: matureCohorts.reduce((sum, c) => sum + c.day30, 0) / totalSize,
  };
}

// ============================================================================
// Engagement Tracking
// ============================================================================

export interface EngagementMetrics {
  userId: string;
  sessionsLast7Days: number;
  sessionsLast30Days: number;
  totalFocusMinutes: number;
  avgSessionDuration: number;
  studyPlansCompleted: number;
  studyPlansStarted: number;
  bossBattlesCompleted: number;
  streakDays: number;
  weeklyActive: boolean;
  powerUser: boolean; // 5+ sessions/week
}

const engagementData = new Map<string, EngagementMetrics>();

/**
 * Record engagement event
 */
export function recordEngagementEvent(
  userId: string,
  event: {
    type: "session_complete" | "plan_start" | "plan_complete" | "boss_defeat" | "streak_milestone";
    value?: number;
  },
): void {
  let metrics = engagementData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      sessionsLast7Days: 0,
      sessionsLast30Days: 0,
      totalFocusMinutes: 0,
      avgSessionDuration: 0,
      studyPlansCompleted: 0,
      studyPlansStarted: 0,
      bossBattlesCompleted: 0,
      streakDays: 0,
      weeklyActive: false,
      powerUser: false,
    };
  }

  switch (event.type) {
    case "session_complete":
      metrics.sessionsLast7Days++;
      metrics.sessionsLast30Days++;
      if (event.value) {
        metrics.totalFocusMinutes += event.value;
        metrics.avgSessionDuration = metrics.totalFocusMinutes / metrics.sessionsLast30Days;
      }
      break;
    case "plan_start":
      metrics.studyPlansStarted++;
      break;
    case "plan_complete":
      metrics.studyPlansCompleted++;
      break;
    case "boss_defeat":
      metrics.bossBattlesCompleted++;
      break;
    case "streak_milestone":
      if (event.value) {
        metrics.streakDays = event.value;
      }
      break;
  }

  // Recalculate segments
  metrics.weeklyActive = metrics.sessionsLast7Days > 0;
  metrics.powerUser = metrics.sessionsLast7Days >= 5;

  engagementData.set(userId, metrics);

  eventBus.publish("analytics:engagement", {
    userId,
    event: event.type,
    metrics,
  });
}

/**
 * Get average sessions per week
 */
export function getAverageSessionsPerWeek(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }
  return users.reduce((sum, user) => sum + user.sessionsLast7Days, 0) / users.length;
}

/**
 * Get study plan completion rate
 */
export function getStudyPlanCompletionRate(): number {
  const users = Array.from(engagementData.values());
  if (users.length === 0) {
    return 0;
  }

  const usersWithPlans = users.filter((user) => user.studyPlansStarted > 0);
  if (usersWithPlans.length === 0) {
    return 0;
  }

  const totalStarted = usersWithPlans.reduce((sum, user) => sum + user.studyPlansStarted, 0);
  const totalCompleted = usersWithPlans.reduce((sum, user) => sum + user.studyPlansCompleted, 0);

  return totalCompleted / totalStarted;
}

// ============================================================================
// Monetization Tracking
// ============================================================================

export interface MonetizationMetrics {
  userId: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  iapRevenue: number;
  subscriptionType: "free" | "premium" | "premium_plus";
  subscriptionStart?: string;
  subscriptionEnd?: string;
  ltv: number;
  paywallViews: number;
  paywallConversions: number;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
  purchaseCount: number;
}

const monetizationData = new Map<string, MonetizationMetrics>();

/**
 * Track monetization event
 */
export function trackMonetizationEvent(
  userId: string,
  event: {
    type: "subscription_start" | "subscription_cancel" | "purchase" | "paywall_view" | "paywall_convert";
    value?: number;
    productType?: string;
  },
): void {
  let metrics = monetizationData.get(userId);
  if (!metrics) {
    metrics = {
      userId,
      totalRevenue: 0,
      subscriptionRevenue: 0,
      iapRevenue: 0,
      subscriptionType: "free",
      ltv: 0,
      paywallViews: 0,
      paywallConversions: 0,
      purchaseCount: 0,
    };
  }

  switch (event.type) {
    case "subscription_start":
      metrics.subscriptionType = event.productType as "premium" | "premium_plus" || "premium";
      metrics.subscriptionStart = new Date().toISOString();
      if (event.value) {
        metrics.subscriptionRevenue += event.value;
        metrics.totalRevenue += event.value;
      }
      break;

    case "subscription_cancel":
      metrics.subscriptionEnd = new Date().toISOString();
      metrics.subscriptionType = "free";
      break;

    case "purchase":
      metrics.purchaseCount++;
      metrics.lastPurchaseDate = new Date().toISOString();
      if (!metrics.firstPurchaseDate) {
        metrics.firstPurchaseDate = metrics.lastPurchaseDate;
      }
      if (event.value) {
        if (event.productType === "subscription") {
          metrics.subscriptionRevenue += event.value;
        } else {
          metrics.iapRevenue += event.value;
        }
        metrics.totalRevenue += event.value;
      }
      break;

    case "paywall_view":
      metrics.paywallViews++;
      break;

    case "paywall_convert":
      metrics.paywallConversions++;
      break;
  }

  // Calculate LTV (simplified - would use cohort data in production)
  metrics.ltv = metrics.totalRevenue;

  monetizationData.set(userId, metrics);

  eventBus.publish("analytics:monetization", {
    userId,
    event: event.type,
    metrics,
  });
}

/**
 * Get monetization metrics
 */
export function getMonetizationMetrics(): {
  premiumConversionRate: number;
  averageLtv: number;
  totalRevenue: number;
  paywallConversionRate: number;
} {
  const users = Array.from(monetizationData.values());
  if (users.length === 0) {
    return {
      premiumConversionRate: 0,
      averageLtv: 0,
      totalRevenue: 0,
      paywallConversionRate: 0,
    };
  }

  const premiumUsers = users.filter((user) => user.subscriptionType !== "free");
  const premiumConversionRate = premiumUsers.length / users.length;

  const totalRevenue = users.reduce((sum, user) => sum + user.totalRevenue, 0);
  const averageLtv = totalRevenue / users.length;

  const totalPaywallViews = users.reduce((sum, user) => sum + user.paywallViews, 0);
  const totalPaywallConversions = users.reduce((sum, user) => sum + user.paywallConversions, 0);
  const paywallConversionRate = totalPaywallViews > 0 ? totalPaywallConversions / totalPaywallViews : 0;

  return {
    premiumConversionRate,
    averageLtv,
    totalRevenue,
    paywallConversionRate,
  };
}

// ============================================================================
// Paywall Analytics
// ============================================================================

export interface PaywallAnalytics {
  context: string;
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageRevenuePerView: number;
}

const paywallData = new Map<string, PaywallAnalytics>();

/**
 * Track paywall event
 */
export function trackPaywallEvent(
  userId: string,
  context: string,
  event: "view" | "convert" | "dismiss",
  value?: number,
): void {
  let analytics = paywallData.get(context);
  if (!analytics) {
    analytics = {
      context,
      views: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
      averageRevenuePerView: 0,
    };
  }

  switch (event) {
    case "view":
      analytics.views++;
      break;
    case "convert":
      analytics.conversions++;
      if (value) {
        analytics.revenue += value;
      }
      break;
    case "dismiss":
      // Track dismissals for optimization
      break;
  }

  // Recalculate metrics
  analytics.conversionRate = analytics.views > 0 ? analytics.conversions / analytics.views : 0;
  analytics.averageRevenuePerView = analytics.views > 0 ? analytics.revenue / analytics.views : 0;

  paywallData.set(context, analytics);

  eventBus.publish("analytics:paywall", {
    userId,
    context,
    event,
    analytics,
  });
}

/**
 * Get paywall analytics
 */
export function getPaywallAnalytics(): PaywallAnalytics[] {
  return Array.from(paywallData.values()).sort((a, b) => b.conversionRate - a.conversionRate);
}

/**
 * Get best performing paywall context
 */
export function getBestPaywallContext(): string | null {
  const analytics = getPaywallAnalytics();
  return analytics.length > 0 ? analytics[0].context : null;
}

// ============================================================================
// Streak Analytics
// ============================================================================

export interface StreakSurvivalMetrics {
  streakLength: number;
  userCount: number;
  survivalRate: number;
  averageSessionsPerDay: number;
  completionRate: number;
}

const streakData = new Map<number, StreakSurvivalMetrics>();

/**
 * Track streak event
 */
export function trackStreakEvent(
  userId: string,
  event: {
    type: "streak_start" | "streak_extend" | "streak_break" | "streak_milestone";
    streakLength: number;
    sessionsToday?: number;
    completedToday?: boolean;
  },
): void {
  let metrics = streakData.get(event.streakLength);
  if (!metrics) {
    metrics = {
      streakLength: event.streakLength,
      userCount: 0,
      survivalRate: 0,
      averageSessionsPerDay: 0,
      completionRate: 0,
    };
  }

  switch (event.type) {
    case "streak_start":
    case "streak_extend":
      metrics.userCount++;
      break;
    case "streak_break":
      metrics.userCount--;
      break;
    case "streak_milestone":
      // Update survival rate based on milestone data
      break;
  }

  // Update aggregate metrics
  const totalUsers = Array.from(streakData.values()).reduce((sum, m) => sum + m.userCount, 0);
  if (totalUsers > 0) {
    metrics.survivalRate = metrics.userCount / totalUsers;
  }

  streakData.set(event.streakLength, metrics);

  eventBus.publish("analytics:streak", {
    userId,
    event: event.type,
    streakLength: event.streakLength,
    metrics,
  });
}

/**
 * Get streak survival metrics
 */
export function getStreakSurvivalMetrics(): StreakSurvivalMetrics[] {
  return Array.from(streakData.values()).sort((a, b) => a.streakLength - b.streakLength);
}

// ============================================================================
// Dashboard Reporting
// ============================================================================

export interface VEXDashboard {
  timestamp: number;
  metrics: VEXSuccessMetrics;
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagement: {
    sessionsPerWeek: number;
    studyPlanCompletionRate: number;
    weeklyActiveUsers: number;
    powerUsers: number;
  };
  monetization: {
    premiumConversionRate: number;
    averageLtv: number;
    totalRevenue: number;
    paywallConversionRate: number;
  };
  topPaywalls: PaywallAnalytics[];
  streakSurvival: StreakSurvivalMetrics[];
}

/**
 * Generate comprehensive dashboard report
 */
export function generateDashboardReport(): VEXDashboard {
  const retentionRates = calculateRetentionRates();
  const monetizationMetrics = getMonetizationMetrics();
  const paywallAnalytics = getPaywallAnalytics();
  const streakSurvival = getStreakSurvivalMetrics();

  // Calculate current metrics with trends
  const metrics: VEXSuccessMetrics = {
    day1Retention: {
      current: retentionRates.day1,
      target: TARGET_METRICS.day1Retention.target,
      trend: "flat", // Would calculate from historical data
    },
    day7Retention: {
      current: retentionRates.day7,
      target: TARGET_METRICS.day7Retention.target,
      trend: "flat",
    },
    day30Retention: {
      current: retentionRates.day30,
      target: TARGET_METRICS.day30Retention.target,
      trend: "flat",
    },
    sessionsPerWeek: {
      current: getAverageSessionsPerWeek(),
      target: TARGET_METRICS.sessionsPerWeek.target,
      trend: "flat",
    },
    studyPlanCompletionRate: {
      current: getStudyPlanCompletionRate(),
      target: TARGET_METRICS.studyPlanCompletionRate.target,
      trend: "flat",
    },
    appStoreRating: {
      current: 4.5, // Would fetch from app store API
      target: TARGET_METRICS.appStoreRating.target,
      trend: "up",
    },
    supportTicketsPerWeek: {
      current: 25, // Would fetch from support system
      target: TARGET_METRICS.supportTicketsPerWeek.target,
      trend: "down",
    },
    crashFreeRate: {
      current: 0.995, // Would fetch from crash reporting
      target: TARGET_METRICS.crashFreeRate.target,
      trend: "up",
    },
    premiumConversionRate: {
      current: monetizationMetrics.premiumConversionRate,
      target: TARGET_METRICS.premiumConversionRate.target,
      trend: "up",
    },
    ltv: {
      current: monetizationMetrics.averageLtv,
      target: TARGET_METRICS.ltv.target,
      trend: "up",
    },
    paywallConversionRate: {
      current: monetizationMetrics.paywallConversionRate,
      target: TARGET_METRICS.paywallConversionRate.target,
      trend: "up",
    },
    npsScore: {
      current: 35, // Would calculate from survey data
      target: TARGET_METRICS.npsScore.target,
      trend: "up",
    },
    clarityScore: {
      current: 0.75, // Would calculate from user feedback
      target: TARGET_METRICS.clarityScore.target,
      trend: "up",
    },
    helpfulnessScore: {
      current: 0.70, // Would calculate from user feedback
      target: TARGET_METRICS.helpfulnessScore.target,
      trend: "up",
    },
    returnIntentScore: {
      current: 0.65, // Would calculate from user feedback
      target: TARGET_METRICS.returnIntentScore.target,
      trend: "up",
    },
  };

  return {
    timestamp: Date.now(),
    metrics,
    retention: retentionRates,
    engagement: {
      sessionsPerWeek: getAverageSessionsPerWeek(),
      studyPlanCompletionRate: getStudyPlanCompletionRate(),
      weeklyActiveUsers: Array.from(engagementData.values()).filter((u) => u.weeklyActive).length,
      powerUsers: Array.from(engagementData.values()).filter((u) => u.powerUser).length,
    },
    monetization: monetizationMetrics,
    topPaywalls: paywallAnalytics.slice(0, 5),
    streakSurvival: streakSurvival.slice(0, 10),
  };
}