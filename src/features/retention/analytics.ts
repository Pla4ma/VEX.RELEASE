/**
 * Retention Feature Analytics
 * 
 * Comprehensive analytics tracking for user retention, engagement, and churn prevention features.
 */

import { capture } from '../../shared/analytics/analytics-service';

// ============================================================================
// USER ACTIVITY ANALYTICS
// ============================================================================

export function trackUserActivity(
  userId: string,
  activityType: 'session_start' | 'feature_use' | 'social_interaction' | 'achievement' | 'purchase',
  activityDetails: {
    feature?: string;
    duration?: number;
    engagement?: number;
    context?: Record<string, any>;
  },
  retentionMetrics: {
    daysSinceLastActivity: number;
    currentStreak: number;
    engagementScore: number;
    churnRisk: number;
  }
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
  }
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
  }[]
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
    value: any;
    threshold: number;
  },
  targetAudience: {
    segments: string[];
    userCount: number;
    criteria: Record<string, any>;
  },
  actions: {
    type: string;
    parameters: Record<string, any>;
    scheduled: boolean;
    priority: number;
  }[]
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
  }
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
  }
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
  }
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
  }
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
    configuration: Record<string, any>;
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
  endDate: Date
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
  }
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

// ============================================================================
// PREDICTION ANALYTICS
// ============================================================================

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
  }[]
): void {
  capture('retention_churn_prediction_updated', {
    user_id: userId,
    prediction_id: predictionId,
    prediction_date: new Date().toISOString(),
    churn_probability: churnProbability,
    churn_timeframe: churnTimeframe,
    risk_factors,
    confidence,
    model,
    version,
    recommendations,
  });
}

export function trackRetentionPredictionAccuracy(
  userId: string,
  model: string,
  version: string,
  evaluationPeriod: {
    start: Date;
    end: Date;
  },
  accuracy: {
    overall: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  },
  calibration: {
    predicted: number[];
    actual: number[];
    reliability: number;
  },
  segments: {
    segment: string;
    accuracy: number;
    sampleSize: number;
  }[],
  improvements: {
    accuracy: number;
    contributingFactors: string[];
  }
): void {
  capture('retention_prediction_accuracy', {
    user_id: userId,
    model,
    version,
    evaluation_period: {
      start: evaluationPeriod.start.toISOString(),
      end: evaluationPeriod.end.toISOString(),
    },
    accuracy,
    calibration,
    segments,
    improvements,
  });
}

// ============================================================================
// INTERVENTION ANALYTICS
// ============================================================================

export function trackRetentionInterventionTriggered(
  userId: string,
  interventionId: string,
  interventionType: 'reactivation' | 'engagement' | 'incentive' | 'support' | 'education',
  triggerReason: string,
  triggerCondition: {
    metric: string;
    threshold: number;
    currentValue: number;
  },
  intervention: {
    title: string;
    description: string;
    actions: {
      type: string;
      parameters: Record<string, any>;
      timing: string;
    }[];
    incentives: {
      type: string;
      value: number;
      conditions: string[];
    }[];
  }
): void {
  capture('retention_intervention_triggered', {
    user_id: userId,
    intervention_id: interventionId,
    intervention_type: interventionType,
    trigger_reason: triggerReason,
    trigger_condition: triggerCondition,
    intervention,
  });
}

export function trackRetentionInterventionCompleted(
  userId: string,
  interventionId: string,
  completionDate: Date,
  duration: number,
  results: {
    userResponded: boolean;
    responseTime: number;
    actionsCompleted: string[];
    incentivesClaimed: string[];
  },
  impact: {
    engagementChange: number;
    retentionProbability: number;
    nextActivityPrediction: Date;
    satisfaction: number;
  },
  effectiveness: {
    success: boolean;
    score: number;
    roi: number;
    cost: number;
  }
): void {
  capture('retention_intervention_completed', {
    user_id: userId,
    intervention_id: interventionId,
    completion_date: completionDate.toISOString(),
    duration,
    results,
    impact: {
      ...impact,
      next_activity_prediction: impact.nextActivityPrediction.toISOString(),
    },
    effectiveness,
  });
}

// ============================================================================
// LIFECYCLE ANALYTICS
// ============================================================================

export function trackUserLifecycleStageChanged(
  userId: string,
  previousStage: string,
  currentStage: string,
  stageDuration: number,
  changeReason: string,
  changeTrigger: string,
  stageCharacteristics: {
    engagement: number;
    retention: number;
    value: number;
    potential: number;
  },
  nextMilestones: {
    milestone: string;
    probability: number;
    timeframe: number;
  }[],
  recommendations: {
    immediate: string[];
    ongoing: string[];
  }
): void {
  capture('retention_user_lifecycle_stage_changed', {
    user_id: userId,
    previous_stage: previousStage,
    current_stage: currentStage,
    stage_duration: stageDuration,
    change_reason: changeReason,
    change_trigger: changeTrigger,
    stage_characteristics: stageCharacteristics,
    next_milestones: nextMilestones,
    recommendations,
  });
}

export function trackUserMilestoneReached(
  userId: string,
  milestoneId: string,
  milestoneType: 'engagement' | 'retention' | 'value' | 'loyalty' | 'achievement',
  milestoneName: string,
  reachedAt: Date,
  progress: {
    current: number;
    target: number;
    percentage: number;
  },
  rewards: {
    type: string;
    value: number;
    name: string;
  }[],
  nextMilestone: {
    name: string;
    target: number;
    estimatedTime: number;
  }
): void {
  capture('retention_user_milestone_reached', {
    user_id: userId,
    milestone_id: milestoneId,
    milestone_type: milestoneType,
    milestone_name: milestoneName,
    reached_at: reachedAt.toISOString(),
    progress,
    rewards,
    next_milestone,
  });
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

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
  }
): void {
  capture('retention_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

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
  }
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

// ============================================================================
// ERROR TRACKING
// ============================================================================

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
  }
): void {
  capture('retention_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackRetentionFunnel(
  userId: string,
  step: 'user_acquired' | 'first_session' | 'engagement' | 'retention' | 'churn_prevented' | 'loyalty'
): void {
  capture('retention_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
