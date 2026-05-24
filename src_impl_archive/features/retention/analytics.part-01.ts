/**
 * Retention Feature Analytics
 *
 * Comprehensive analytics tracking for user retention, engagement, and churn prevention features.
 */
// ============================================================================
// USER ACTIVITY ANALYTICS
// ============================================================================
import { capture } from '../../shared/analytics/analytics-service';

export function trackUserActivity(
  userId: string,
  activityType: 'session_start' | 'feature_use' | 'social_interaction' | 'achievement' | 'purchase',
  activityDetails: {
    feature?: string;
    duration?: number;
    engagement?: number;
    context?: Record<string, unknown>;
  },
  retentionMetrics: {
    daysSinceLastActivity: number;
    currentStreak: number;
    engagementScore: number;
    churnRisk: number;
  },
): void {
  capture('retention_user_activity', {
    user_id: userId,
    activity_type: activityType,
    activity_details: activityDetails,
    retention_metrics: retentionMetrics,
  });
}

export function trackUserInactivity(
  userId: string,
  inactivityPeriod: number,
  lastActivityDate: Date,
  inactivityReason: 'natural' | 'forced' | 'technical' | 'user_choice',
  previousEngagement: {
    averageSessionDuration: number;
    featuresUsed: string[];
    lastStreak: number;
  },
  riskFactors: {
    decreasingEngagement: boolean;
    missedGoals: number;
    abandonedSessions: number;
    socialDisconnection: boolean;
  },
): void {
  capture('retention_user_inactivity', {
    user_id: userId,
    inactivity_period: inactivityPeriod,
    last_activity_date: lastActivityDate.toISOString(),
    inactivity_reason: inactivityReason,
    previous_engagement: previousEngagement,
    risk_factors: riskFactors,
  });
}

export function trackChurnRiskChanged(
  userId: string,
  previousRisk: number,
  currentRisk: number,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  contributingFactors: {
    factor: string;
    impact: number;
    description: string;
  }[],
  prediction: {
    churnProbability: number;
    timeToChurn: number;
    confidence: number;
  },
  recommendedActions: {
    action: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expectedImpact: number;
  }[],
): void {
  capture('retention_churn_risk_changed', {
    user_id: userId,
    previous_risk: previousRisk,
    current_risk: currentRisk,
    risk_change: currentRisk - previousRisk,
    risk_level: riskLevel,
    contributing_factors: contributingFactors,
    prediction,
    recommended_actions: recommendedActions,
  });
}

// ============================================================================
// RETENTION STRATEGY ANALYTICS
// ============================================================================

export function trackRetentionStrategyTriggered(
  userId: string,
  strategyId: string,
  strategyName: string,
  strategyType: string,
  triggerCondition: {
    type: string;
    value: unknown;
    threshold: number;
  },
  targetAudience: {
    segments: string[];
    userCount: number;
    criteria: Record<string, unknown>;
  },
  actions: {
    type: string;
    parameters: Record<string, unknown>;
    scheduled: boolean;
    priority: number;
  }[],
): void {
  capture('retention_strategy_triggered', {
    user_id: userId,
    strategy_id: strategyId,
    strategy_name: strategyName,
    strategy_type: strategyType,
    trigger_condition: triggerCondition,
    target_audience: targetAudience,
    actions,
  });
}

export function trackRetentionStrategyCompleted(
  userId: string,
  strategyId: string,
  completionDate: Date,
  duration: number,
  results: {
    targetUsers: number;
    reachedUsers: number;
    engagedUsers: number;
    convertedUsers: number;
    retentionRate: number;
    engagementRate: number;
    conversionRate: number;
  },
  performance: {
    effectiveness: number;
    efficiency: number;
    roi: number;
    costPerUser: number;
  },
): void {
  capture('retention_strategy_completed', {
    user_id: userId,
    strategy_id: strategyId,
    completion_date: completionDate.toISOString(),
    duration,
    results,
    performance,
  });
}

