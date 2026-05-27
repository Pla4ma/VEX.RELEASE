/**
 * VEX Analytics Types
 *
 * Phase 6.2 - Analytics & Experimentation
 * Core type definitions for the analytics system.
 */

// ============================================================================
// Success Metrics (10/10 Definition)
// ============================================================================

export interface MetricWithTarget {
  current: number;
  target: number;
  trend: "up" | "down" | "flat";
}

export interface VEXSuccessMetrics {
  day1Retention: MetricWithTarget;
  day7Retention: MetricWithTarget;
  day30Retention: MetricWithTarget;
  sessionsPerWeek: MetricWithTarget;
  studyPlanCompletionRate: MetricWithTarget;
  appStoreRating: MetricWithTarget;
  supportTicketsPerWeek: MetricWithTarget;
  crashFreeRate: MetricWithTarget;
  premiumConversionRate: MetricWithTarget;
  ltv: MetricWithTarget;
  paywallConversionRate: MetricWithTarget;
  npsScore: MetricWithTarget;
  clarityScore: MetricWithTarget;
  helpfulnessScore: MetricWithTarget;
  returnIntentScore: MetricWithTarget;
}

type TargetOnlyMetric = { target: number };

export type VEXTargetMetrics = {
  [K in keyof VEXSuccessMetrics]: TargetOnlyMetric;
};

export const TARGET_METRICS: VEXTargetMetrics = {
  day1Retention: { target: 0.8 },
  day7Retention: { target: 0.45 },
  day30Retention: { target: 0.25 },
  sessionsPerWeek: { target: 6 },
  studyPlanCompletionRate: { target: 0.7 },
  appStoreRating: { target: 4.8 },
  supportTicketsPerWeek: { target: 10 },
  crashFreeRate: { target: 0.999 },
  premiumConversionRate: { target: 0.08 },
  ltv: { target: 45 },
  paywallConversionRate: { target: 0.15 },
  npsScore: { target: 50 },
  clarityScore: { target: 0.9 },
  helpfulnessScore: { target: 0.85 },
  returnIntentScore: { target: 0.8 },
};

// ============================================================================
// Retention Types
// ============================================================================

export interface RetentionCohort {
  cohortDate: string;
  cohortSize: number;
  day1: number;
  day7: number;
  day30: number;
  day90?: number;
}

// ============================================================================
// Engagement Types
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
  powerUser: boolean;
}

// ============================================================================
// Monetization Types
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

// ============================================================================
// Paywall Types
// ============================================================================

export interface PaywallAnalytics {
  context: string;
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageRevenuePerView: number;
}

// ============================================================================
// Streak Types
// ============================================================================

export interface StreakSurvivalMetrics {
  streakLength: number;
  userCount: number;
  survivalRate: number;
  averageSessionsPerDay: number;
  completionRate: number;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface VEXDashboard {
  timestamp: number;
  metrics: VEXSuccessMetrics;
  retention: { day1: number; day7: number; day30: number };
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
