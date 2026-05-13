import { RetentionEvent } from "./types";


export function createUserActiveEvent(userId: string, activityType: 'session_start' | 'feature_use' | 'social_interaction' | 'achievement' | 'purchase', activityDetails: DynamicValue, sessionId: string, sessionDuration: number, device: string, retentionMetrics: DynamicValue): UserActiveEvent {
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

export function createUserChurnRiskChangedEvent(userId: string, previousRisk: number, currentRisk: number, riskLevel: 'low' | 'medium' | 'high' | 'critical', contributingFactors: DynamicValue[], prediction: DynamicValue, recommendedActions: DynamicValue[]): UserChurnRiskChangedEvent {
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

export function createRetentionStrategyTriggeredEvent(userId: string, strategyId: string, strategyName: string, strategyType: string, triggerCondition: DynamicValue, targetAudience: DynamicValue, actions: DynamicValue[]): RetentionStrategyTriggeredEvent {
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

export function createChurnPredictionUpdatedEvent(userId: string, predictionId: string, churnProbability: number, churnTimeframe: number, riskFactors: DynamicValue[], confidence: number, model: string, version: string, recommendations: DynamicValue[]): ChurnPredictionUpdatedEvent {
  return {
    id: generateEventId(),
    type: 'churn_prediction_updated',
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
    metadata: createEventMetadata('retention'),
  };
}

export function createRetentionInterventionTriggeredEvent(userId: string, interventionId: string, interventionType: 'reactivation' | 'engagement' | 'incentive' | 'support' | 'education', triggerReason: string, triggerCondition: DynamicValue, intervention: DynamicValue): RetentionInterventionTriggeredEvent {
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