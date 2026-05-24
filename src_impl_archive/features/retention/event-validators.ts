import {
  UserActiveEvent,
  UserChurnRiskChangedEvent,
  RetentionStrategyTriggeredEvent,
  ChurnPredictionUpdatedEvent,
  RetentionEventType,
} from "./types";

export function validateRetentionEvent(event: RetentionEventType): boolean {
  if (!event.id || !event.userId || !event.timestamp) {
    return false;
  }
  if (!event.type || !event.data || !event.metadata) {
    return false;
  }
  switch (event.type) {
    case "user_active":
      return validateUserActiveEvent(event as UserActiveEvent);
    case "user_churn_risk_changed":
      return validateUserChurnRiskChangedEvent(
        event as UserChurnRiskChangedEvent,
      );
    case "retention_strategy_triggered":
      return validateRetentionStrategyTriggeredEvent(
        event as RetentionStrategyTriggeredEvent,
      );
    case "churn_prediction_updated":
      return validateChurnPredictionUpdatedEvent(
        event as ChurnPredictionUpdatedEvent,
      );
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
function validateUserChurnRiskChangedEvent(
  event: UserChurnRiskChangedEvent,
): boolean {
  const { data } = event;
  return !!(
    typeof data.previousRisk === "number" &&
    typeof data.currentRisk === "number" &&
    data.riskLevel &&
    data.contributingFactors &&
    data.prediction &&
    data.recommendedActions
  );
}
function validateRetentionStrategyTriggeredEvent(
  event: RetentionStrategyTriggeredEvent,
): boolean {
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
function validateChurnPredictionUpdatedEvent(
  event: ChurnPredictionUpdatedEvent,
): boolean {
  const { data } = event;
  return !!(
    data.predictionId &&
    typeof data.churnProbability === "number" &&
    typeof data.churnTimeframe === "number" &&
    data.riskFactors &&
    typeof data.confidence === "number" &&
    data.model &&
    data.version &&
    data.recommendations
  );
}
export function serializeRetentionEvent(event: RetentionEventType): string {
  return JSON.stringify({ ...event, timestamp: event.timestamp.toISOString() });
}
export function deserializeRetentionEvent(data: string): RetentionEventType {
  const parsed = JSON.parse(data);
  return { ...parsed, timestamp: new Date(parsed.timestamp) };
}
