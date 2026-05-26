import {
  UserActiveEvent,
  UserChurnRiskChangedEvent,
  RetentionStrategyTriggeredEvent,
  ChurnPredictionUpdatedEvent,
  RetentionInterventionTriggeredEvent,
  EventMetadata,
  DeviceInfo,
} from "./types";

export function createUserActiveEvent(
  userId: string,
  activityType:
    | "session_start"
    | "feature_use"
    | "social_interaction"
    | "achievement"
    | "purchase",
  activityDetails: UserActiveEvent['data']['activityDetails'],
  sessionId: string,
  sessionDuration: number,
  device: string,
  retentionMetrics: UserActiveEvent['data']['retentionMetrics'],
): UserActiveEvent {
  return {
    id: generateEventId(),
    type: "user_active",
    userId,
    timestamp: new Date(),
    data: {
      activityType,
      activityDetails,
      sessionContext: { sessionId, sessionDuration, device },
      retentionMetrics,
    },
    metadata: createEventMetadata("retention"),
  };
}
export function createUserChurnRiskChangedEvent(
  userId: string,
  previousRisk: number,
  currentRisk: number,
  riskLevel: "low" | "medium" | "high" | "critical",
  contributingFactors: UserChurnRiskChangedEvent['data']['contributingFactors'],
  prediction: UserChurnRiskChangedEvent['data']['prediction'],
  recommendedActions: UserChurnRiskChangedEvent['data']['recommendedActions'],
): UserChurnRiskChangedEvent {
  return {
    id: generateEventId(),
    type: "user_churn_risk_changed",
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
    metadata: createEventMetadata("retention"),
  };
}
export function createRetentionStrategyTriggeredEvent(
  userId: string,
  strategyId: string,
  strategyName: string,
  strategyType: string,
  triggerCondition: RetentionStrategyTriggeredEvent['data']['triggerCondition'],
  targetAudience: RetentionStrategyTriggeredEvent['data']['targetAudience'],
  actions: RetentionStrategyTriggeredEvent['data']['actions'],
): RetentionStrategyTriggeredEvent {
  return {
    id: generateEventId(),
    type: "retention_strategy_triggered",
    userId,
    timestamp: new Date(),
    data: {
      strategyId,
      strategyName,
      strategyType,
      triggerCondition,
      targetAudience,
      actions,
      context: { userId, triggerData: {}, environment: {} },
    },
    metadata: createEventMetadata("retention"),
  };
}
export function createChurnPredictionUpdatedEvent(
  userId: string,
  predictionId: string,
  churnProbability: number,
  churnTimeframe: number,
  riskFactors: ChurnPredictionUpdatedEvent['data']['riskFactors'],
  confidence: number,
  model: string,
  version: string,
  recommendations: ChurnPredictionUpdatedEvent['data']['recommendations'],
): ChurnPredictionUpdatedEvent {
  return {
    id: generateEventId(),
    type: "churn_prediction_updated",
    userId,
    timestamp: new Date(),
    data: {
      userId,
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
    metadata: createEventMetadata("retention"),
  };
}
export function createRetentionInterventionTriggeredEvent(
  userId: string,
  interventionId: string,
  interventionType:
    | "reactivation"
    | "engagement"
    | "incentive"
    | "support"
    | "education",
  triggerReason: string,
  triggerCondition: RetentionInterventionTriggeredEvent['data']['triggerCondition'],
  intervention: RetentionInterventionTriggeredEvent['data']['intervention'],
): RetentionInterventionTriggeredEvent {
  return {
    id: generateEventId(),
    type: "retention_intervention_triggered",
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
        riskLevel: "medium",
        personalized: true,
        context: {},
      },
    },
    metadata: createEventMetadata("retention"),
  };
}
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function createEventMetadata(source: string): EventMetadata {
  return { source, version: "1.0.0", platform: getPlatform() };
}
function getPlatform(): string {
  if (typeof window !== "undefined") {
    return "web";
  }
  return "unknown";
}
