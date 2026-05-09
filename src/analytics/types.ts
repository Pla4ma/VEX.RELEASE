/**
 * Analytics Types
 *
 * Type definitions for analytics infrastructure
 */

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

export interface RetentionCohort {
  cohortDate: string; // YYYY-MM-DD
  cohortSize: number;
  day1: number;
  day7: number;
  day30: number;
  day90?: number;
}

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

export interface MonetizationMetrics {
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  trialUsers: number;
  conversionRate: number;
  trialConversionRate: number;
  averageLTV: number;
  totalRevenue: number;
  arpu: number;
  mrr: number;
}

export interface PaywallAnalytics {
  paywallId: string;
  context: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageTimeToConvert: number;
  abandonmentRate: number;
  bestContext: string;
  contexts: Record<string, {
    impressions: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface StreakSurvivalMetrics {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  streakBreaks: number;
  averageStreakLength: number;
  streakSurvivalRate: number;
  recoveryRate: number; // Rate of restarting after break
}

export interface VEXDashboard {
  timestamp: string;
  metrics: VEXSuccessMetrics;
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagement: {
    averageSessionsPerWeek: number;
    averageCompletionRate: number;
    averageSessionDuration: number;
  };
  monetization: MonetizationMetrics;
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
}
