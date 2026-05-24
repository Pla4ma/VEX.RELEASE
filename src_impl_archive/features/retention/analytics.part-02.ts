import { capture } from '../../shared/analytics/analytics-service';

export function trackRetentionStrategyFailed(
  userId: string,
  strategyId: string,
  failureDate: Date,
  failureReason: string,
  failureType: 'technical' | 'execution' | 'performance' | 'budget' | 'compliance',
  affectedUsers: number,
  impact: {
    userExperience: string;
    businessImpact: string;
    reputation: string;
  },
  recovery: {
    possible: boolean;
    actions: string[];
    timeline: string;
  },
): void {
  capture('retention_strategy_failed', {
    user_id: userId,
    strategy_id: strategyId,
    failure_date: failureDate.toISOString(),
    failure_reason: failureReason,
    failure_type: failureType,
    affected_users: affectedUsers,
    impact,
    recovery,
  });
}

// ============================================================================
// COHORT ANALYTICS
// ============================================================================

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

// ============================================================================
// EXPERIMENT ANALYTICS
// ============================================================================

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

