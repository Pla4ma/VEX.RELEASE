export interface MetricWithTarget {
    current: number;
    target: number;
    trend: 'up' | 'down' | 'flat';
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

export interface RetentionCohort {
    cohortDate: string;
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
    totalShows: number;
    totalDismisses: number;
    totalConversions: number;
    conversionRate: number;
    byContext: Record<string, { shows: number; conversions: number; rate: number }>;
}

export interface StreakSurvivalMetrics {
    totalStreaksStarted: number;
    streaksBroken: number;
    streaksProtected: number;
    survivalRate: number;
    avgStreakLength: number;
    insuranceUsageRate: number;
}

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

export type VEXTargetMetrics = {
      [K in keyof VEXSuccessMetrics]: TargetOnlyMetric;
    };
