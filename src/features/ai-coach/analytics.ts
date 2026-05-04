import * as Sentry from '@sentry/react-native';
import {
  type CoachMessage,
  type MessageCategory,
  type CoachUserState,
  type TriggerType,
  type InterventionExecution,
  type SessionRecommendation,
  type ComebackPlan,
} from './schemas';
export function trackStateChange(
  userId: string,
  previousState: CoachUserState | null,
  newState: CoachUserState,
  context?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.state',
    message: `Coach state changed: ${previousState} -> ${newState}`,
    level: 'info',
    data: {
      userId: hashUserId(userId),
      previousState,
      newState,
      context: sanitizeContext(context),
    },
  });
}
export function trackMessageGenerated(
  userId: string,
  message: CoachMessage,
  templateMatched: boolean,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.message',
    message: `Generated ${message.category} message`,
    level: 'info',
    data: {
      userId: hashUserId(userId),
      messageId: message.id,
      category: message.category,
      priority: message.priority,
      deliveryMethod: message.deliveryMethod,
      templateMatched,
    },
  });
}
export function trackMessageDelivered(
  userId: string,
  messageId: string,
  category: MessageCategory,
  deliveryMethod: string,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.delivery',
    message: `Message delivered via ${deliveryMethod}`,
    level: 'info',
    data: { userId: hashUserId(userId), messageId, category, deliveryMethod },
  });
}
export function trackMessageAction(
  userId: string,
  messageId: string,
  action: string,
  timeToAction?: number,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.action',
    message: `User ${action} on message`,
    level: 'info',
    data: {
      userId: hashUserId(userId),
      messageId,
      action,
      timeToActionSeconds: timeToAction,
    },
  });
}
export function trackInterventionTriggered(
  userId: string,
  ruleId: string,
  trigger: TriggerType,
  action: string,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.intervention',
    message: `Intervention triggered: ${trigger}`,
    level: 'info',
    data: { userId: hashUserId(userId), ruleId, trigger, action },
  });
}

type InterventionType = 'BURNOUT' | 'PLATEAU' | 'STREAK_RISK' | 'BOSS_FINISH';

export function trackInterventionDisplayed(
  userId: string,
  interventionType: InterventionType,
  hoursRemaining?: number,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.intervention',
    message: `Intervention displayed: ${interventionType}`,
    level: 'info',
    data: { userId: hashUserId(userId), interventionType, hoursRemaining },
  });
}

export function trackInterventionActioned(
  userId: string,
  interventionType: InterventionType,
  actionLabel: string,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.intervention',
    message: `Intervention actioned: ${interventionType}`,
    level: 'info',
    data: { userId: hashUserId(userId), interventionType, actionLabel },
  });
}

export function trackStreakRiskDetected(
  userId: string,
  currentStreak: number,
  riskLevel: string,
  hoursSinceLastSession: number,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.risk',
    message: `Streak risk detected: ${riskLevel}`,
    level: riskLevel === 'CRITICAL' ? 'warning' : 'info',
    data: {
      userId: hashUserId(userId),
      currentStreak,
      riskLevel,
      hoursSinceLastSession,
    },
  });
}
export function trackComebackActivated(
  userId: string,
  comebackId: string,
  previousStreak: number,
  daysInactive: number,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.comeback',
    message: 'Comeback mode activated',
    level: 'info',
    data: {
      userId: hashUserId(userId),
      comebackId,
      previousStreak,
      daysInactive,
    },
  });
}
export function trackRecommendationGenerated(
  userId: string,
  recommendation: SessionRecommendation,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.recommendation',
    message: `Recommendation generated: ${recommendation.recommendationType}`,
    level: 'info',
    data: {
      userId: hashUserId(userId),
      recommendationId: recommendation.id,
      type: recommendation.recommendationType,
      confidence: recommendation.confidence,
    },
  });
}
export function trackDifficultyAdjusted(
  userId: string,
  previousDifficulty: number,
  newDifficulty: number,
  reason: string,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.difficulty',
    message: `Difficulty adjusted: ${previousDifficulty} -> ${newDifficulty}`,
    level: 'info',
    data: {
      userId: hashUserId(userId),
      previousDifficulty,
      newDifficulty,
      reason,
    },
  });
}
export function trackBehaviorSignal(
  userId: string,
  signalType: string,
  value: number,
  confidence: number,
): void {
  Sentry.addBreadcrumb({
    category: 'coach.behavior',
    message: `Behavior signal: ${signalType}`,
    level: 'info',
    data: { userId: hashUserId(userId), signalType, value, confidence },
  });
}
export function trackCoachError(
  operation: string,
  error: unknown,
  userId?: string,
  context?: Record<string, unknown>,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation },
    extra: {
      userId: userId ? hashUserId(userId) : undefined,
      context: sanitizeContext(context),
    },
  });
}
export function trackDeliveryFailure(
  messageId: string,
  userId: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'message-delivery' },
    extra: { messageId, userId: hashUserId(userId) },
  });
}
export function trackInterventionFailure(
  ruleId: string,
  userId: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'intervention-execution' },
    extra: { ruleId, userId: hashUserId(userId) },
  });
}
interface CoachMetrics {
  userId: string;
  event: string;
  timestamp: number;
  properties: Record<string, unknown>;
}
const coachMetrics: CoachMetrics[] = [];
export function recordCoachMetric(
  userId: string,
  event: string,
  properties: Record<string, unknown> = {},
): void {
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
export function trackMessageEffectiveness(
  messageId: string,
  category: MessageCategory,
  userId: string,
  opened: boolean,
  actionTaken: boolean,
  subsequentSessionCompleted: boolean,
): void {
  recordCoachMetric(userId, 'message.effectiveness', {
    messageId,
    category,
    opened,
    actionTaken,
    subsequentSessionCompleted,
    effectivenessScore: calculateEffectivenessScore(
      opened,
      actionTaken,
      subsequentSessionCompleted,
    ),
  });
}
function calculateEffectivenessScore(
  opened: boolean,
  actionTaken: boolean,
  sessionCompleted: boolean,
): number {
  let score = 0;
  if (opened) {score += 0.3;}
  if (actionTaken) {score += 0.4;}
  if (sessionCompleted) {score += 0.3;}
  return score;
}
export function trackSessionProcessed(
  userId: string,
  sessionId: string,
  qualityScore: number,
): void {
  recordCoachMetric(userId, 'session.processed', { sessionId, qualityScore });
}
export function trackIntegrationError(
  operation: string,
  userId: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: `integration:${operation}` },
    extra: { userId: hashUserId(userId) },
  });
}
export function trackMessageGenerationError(
  userId: string,
  category: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'message-generation' },
    extra: { userId: hashUserId(userId), category },
  });
}
export function trackEventHandlerError(
  eventType: string,
  error: unknown,
): void {
  Sentry.captureException(error, {
    tags: { feature: 'ai-coach', operation: 'event-handler', eventType },
  });
}
export function trackInterventionEffectiveness(
  execution: InterventionExecution,
  outcome: 'success' | 'partial' | 'failure',
): void {
  recordCoachMetric(execution.userId, 'intervention.effectiveness', {
    ruleId: execution.ruleId,
    interventionId: execution.id,
    outcome,
    hasUserResponse: execution.userResponse !== null,
  });
}
export function trackComebackProgress(
  plan: ComebackPlan,
  sessionCompleted: boolean,
): void {
  recordCoachMetric(plan.userId, 'comeback.progress', {
    comebackId: plan.id,
    sessionsCompleted: plan.sessionsCompleted,
    targetSessions: plan.targetSessions,
    progressPercent: (plan.sessionsCompleted / plan.targetSessions) * 100,
    sessionJustCompleted: sessionCompleted,
  });
}
export function trackCoachEngagement(
  userId: string,
  engagementType: 'opened' | 'dismissed' | 'interacted' | 'muted',
): void {
  recordCoachMetric(userId, 'engagement', { type: engagementType });
}
export function trackPersonalizationAccuracy(
  userId: string,
  recommendationType: string,
  wasAccepted: boolean,
  confidenceAtGeneration: number,
): void {
  recordCoachMetric(userId, 'personalization.accuracy', {
    recommendationType,
    wasAccepted,
    confidenceAtGeneration,
    accuracyDelta: wasAccepted
      ? confidenceAtGeneration
      : 1 - confidenceAtGeneration,
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
  const delivered = messages.filter(
    (m) => m.properties.delivered === true,
  ).length;
  const deliveryRate = totalMessages > 0 ? delivered / totalMessages : 0;
  const engaged = messages.filter(
    (m) => m.properties.actionTaken === true,
  ).length;
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
function hashUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(16)}`;
}
function sanitizeContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!context) {return undefined;}
  const sensitiveKeys = ['email', 'name', 'phone', 'address', 'ip', 'location'];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
function sanitizeProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const sensitiveKeys = [
    'email',
    'name',
    'phone',
    'address',
    'content',
    'message',
  ];
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      if (key === 'content' || key === 'message') {
        sanitized[key] = '[CONTENT_REDACTED]';
      } else {
        sanitized[key] = '[REDACTED]';
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
export function exportCoachMetrics(): CoachMetrics[] {
  return [...coachMetrics];
}
export function clearCoachMetrics(): void {
  coachMetrics.length = 0;
}
