import { capture } from "../../shared/analytics/analytics-service";


export function trackCohortAnalysisCompleted(
  userId: string,
  cohortId: string,
  cohortName: string,
  cohortType: string,
  analysisPeriod: {
    start: Date;
    end: Date;
  },
  metrics: {
    size: number;
    retentionRates: Record<number, number>;
    averageLifetime: number;
    lifetimeValue: number;
    churnRates: Record<number, number>;
  },
  insights: {
    patterns: string[];
    anomalies: string[];
    trends: string[];
    recommendations: string[];
  },
): void {
  capture('retention_cohort_analysis_completed', {
    user_id: userId,
    cohort_id: cohortId,
    cohort_name: cohortName,
    cohort_type: cohortType,
    analysis_period: {
      start: analysisPeriod.start.toISOString(),
      end: analysisPeriod.end.toISOString(),
    },
    metrics,
    insights,
  });
}

export function trackCohortPerformanceAlert(
  userId: string,
  cohortId: string,
  alertType: 'retention_drop' | 'churn_spike' | 'engagement_decline' | 'anomaly',
  severity: 'low' | 'medium' | 'high' | 'critical',
  metrics: {
    current: number;
    baseline: number;
    change: number;
    significance: number;
  },
  context: {
    timeframe: string;
    comparison: string;
    externalFactors: string[];
  },
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  },
): void {
  capture('retention_cohort_performance_alert', {
    user_id: userId,
    cohort_id: cohortId,
    alert_type: alertType,
    severity,
    metrics,
    context,
    recommendations,
  });
}

export function trackRetentionExperimentStarted(
  userId: string,
  experimentId: string,
  experimentName: string,
  hypothesis: string,
  experimentType: string,
  variants: {
    id: string;
    name: string;
    description: string;
    traffic: number;
    configuration: Record<string, unknown>;
  }[],
  traffic: {
    total: number;
    allocation: Record<string, number>;
    duration: number;
  },
  metrics: {
    primary: string;
    secondary: string[];
    guardrails: string[];
  },
  startDate: Date,
  endDate: Date,
): void {
  capture('retention_experiment_started', {
    user_id: userId,
    experiment_id: experimentId,
    experiment_name: experimentName,
    hypothesis,
    experiment_type: experimentType,
    variants,
    traffic,
    metrics,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
}

export function trackRetentionExperimentCompleted(
  userId: string,
  experimentId: string,
  completionDate: Date,
  duration: number,
  results: {
    winner?: string;
    significance: number;
    confidence: number;
    improvement: number;
    variants: {
      id: string;
      participants: number;
      conversions: number;
      conversionRate: number;
      retentionRate: number;
      statisticalSignificance: number;
    }[];
  },
  insights: {
    learnings: string[];
    surprises: string[];
    recommendations: string[];
    nextSteps: string[];
  },
  businessImpact: {
    expectedImprovement: number;
    implementationCost: number;
    roi: number;
  },
): void {
  capture('retention_experiment_completed', {
    user_id: userId,
    experiment_id: experimentId,
    completion_date: completionDate.toISOString(),
    duration,
    results,
    insights,
    business_impact: businessImpact,
  });
}

export function trackChurnPredictionUpdated(
  userId: string,
  predictionId: string,
  churnProbability: number,
  churnTimeframe: number,
  riskFactors: {
    factor: string;
    impact: number;
    description: string;
    category: string;
    detected: Date;
  }[],
  confidence: number,
  model: string,
  version: string,
  recommendations: {
    type: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    action: string;
    expectedImpact: number;
    timeframe: string;
  }[],
): void {
  capture('retention_churn_prediction_updated', {
    user_id: userId,
    prediction_id: predictionId,
    prediction_date: new Date().toISOString(),
    churn_probability: churnProbability,
    churn_timeframe: churnTimeframe,
    riskFactors,
    confidence,
    model,
    version,
    recommendations,
  });
}