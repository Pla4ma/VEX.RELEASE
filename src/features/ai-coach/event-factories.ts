import { z } from "zod";
import {
  MessageCategorySchema,
  TriggerTypeSchema,
  CoachUserStateSchema,

} from "./schemas";
import { BehaviorSignalDetectedEventSchema } from "./event-schemas";
import type {
  CoachMessageGeneratedEvent,
  CoachStateChangedEvent,
  StreakRiskDetectedEvent,
  ComebackActivatedEvent,
  BehaviorSignalDetectedEvent,
  InterventionTriggeredEvent,
} from "./event-schemas";

export function createCoachMessageGeneratedEvent(
  userId: string,
  messageId: string,
  category: string,
  content: string,
  priority: number,
  deliveryMethod: string,
): CoachMessageGeneratedEvent {
  return {
    userId,
    messageId,
    category: MessageCategorySchema.parse(category),
    content,
    priority,
    deliveryMethod: z
      .enum(["IN_APP", "PUSH", "BOTH", "DEFERRED"])
      .parse(deliveryMethod),
    timestamp: Date.now(),
  };
}

export function createCoachStateChangedEvent(
  userId: string,
  previousState: string | null,
  newState: string,
  context?: Record<string, unknown>,
): CoachStateChangedEvent {
  return {
    userId,
    previousState:
      previousState === null ? null : CoachUserStateSchema.parse(previousState),
    newState: CoachUserStateSchema.parse(newState),
    enteredAt: Date.now(),
    context,
  };
}

export function createStreakRiskDetectedEvent(
  userId: string,
  currentStreak: number,
  hoursSinceLastSession: number,
  riskLevel: string,
): StreakRiskDetectedEvent {
  return {
    userId,
    currentStreak,
    hoursSinceLastSession,
    riskLevel: z
      .enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
      .parse(riskLevel),
    detectedAt: Date.now(),
  };
}

export function createComebackActivatedEvent(
  userId: string,
  comebackId: string,
  previousStreak: number,
  daysInactive: number,
  bonusMultiplier: number,
): ComebackActivatedEvent {
  return {
    userId,
    comebackId,
    previousStreak,
    daysInactive,
    bonusMultiplier,
    activatedAt: Date.now(),
  };
}

export function createBehaviorSignalDetectedEvent(
  userId: string,
  signalType: string,
  value: number,
  confidence: number,
): BehaviorSignalDetectedEvent {
  return {
    userId,
    signalType:
      BehaviorSignalDetectedEventSchema.shape.signalType.parse(signalType),
    value,
    confidence,
    timestamp: Date.now(),
  };
}

export function createStateTransitionEvent(
  userId: string,
  previousState: string,
  newState: string,
  context?: Record<string, unknown>,
): CoachStateChangedEvent {
  return {
    userId,
    previousState: CoachUserStateSchema.parse(previousState),
    newState: CoachUserStateSchema.parse(newState),
    enteredAt: Date.now(),
    context,
  };
}

export function createInterventionExecutedEvent(
  userId: string,
  interventionId: string,
  ruleId: string,
  trigger: string,
  action: string,
): InterventionTriggeredEvent {
  return {
    userId,
    interventionId,
    ruleId,
    trigger: TriggerTypeSchema.parse(trigger),
    action,
    timestamp: Date.now(),
  };
}
