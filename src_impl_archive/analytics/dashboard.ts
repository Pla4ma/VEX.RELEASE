import { calculateRetentionRates } from "./VEXAnalyticsInfrastructure";
import {
  getAverageSessionsPerWeek,
  getStudyPlanCompletionRate,
  calculatePowerUserPercentage,
} from "./engagement";
import {
  getMonetizationMetrics,
  type MonetizationMetrics,
} from "./monetization";
import { getPaywallAnalytics, type PaywallAnalytics } from "./paywall";
import {
  getStreakSurvivalMetrics,
  type StreakSurvivalMetrics,
} from "./streaks";
import { TARGET_METRICS, type VEXSuccessMetrics } from "./VEXAnalyticsInfrastructure.types";

export interface VEXDashboard {
  generatedAt: number;
  successMetrics: VEXSuccessMetrics;
  retention: ReturnType<typeof calculateRetentionRates>;
  engagement: {
    avgSessionsPerWeek: number;
    studyPlanCompletionRate: number;
    powerUserPercentage: number;
  };
  monetization: MonetizationMetrics;
  paywall: PaywallAnalytics;
  streaks: StreakSurvivalMetrics;
  trends: {
    dayOverDay: Record<string, number>;
    weekOverWeek: Record<string, number>;
  };
}

export function generateDashboardReport(): VEXDashboard {
  const retention = calculateRetentionRates();
  const engagement = {
    avgSessionsPerWeek: getAverageSessionsPerWeek(),
    studyPlanCompletionRate: getStudyPlanCompletionRate(),
    powerUserPercentage: calculatePowerUserPercentage(),
  };
  const monetizationMetrics = getMonetizationMetrics();
  const paywallAnalytics = getPaywallAnalytics();
  const successMetrics: VEXSuccessMetrics = {
    day1Retention: {
      current: retention.day1,
      target: TARGET_METRICS.day1Retention.target,
      trend: "flat",
    },
    day7Retention: {
      current: retention.day7,
      target: TARGET_METRICS.day7Retention.target,
      trend: "flat",
    },
    day30Retention: {
      current: retention.day30,
      target: TARGET_METRICS.day30Retention.target,
      trend: "flat",
    },
    sessionsPerWeek: {
      current: engagement.avgSessionsPerWeek,
      target: TARGET_METRICS.sessionsPerWeek.target,
      trend: "flat",
    },
    studyPlanCompletionRate: {
      current: engagement.studyPlanCompletionRate,
      target: TARGET_METRICS.studyPlanCompletionRate.target,
      trend: "flat",
    },
    appStoreRating: {
      current: 0,
      target: TARGET_METRICS.appStoreRating.target,
      trend: "flat",
    },
    supportTicketsPerWeek: {
      current: 0,
      target: TARGET_METRICS.supportTicketsPerWeek.target,
      trend: "flat",
    },
    crashFreeRate: {
      current: 0.98,
      target: TARGET_METRICS.crashFreeRate.target,
      trend: "flat",
    },
    premiumConversionRate: {
      current: monetizationMetrics.conversionRate,
      target: TARGET_METRICS.premiumConversionRate.target,
      trend: "flat",
    },
    ltv: {
      current: monetizationMetrics.averageLTV,
      target: TARGET_METRICS.ltv.target,
      trend: "flat",
    },
    paywallConversionRate: {
      current: paywallAnalytics.conversionRate,
      target: TARGET_METRICS.paywallConversionRate.target,
      trend: "flat",
    },
    npsScore: {
      current: 0,
      target: TARGET_METRICS.npsScore.target,
      trend: "flat",
    },
    clarityScore: {
      current: 0,
      target: TARGET_METRICS.clarityScore.target,
      trend: "flat",
    },
    helpfulnessScore: {
      current: 0,
      target: TARGET_METRICS.helpfulnessScore.target,
      trend: "flat",
    },
    returnIntentScore: {
      current: 0,
      target: TARGET_METRICS.returnIntentScore.target,
      trend: "flat",
    },
  };
  return {
    generatedAt: Date.now(),
    successMetrics,
    retention,
    engagement,
    monetization: monetizationMetrics,
    paywall: paywallAnalytics,
    streaks: getStreakSurvivalMetrics(),
    trends: { dayOverDay: {}, weekOverWeek: {} },
  };
}
