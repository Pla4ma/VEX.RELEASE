import * as Sentry from "@sentry/react-native";
import {
  type CoachMessage,
  type MessageCategory,
  type CoachUserState,
  type TriggerType,
  type SessionRecommendation,
} from "./schemas";
import type { InterventionType } from "./analytics-types";
import { hashUserId, sanitizeContext } from "./analytics-helpers";

export function trackStateChange(
  userId: string,
  previousState: CoachUserState | null,
  newState: CoachUserState,
  context?: Record<string, unknown>,
): void {
  Sentry.addBreadcrumb({
    category: "coach.state",
    message: `Coach state changed: ${previousState} -> ${newState}`,
    level: "info",
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
    category: "coach.message",
    message: `Generated ${message.category} message`,
    level: "info",
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
    category: "coach.delivery",
    message: `Message delivered via ${deliveryMethod}`,
    level: "info",
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
    category: "coach.action",
    message: `User ${action} on message`,
    level: "info",
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
    category: "coach.intervention",
    message: `Intervention triggered: ${trigger}`,
    level: "info",
    data: { userId: hashUserId(userId), ruleId, trigger, action },
  });
}
export function trackInterventionDisplayed(
  userId: string,
  interventionType: InterventionType,
  hoursRemaining?: number,
): void {
  Sentry.addBreadcrumb({
    category: "coach.intervention",
    message: `Intervention displayed: ${interventionType}`,
    level: "info",
    data: { userId: hashUserId(userId), interventionType, hoursRemaining },
  });
}
export function trackInterventionActioned(
  userId: string,
  interventionType: InterventionType,
  actionLabel: string,
): void {
  Sentry.addBreadcrumb({
    category: "coach.intervention",
    message: `Intervention actioned: ${interventionType}`,
    level: "info",
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
    category: "coach.risk",
    message: `Streak risk detected: ${riskLevel}`,
    level: riskLevel === "CRITICAL" ? "warning" : "info",
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
    category: "coach.comeback",
    message: "Comeback mode activated",
    level: "info",
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
    category: "coach.recommendation",
    message: `Recommendation generated: ${recommendation.recommendationType}`,
    level: "info",
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
    category: "coach.difficulty",
    message: `Difficulty adjusted: ${previousDifficulty} -> ${newDifficulty}`,
    level: "info",
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
    category: "coach.behavior",
    message: `Behavior signal: ${signalType}`,
    level: "info",
    data: { userId: hashUserId(userId), signalType, value, confidence },
  });
}
