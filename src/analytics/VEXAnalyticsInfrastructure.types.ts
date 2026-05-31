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

export interface RetentionCohort {
  cohortDate: string;
  cohortSize: number;
  day1: number;
  day7: number;
  day30: number;
  day90?: number;
}
