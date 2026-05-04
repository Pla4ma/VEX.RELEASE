/**
 * Retention Feature Events
 * 
 * Event definitions for user retention, engagement, and churn prevention features.
 */

import { RetentionEvent } from './types';

// Base Event Interface
export interface BaseRetentionEvent {
  id: string;
  userId: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  sessionId?: string;
  correlationId?: string;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

// User Activity Events
export interface UserActiveEvent extends BaseRetentionEvent {
  type: 'user_active';
  data: {
    activityType: 'session_start' | 'feature_use' | 'social_interaction' | 'achievement' | 'purchase';
    activityDetails: {
      feature?: string;
      duration?: number;
      engagement?: number;
      context?: Record<string, any>;
    };
    sessionContext: {
      sessionId: string;
      sessionDuration: number;
      device: string;
      location?: string;
    };
    retentionMetrics: {
      daysSinceLastActivity: number;
      currentStreak: number;
      engagementScore: number;
      churnRisk: number;
    };
  };
}

export interface UserInactiveEvent extends BaseRetentionEvent {
  type: 'user_inactive';
  data: {
    inactivityPeriod: number; // days
    lastActivityDate: Date;
    inactivityReason: 'natural' | 'forced' | 'technical' | 'user_choice';
    previousEngagement: {
      averageSessionDuration: number;
      featuresUsed: string[];
      lastStreak: number;
    };
    riskFactors: {
      decreasingEngagement: boolean;
      missedGoals: number;
      abandonedSessions: number;
      socialDisconnection: boolean;
    };
  };
}

export interface UserChurnRiskChangedEvent extends BaseRetentionEvent {
  type: 'user_churn_risk_changed';
  data: {
    previousRisk: number;
    currentRisk: number;
    riskChange: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    contributingFactors: {
      factor: string;
      impact: number;
      description: string;
    }[];
    prediction: {
      churnProbability: number;
      timeToChurn: number;
      confidence: number;
    };
    recommendedActions: {
      action: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      expectedImpact: number;
    }[];
  };
}

// Strategy Events
export interface RetentionStrategyTriggeredEvent extends BaseRetentionEvent {
  type: 'retention_strategy_triggered';
  data: {
    strategyId: string;
    strategyName: string;
    strategyType: string;
    triggerCondition: {
      type: string;
      value: any;
      threshold: number;
    };
    targetAudience: {
      segments: string[];
      userCount: number;
      criteria: Record<string, any>;
    };
    actions: {
      type: string;
      parameters: Record<string, any>;
      scheduled: boolean;
      priority: number;
    }[];
    context: {
      userId: string;
      triggerData: Record<string, any>;
      environment: Record<string, any>;
    };
  };
}

export interface RetentionStrategyCompletedEvent extends BaseRetentionEvent {
  type: 'retention_strategy_completed';
  data: {
    strategyId: string;
    completionDate: Date;
    duration: number;
    results: {
      targetUsers: number;
      reachedUsers: number;
      engagedUsers: number;
      convertedUsers: number;
      retentionRate: number;
      engagementRate: number;
      conversionRate: number;
    };
    performance: {
      effectiveness: number;
      efficiency: number;
      roi: number;
      costPerUser: number;
    };
    insights: {
      successes: string[];
      failures: string[];
      improvements: string[];
    };
  };
}

export interface RetentionStrategyFailedEvent extends BaseRetentionEvent {
  type: 'retention_strategy_failed';
  data: {
    strategyId: string;
    failureDate: Date;
    failureReason: string;
    failureType: 'technical' | 'execution' | 'performance' | 'budget' | 'compliance';
    affectedUsers: number;
    impact: {
      userExperience: string;
      businessImpact: string;
      reputation: string;
    };
    recovery: {
      possible: boolean;
      actions: string[];
      timeline: string;
    };
  };
}

// Cohort Events
export interface CohortAnalysisCompletedEvent extends BaseRetentionEvent {
  type: 'cohort_analysis_completed';
  data: {
    cohortId: string;
    cohortName: string;
    cohortType: string;
    analysisPeriod: {
      start: Date;
      end: Date;
    };
    metrics: {
      size: number;
      retentionRates: Record<number, number>;
      averageLifetime: number;
      lifetimeValue: number;
      churnRates: Record<number, number>;
    };
    insights: {
      patterns: string[];
      anomalies: string[];
      trends: string[];
      recommendations: string[];
    };
    segments: {
      segmentId: string;
      performance: number;
      comparison: string;
    }[];
  };
}

export interface CohortPerformanceAlertEvent extends BaseRetentionEvent {
  type: 'cohort_performance_alert';
  data: {
    cohortId: string;
    alertType: 'retention_drop' | 'churn_spike' | 'engagement_decline' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    metrics: {
      current: number;
      baseline: number;
      change: number;
      significance: number;
    };
    context: {
      timeframe: string;
      comparison: string;
      externalFactors: string[];
    };
    recommendations: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
  };
}

// Experiment Events
export interface RetentionExperimentStartedEvent extends BaseRetentionEvent {
  type: 'retention_experiment_started';
  data: {
    experimentId: string;
    experimentName: string;
    hypothesis: string;
    experimentType: string;
    variants: {
      id: string;
      name: string;
      description: string;
      traffic: number;
      configuration: Record<string, any>;
    }[];
    traffic: {
      total: number;
      allocation: Record<string, number>;
      duration: number;
    };
    metrics: {
      primary: string;
      secondary: string[];
      guardrails: string[];
    };
    startDate: Date;
    endDate: Date;
  };
}

export interface RetentionExperimentCompletedEvent extends BaseRetentionEvent {
  type: 'retention_experiment_completed';
  data: {
    experimentId: string;
    completionDate: Date;
    duration: number;
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
    };
    insights: {
      learnings: string[];
      surprises: string[];
      recommendations: string[];
      nextSteps: string[];
    };
    businessImpact: {
      expectedImprovement: number;
      implementationCost: number;
      roi: number;
    };
  };
}

// Prediction Events
export interface ChurnPredictionUpdatedEvent extends BaseRetentionEvent {
  type: 'churn_prediction_updated';
  data: {
    predictionId: string;
    userId: string;
    predictionDate: Date;
    churnProbability: number;
    churnTimeframe: number;
    riskFactors: {
      factor: string;
      impact: number;
      description: string;
      category: string;
      detected: Date;
    }[];
    confidence: number;
    model: string;
    version: string;
    recommendations: {
      type: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      action: string;
      expectedImpact: number;
      timeframe: string;
    }[];
    previousPrediction?: {
      probability: number;
      timeframe: number;
      date: Date;
    };
  };
}

export interface RetentionPredictionAccuracyEvent extends BaseRetentionEvent {
  type: 'retention_prediction_accuracy';
  data: {
    model: string;
    version: string;
    evaluationPeriod: {
      start: Date;
      end: Date;
    };
    accuracy: {
      overall: number;
      precision: number;
      recall: number;
      f1Score: number;
      auc: number;
    };
    calibration: {
      predicted: number[];
      actual: number[];
      reliability: number;
    };
    segments: {
      segment: string;
      accuracy: number;
      sampleSize: number;
    }[];
    improvements: {
      accuracy: number;
      contributingFactors: string[];
    };
  };
}

// Intervention Events
export interface RetentionInterventionTriggeredEvent extends BaseRetentionEvent {
  type: 'retention_intervention_triggered';
  data: {
    interventionId: string;
    interventionType: 'reactivation' | 'engagement' | 'incentive' | 'support' | 'education';
    triggerReason: string;
    triggerCondition: {
      metric: string;
      threshold: number;
      currentValue: number;
    };
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
    };
    targetUser: {
      userId: string;
      riskLevel: string;
      personalized: boolean;
      context: Record<string, any>;
    };
  };
}

export interface RetentionInterventionCompletedEvent extends BaseRetentionEvent {
  type: 'retention_intervention_completed';
  data: {
    interventionId: string;
    userId: string;
    completionDate: Date;
    duration: number;
    results: {
      userResponded: boolean;
      responseTime: number;
      actionsCompleted: string[];
      incentivesClaimed: string[];
    };
    impact: {
      engagementChange: number;
      retentionProbability: number;
      nextActivityPrediction: Date;
      satisfaction: number;
    };
    effectiveness: {
      success: boolean;
      score: number;
      roi: number;
      cost: number;
    };
    feedback: {
      userRating?: number;
      userComment?: string;
      systemNotes: string[];
    };
  };
}

// Lifecycle Events
export interface UserLifecycleStageChangedEvent extends BaseRetentionEvent {
  type: 'user_lifecycle_stage_changed';
  data: {
    previousStage: string;
    currentStage: string;
    stageDuration: number;
    changeReason: string;
    changeTrigger: string;
    stageCharacteristics: {
      engagement: number;
      retention: number;
      value: number;
      potential: number;
    };
    nextMilestones: {
      milestone: string;
      probability: number;
      timeframe: number;
    }[];
    recommendations: {
      immediate: string[];
      ongoing: string[];
    };
  };
}

export interface UserMilestoneReachedEvent extends BaseRetentionEvent {
  type: 'user_milestone_reached';
  data: {
    milestoneId: string;
    milestoneType: 'engagement' | 'retention' | 'value' | 'loyalty' | 'achievement';
    milestoneName: string;
    reachedAt: Date;
    progress: {
      current: number;
      target: number;
      percentage: number;
    };
    rewards: {
      type: string;
      value: number;
      name: string;
    }[];
    celebration: {
      message: string;
      channels: string[];
      personalization: boolean;
    };
    nextMilestone: {
      name: string;
      target: number;
      estimatedTime: number;
    };
  };
}

// Analytics Events
export interface RetentionAnalyticsEvent extends BaseRetentionEvent {
  type: 'retention_analytics';
  data: {
    analyticsType: 'overview' | 'cohort' | 'prediction' | 'intervention' | 'experiment';
    timeframe: string;
    metrics: Record<string, number>;
    dimensions: Record<string, any>;
    insights: {
      type: string;
      description: string;
      significance: string;
      recommendations: string[];
    }[];
    trends: {
      metric: string;
      direction: 'up' | 'down' | 'stable';
      change: number;
      significance: string;
    }[];
    generatedAt: Date;
  };
}

export interface RetentionDashboardViewedEvent extends BaseRetentionEvent {
  type: 'retention_dashboard_viewed';
  data: {
    dashboardType: 'overview' | 'user_detail' | 'cohort' | 'experiments' | 'strategies';
    filters: {
      timeframe: string;
      segments: string[];
      metrics: string[];
    };
    interactions: {
      viewDuration: number;
      interactions: string[];
      exports: string[];
      shares: string[];
    };
    context: {
      device: string;
      location?: string;
      role: string;
    };
  };
}

// System Events
export interface RetentionSystemMaintenanceEvent extends BaseRetentionEvent {
  type: 'retention_system_maintenance';
  data: {
    maintenanceType: 'scheduled' | 'emergency' | 'upgrade' | 'migration';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    affectedServices: string[];
    impact: {
      predictions: boolean;
      interventions: boolean;
      analytics: boolean;
      experiments: boolean;
    };
    message: string;
    initiatedBy: string;
  };
}

export interface RetentionSystemErrorEvent extends BaseRetentionEvent {
  type: 'retention_system_error';
  data: {
    errorType: 'prediction_error' | 'intervention_error' | 'analytics_error' | 'system_error';
    errorCode: string;
    errorMessage: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    context: {
      service: string;
      operation: string;
      userId?: string;
      strategyId?: string;
      experimentId?: string;
    };
    stackTrace?: string;
    affectedUsers: number;
    recoveryAction: string;
  };
}

// Union Type for All Retention Events
export type RetentionEventType = 
  | UserActiveEvent
  | UserInactiveEvent
  | UserChurnRiskChangedEvent
  | RetentionStrategyTriggeredEvent
  | RetentionStrategyCompletedEvent
  | RetentionStrategyFailedEvent
  | CohortAnalysisCompletedEvent
  | CohortPerformanceAlertEvent
  | RetentionExperimentStartedEvent
  | RetentionExperimentCompletedEvent
  | ChurnPredictionUpdatedEvent
  | RetentionPredictionAccuracyEvent
  | RetentionInterventionTriggeredEvent
  | RetentionInterventionCompletedEvent
  | UserLifecycleStageChangedEvent
  | UserMilestoneReachedEvent
  | RetentionAnalyticsEvent
  | RetentionDashboardViewedEvent
  | RetentionSystemMaintenanceEvent
  | RetentionSystemErrorEvent;

// Event Factory Functions
export function createUserActiveEvent(
  userId: string,
  activityType: string,
  activityDetails: any,
  sessionId: string,
  sessionDuration: number,
  device: string,
  retentionMetrics: any
): UserActiveEvent {
  return {
    id: generateEventId(),
    type: 'user_active',
    userId,
    timestamp: new Date(),
    data: {
      activityType,
      activityDetails,
      sessionContext: {
        sessionId,
        sessionDuration,
        device,
      },
      retentionMetrics,
    },
    metadata: createEventMetadata('retention'),
  };
}

export function createUserChurnRiskChangedEvent(
  userId: string,
  previousRisk: number,
  currentRisk: number,
  riskLevel: string,
  contributingFactors: any[],
  prediction: any,
  recommendedActions: any[]
): UserChurnRiskChangedEvent {
  return {
    id: generateEventId(),
    type: 'user_churn_risk_changed',
    userId,
    timestamp: new Date(),
    data: {
      previousRisk,
      currentRisk,
      riskChange: currentRisk - previousRisk,
      riskLevel,
      contributingFactors,
      prediction,
      recommendedActions,
    },
    metadata: createEventMetadata('retention'),
  };
}

export function createRetentionStrategyTriggeredEvent(
  userId: string,
  strategyId: string,
  strategyName: string,
  strategyType: string,
  triggerCondition: any,
  targetAudience: any,
  actions: any[]
): RetentionStrategyTriggeredEvent {
  return {
    id: generateEventId(),
    type: 'retention_strategy_triggered',
    userId,
    timestamp: new Date(),
    data: {
      strategyId,
      strategyName,
      strategyType,
      triggerCondition,
      targetAudience,
      actions,
      context: {
        userId,
        triggerData: {},
        environment: {},
      },
    },
    metadata: createEventMetadata('retention'),
  };
}

export function createChurnPredictionUpdatedEvent(
  userId: string,
  predictionId: string,
  churnProbability: number,
  churnTimeframe: number,
  riskFactors: any[],
  confidence: number,
  model: string,
  version: string,
  recommendations: any[]
): ChurnPredictionUpdatedEvent {
  return {
    id: generateEventId(),
    type: 'churn_prediction_updated',
    userId,
    timestamp: new Date(),
    data: {
      predictionId,
      predictionDate: new Date(),
      churnProbability,
      churnTimeframe,
      riskFactors,
      confidence,
      model,
      version,
      recommendations,
    },
    metadata: createEventMetadata('retention'),
  };
}

export function createRetentionInterventionTriggeredEvent(
  userId: string,
  interventionId: string,
  interventionType: string,
  triggerReason: string,
  triggerCondition: any,
  intervention: any
): RetentionInterventionTriggeredEvent {
  return {
    id: generateEventId(),
    type: 'retention_intervention_triggered',
    userId,
    timestamp: new Date(),
    data: {
      interventionId,
      interventionType,
      triggerReason,
      triggerCondition,
      intervention,
      targetUser: {
        userId,
        riskLevel: 'medium',
        personalized: true,
        context: {},
      },
    },
    metadata: createEventMetadata('retention'),
  };
}

// Helper Functions
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createEventMetadata(source: string): EventMetadata {
  return {
    source,
    version: '1.0.0',
    platform: getPlatform(),
  };
}

function getPlatform(): string {
  if (typeof window !== 'undefined') {
    return 'web';
  }
  // Add platform detection logic here
  return 'unknown';
}

// Event Validation
export function validateRetentionEvent(event: RetentionEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }

  if (!event.type || !event.data || !event.metadata) {
    return false;
  }

  // Add specific validation for each event type
  switch (event.type) {
    case 'user_active':
      return validateUserActiveEvent(event as UserActiveEvent);
    case 'user_churn_risk_changed':
      return validateUserChurnRiskChangedEvent(event as UserChurnRiskChangedEvent);
    case 'retention_strategy_triggered':
      return validateRetentionStrategyTriggeredEvent(event as RetentionStrategyTriggeredEvent);
    case 'churn_prediction_updated':
      return validateChurnPredictionUpdatedEvent(event as ChurnPredictionUpdatedEvent);
    default:
      return true;
  }
}

function validateUserActiveEvent(event: UserActiveEvent): boolean {
  const { data } = event;
  return !!(
    data.activityType &&
    data.activityDetails &&
    data.sessionContext &&
    data.retentionMetrics
  );
}

function validateUserChurnRiskChangedEvent(event: UserChurnRiskChangedEvent): boolean {
  const { data } = event;
  return !!(
    typeof data.previousRisk === 'number' &&
    typeof data.currentRisk === 'number' &&
    data.riskLevel &&
    data.contributingFactors &&
    data.prediction &&
    data.recommendedActions
  );
}

function validateRetentionStrategyTriggeredEvent(event: RetentionStrategyTriggeredEvent): boolean {
  const { data } = event;
  return !!(
    data.strategyId &&
    data.strategyName &&
    data.strategyType &&
    data.triggerCondition &&
    data.targetAudience &&
    data.actions &&
    data.context
  );
}

function validateChurnPredictionUpdatedEvent(event: ChurnPredictionUpdatedEvent): boolean {
  const { data } = event;
  return !!(
    data.predictionId &&
    typeof data.churnProbability === 'number' &&
    typeof data.churnTimeframe === 'number' &&
    data.riskFactors &&
    typeof data.confidence === 'number' &&
    data.model &&
    data.version &&
    data.recommendations
  );
}

// Event Serialization
export function serializeRetentionEvent(event: RetentionEventType): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp.toISOString(),
  });
}

export function deserializeRetentionEvent(data: string): RetentionEventType {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    timestamp: new Date(parsed.timestamp),
  };
}
