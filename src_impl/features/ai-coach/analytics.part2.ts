import * as Sentry from "@sentry/react-native";
import { type CoachMessage, type MessageCategory, type CoachUserState, type TriggerType, type InterventionExecution, type SessionRecommendation, type ComebackPlan } from "./schemas";


export function recordCoachMetric(userId: string, event: string, properties: Record<string, unknown> = {}): void {
  const metric: CoachMetrics = {
    userId: hashUserId(userId),
    event,
    timestamp: Date.now(),
    properties: sanitizeProperties(properties),
  };
  coachMetrics.push(metric);
  if (coachMetrics.length > 1000) {
    coachMetrics.shift();
  }
}

export function trackMessageEffectiveness(messageId: string, category: MessageCategory, userId: string, opened: boolean, actionTaken: boolean, subsequentSessionCompleted: boolean): void {
  recordCoachMetric(userId, 'message.effectiveness', {
    messageId,
    category,
    opened,
    actionTaken,
    subsequentSessionCompleted,
    effectivenessScore: calculateEffectivenessScore(opened, actionTaken, subsequentSessionCompleted),
  });
}

export function trackSessionProcessed(userId: string, sessionId: string, qualityScore: number): void {
  recordCoachMetric(userId, 'session.processed', { sessionId, qualityScore });
}

export function trackIntegrationError(operation: string, userId: string, error: unknown): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: `integration:${operation}` },
    extra: { userId: hashUserId(userId) },
  });
}

export function trackMessageGenerationError(userId: string, category: string, error: unknown): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'message-generation' },
    extra: { userId: hashUserId(userId), category },
  });
}

export function trackEventHandlerError(eventType: string, error: unknown): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'event-handler', eventType },
  });
}

export function trackInterventionEffectiveness(execution: InterventionExecution, outcome: 'success' | 'partial' | 'failure'): void {
  recordCoachMetric(execution.userId, 'intervention.effectiveness', {
    ruleId: execution.ruleId,
    interventionId: execution.id,
    outcome,
    hasUserResponse: execution.userResponse !== null,
  });
}

export function trackComebackProgress(plan: ComebackPlan, sessionCompleted: boolean): void {
  recordCoachMetric(plan.userId, 'comeback.progress', {
    comebackId: plan.id,
    sessionsCompleted: plan.sessionsCompleted,
    targetSessions: plan.targetSessions,
    progressPercent: (plan.sessionsCompleted / plan.targetSessions) * 100,
    sessionJustCompleted: sessionCompleted,
  });
}

export function trackCoachEngagement(userId: string, engagementType: 'opened' | 'dismissed' | 'interacted' | 'muted'): void {
  recordCoachMetric(userId, 'engagement', { type: engagementType });
}

export function trackPersonalizationAccuracy(userId: string, recommendationType: string, wasAccepted: boolean, confidenceAtGeneration: number): void {
  recordCoachMetric(userId, 'personalization.accuracy', {
    recommendationType,
    wasAccepted,
    confidenceAtGeneration,
    accuracyDelta: wasAccepted ? confidenceAtGeneration : 1 - confidenceAtGeneration,
  });
}

export function getCoachAggregateMetrics(): {
  totalMessages: number;
  deliveryRate: number;
  engagementRate: number;
  topCategories: Array<{ category: string; count: number }>;
} {
  const messages = coachMetrics.filter((m) => m.event.startsWith('message.'));
  const totalMessages = messages.length;
  const delivered = messages.filter((m) => m.properties.delivered === true).length;
  const deliveryRate = totalMessages > 0 ? delivered / totalMessages : 0;
  const engaged = messages.filter((m) => m.properties.actionTaken === true).length;
  const engagementRate = delivered > 0 ? engaged / delivered : 0;
  const categoryCounts = new Map();
  messages.forEach((m) => {
    const category = m.properties.category as string;
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }
  });
  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  return { totalMessages, deliveryRate, engagementRate, topCategories };
}

export function exportCoachMetrics(): CoachMetrics[] {
  return [...coachMetrics];
}

export function clearCoachMetrics(): void {
  coachMetrics.length = 0;
}