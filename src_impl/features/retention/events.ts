/**
 * Retention Feature Events
 *
 * Event definitions for user retention, engagement, and churn prevention features.
 */

import { RetentionEvent } from './types';

// Base Event Interface
// User Activity Events
// Strategy Events
// Cohort Events
// Experiment Events
// Prediction Events
// Intervention Events
// Lifecycle Events
// Analytics Events
// System Events
// Union Type for All Retention Events
// Event Factory Functions
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

function validateUserActiveEvent(event: UserActiveEvent): boolean {
  const { data } = event;
  return !!(data.activityType && data.activityDetails && data.sessionContext && data.retentionMetrics);
}

function validateUserChurnRiskChangedEvent(event: UserChurnRiskChangedEvent): boolean {
  const { data } = event;
  return !!(typeof data.previousRisk === 'number' && typeof data.currentRisk === 'number' && data.riskLevel && data.contributingFactors && data.prediction && data.recommendedActions);
}

function validateRetentionStrategyTriggeredEvent(event: RetentionStrategyTriggeredEvent): boolean {
  const { data } = event;
  return !!(data.strategyId && data.strategyName && data.strategyType && data.triggerCondition && data.targetAudience && data.actions && data.context);
}

function validateChurnPredictionUpdatedEvent(event: ChurnPredictionUpdatedEvent): boolean {
  const { data } = event;
  return !!(data.predictionId && typeof data.churnProbability === 'number' && typeof data.churnTimeframe === 'number' && data.riskFactors && typeof data.confidence === 'number' && data.model && data.version && data.recommendations);
}

// Event Serialization
export * from "./events.types";
export * from "./events.part1";
