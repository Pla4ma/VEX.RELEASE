import { capture } from "../../shared/analytics/analytics-service";


export function trackRetentionDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'user_detail' | 'cohort' | 'experiments' | 'strategies',
  filters: {
    timeframe: string;
    segments: string[];
    metrics: string[];
  },
  interactions: {
    viewDuration: number;
    interactions: string[];
    exports: string[];
    shares: string[];
  },
  context: {
    device: string;
    location?: string;
    role: string;
  },
): void {
  capture('retention_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

export function trackRetentionUserProperties(
  userId: string,
  userProperties: {
    currentStage: string;
    churnRisk: number;
    engagementScore: number;
    retentionRate: number;
    lifetimeValue: number;
    daysSinceLastActivity: number;
    currentStreak: number;
    totalInterventions: number;
    lastInterventionDate?: Date;
  },
): void {
  capture('retention_user_properties', {
    user_id: userId,
    current_stage: userProperties.currentStage,
    churn_risk: userProperties.churnRisk,
    engagement_score: userProperties.engagementScore,
    retention_rate: userProperties.retentionRate,
    lifetime_value: userProperties.lifetimeValue,
    days_since_last_activity: userProperties.daysSinceLastActivity,
    current_streak: userProperties.currentStreak,
    total_interventions: userProperties.totalInterventions,
    last_intervention_date: userProperties.lastInterventionDate?.toISOString(),
  });
}

export function trackRetentionError(
  userId: string,
  errorType: 'prediction_error' | 'intervention_error' | 'analytics_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId?: string;
    strategyId?: string;
    experimentId?: string;
  },
): void {
  capture('retention_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

export function trackRetentionFunnel(userId: string, step: 'user_acquired' | 'first_session' | 'engagement' | 'retention' | 'churn_prevented' | 'loyalty'): void {
  capture('retention_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}