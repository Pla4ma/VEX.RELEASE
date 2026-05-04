/**
 * AI Coach Feature - Event Definitions
 *
 * Event definitions for cross-feature communication
 * Subscriptions handled in integration layer
 */

import { z } from 'zod';
import {
  MessageCategorySchema,
  TriggerTypeSchema,
  RecommendationTypeSchema,
  CoachUserStateSchema,
} from './schemas';

// ============================================================================
// Event Schemas
// ============================================================================

export const CoachMessageGeneratedEventSchema = z.object({
  userId: z.string().uuid(),
  messageId: z.string().uuid(),
  category: MessageCategorySchema,
  content: z.string(),
  priority: z.number(),
  deliveryMethod: z.enum(['IN_APP', 'PUSH', 'BOTH', 'DEFERRED']),
  timestamp: z.number(),
});

export const CoachMessageDeliveredEventSchema = z.object({
  userId: z.string().uuid(),
  messageId: z.string().uuid(),
  category: MessageCategorySchema,
  deliveredAt: z.number(),
});

export const CoachMessageActionTakenEventSchema = z.object({
  userId: z.string().uuid(),
  messageId: z.string().uuid(),
  action: z.string(),
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
});

export const CoachStateChangedEventSchema = z.object({
  userId: z.string().uuid(),
  previousState: CoachUserStateSchema.nullable(),
  newState: CoachUserStateSchema,
  enteredAt: z.number(),
  context: z.record(z.unknown()).optional(),
});

export const InterventionTriggeredEventSchema = z.object({
  userId: z.string().uuid(),
  interventionId: z.string().uuid(),
  ruleId: z.string().uuid(),
  trigger: TriggerTypeSchema,
  action: z.string(),
  timestamp: z.number(),
});

export const BehaviorSignalDetectedEventSchema = z.object({
  userId: z.string().uuid(),
  signalType: z.enum([
    'SESSION_FREQUENCY',
    'SESSION_QUALITY_TREND',
    'STREAK_MAINTENANCE_RATE',
    'PREFERRED_TIME_OF_DAY',
    'FOCUS_DURATION_PREFERENCE',
    'DIFFICULTY_PREFERENCE',
    'SOCIAL_ENGAGEMENT',
    'CHALLENGE_COMPLETION_RATE',
    'BOSS_PARTICIPATION',
    'MORNING_PERSON',
    'NIGHT_OWL',
    'WEEKEND_WARRIOR',
    'CONSISTENCY_SCORE',
    'RESPONSIVENESS_TO_REMINDERS',
    'COMEBACK_VELOCITY',
  ]),
  value: z.number(),
  confidence: z.number(),
  timestamp: z.number(),
});

export const StreakRiskDetectedEventSchema = z.object({
  userId: z.string().uuid(),
  currentStreak: z.number(),
  hoursSinceLastSession: z.number(),
  riskLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  detectedAt: z.number(),
});

export const ComebackActivatedEventSchema = z.object({
  userId: z.string().uuid(),
  comebackId: z.string().uuid(),
  previousStreak: z.number(),
  daysInactive: z.number(),
  bonusMultiplier: z.number(),
  activatedAt: z.number(),
});

export const ComebackCompletedEventSchema = z.object({
  userId: z.string().uuid(),
  comebackId: z.string().uuid(),
  sessionsCompleted: z.number(),
  bonusXpEarned: z.number().optional(),
  completedAt: z.number(),
});

export const RecommendationGeneratedEventSchema = z.object({
  userId: z.string().uuid(),
  recommendationId: z.string().uuid(),
  type: RecommendationTypeSchema,
  suggestedDuration: z.number(),
  suggestedDifficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH']),
  reasoning: z.string(),
  generatedAt: z.number(),
});

export const DifficultyAdjustedEventSchema = z.object({
  userId: z.string().uuid(),
  previousDifficulty: z.number(),
  newDifficulty: z.number(),
  reason: z.string(),
  adjustedAt: z.number(),
});

export const CoachPreferencesUpdatedEventSchema = z.object({
  userId: z.string().uuid(),
  personaId: z.string().uuid().optional(),
  mutedCategories: z.array(MessageCategorySchema).optional(),
  reduceNotifications: z.boolean().optional(),
  updatedAt: z.number(),
});

// ============================================================================
// Event Types
// ============================================================================

export type CoachMessageGeneratedEvent = z.infer<typeof CoachMessageGeneratedEventSchema>;
export type CoachMessageDeliveredEvent = z.infer<typeof CoachMessageDeliveredEventSchema>;
export type CoachMessageActionTakenEvent = z.infer<typeof CoachMessageActionTakenEventSchema>;
export type CoachStateChangedEvent = z.infer<typeof CoachStateChangedEventSchema>;
export type InterventionTriggeredEvent = z.infer<typeof InterventionTriggeredEventSchema>;
export type BehaviorSignalDetectedEvent = z.infer<typeof BehaviorSignalDetectedEventSchema>;
export type StreakRiskDetectedEvent = z.infer<typeof StreakRiskDetectedEventSchema>;
export type ComebackActivatedEvent = z.infer<typeof ComebackActivatedEventSchema>;
export type ComebackCompletedEvent = z.infer<typeof ComebackCompletedEventSchema>;
export type RecommendationGeneratedEvent = z.infer<typeof RecommendationGeneratedEventSchema>;
export type DifficultyAdjustedEvent = z.infer<typeof DifficultyAdjustedEventSchema>;
export type CoachPreferencesUpdatedEvent = z.infer<typeof CoachPreferencesUpdatedEventSchema>;

// ============================================================================
// Event Channel Names
// ============================================================================

export const AI_COACH_EVENT_CHANNELS = {
  MESSAGE_GENERATED: 'coach:messageGenerated',
  MESSAGE_DELIVERED: 'coach:messageDelivered',
  MESSAGE_ACTION_TAKEN: 'coach:messageActionTaken',
  STATE_CHANGED: 'coach:stateChanged',
  INTERVENTION_TRIGGERED: 'coach:interventionTriggered',
  BEHAVIOR_SIGNAL_DETECTED: 'coach:behaviorSignalDetected',
  STREAK_RISK_DETECTED: 'coach:streakRiskDetected',
  COMEBACK_ACTIVATED: 'coach:comebackActivated',
  COMEBACK_COMPLETED: 'coach:comebackCompleted',
  RECOMMENDATION_GENERATED: 'coach:recommendationGenerated',
  DIFFICULTY_ADJUSTED: 'coach:difficultyAdjusted',
  PREFERENCES_UPDATED: 'coach:preferencesUpdated',
} as const;

// ============================================================================
// Event Payload Map
// ============================================================================

export interface AICoachEventPayloadMap {
  [AI_COACH_EVENT_CHANNELS.MESSAGE_GENERATED]: CoachMessageGeneratedEvent;
  [AI_COACH_EVENT_CHANNELS.MESSAGE_DELIVERED]: CoachMessageDeliveredEvent;
  [AI_COACH_EVENT_CHANNELS.MESSAGE_ACTION_TAKEN]: CoachMessageActionTakenEvent;
  [AI_COACH_EVENT_CHANNELS.STATE_CHANGED]: CoachStateChangedEvent;
  [AI_COACH_EVENT_CHANNELS.INTERVENTION_TRIGGERED]: InterventionTriggeredEvent;
  [AI_COACH_EVENT_CHANNELS.BEHAVIOR_SIGNAL_DETECTED]: BehaviorSignalDetectedEvent;
  [AI_COACH_EVENT_CHANNELS.STREAK_RISK_DETECTED]: StreakRiskDetectedEvent;
  [AI_COACH_EVENT_CHANNELS.COMEBACK_ACTIVATED]: ComebackActivatedEvent;
  [AI_COACH_EVENT_CHANNELS.COMEBACK_COMPLETED]: ComebackCompletedEvent;
  [AI_COACH_EVENT_CHANNELS.RECOMMENDATION_GENERATED]: RecommendationGeneratedEvent;
  [AI_COACH_EVENT_CHANNELS.DIFFICULTY_ADJUSTED]: DifficultyAdjustedEvent;
  [AI_COACH_EVENT_CHANNELS.PREFERENCES_UPDATED]: CoachPreferencesUpdatedEvent;
}

// ============================================================================
// Validation Functions
// ============================================================================

export function validateCoachMessageGeneratedEvent(
  payload: unknown
): CoachMessageGeneratedEvent {
  return CoachMessageGeneratedEventSchema.parse(payload);
}

export function validateCoachMessageDeliveredEvent(
  payload: unknown
): CoachMessageDeliveredEvent {
  return CoachMessageDeliveredEventSchema.parse(payload);
}

export function validateCoachMessageActionTakenEvent(
  payload: unknown
): CoachMessageActionTakenEvent {
  return CoachMessageActionTakenEventSchema.parse(payload);
}

export function validateCoachStateChangedEvent(
  payload: unknown
): CoachStateChangedEvent {
  return CoachStateChangedEventSchema.parse(payload);
}

export function validateInterventionTriggeredEvent(
  payload: unknown
): InterventionTriggeredEvent {
  return InterventionTriggeredEventSchema.parse(payload);
}

export function validateBehaviorSignalDetectedEvent(
  payload: unknown
): BehaviorSignalDetectedEvent {
  return BehaviorSignalDetectedEventSchema.parse(payload);
}

export function validateStreakRiskDetectedEvent(
  payload: unknown
): StreakRiskDetectedEvent {
  return StreakRiskDetectedEventSchema.parse(payload);
}

export function validateComebackActivatedEvent(
  payload: unknown
): ComebackActivatedEvent {
  return ComebackActivatedEventSchema.parse(payload);
}

export function validateComebackCompletedEvent(
  payload: unknown
): ComebackCompletedEvent {
  return ComebackCompletedEventSchema.parse(payload);
}

export function validateRecommendationGeneratedEvent(
  payload: unknown
): RecommendationGeneratedEvent {
  return RecommendationGeneratedEventSchema.parse(payload);
}

export function validateDifficultyAdjustedEvent(
  payload: unknown
): DifficultyAdjustedEvent {
  return DifficultyAdjustedEventSchema.parse(payload);
}

export function validateCoachPreferencesUpdatedEvent(
  payload: unknown
): CoachPreferencesUpdatedEvent {
  return CoachPreferencesUpdatedEventSchema.parse(payload);
}

// ============================================================================
// Event Factory Functions
// ============================================================================

export function createCoachMessageGeneratedEvent(
  userId: string,
  messageId: string,
  category: string,
  content: string,
  priority: number,
  deliveryMethod: string
): CoachMessageGeneratedEvent {
  return {
    userId,
    messageId,
    category: MessageCategorySchema.parse(category),
    content,
    priority,
    deliveryMethod: z.enum(['IN_APP', 'PUSH', 'BOTH', 'DEFERRED']).parse(deliveryMethod),
    timestamp: Date.now(),
  };
}

export function createCoachStateChangedEvent(
  userId: string,
  previousState: string | null,
  newState: string,
  context?: Record<string, unknown>
): CoachStateChangedEvent {
  return {
    userId,
    previousState: previousState === null ? null : CoachUserStateSchema.parse(previousState),
    newState: CoachUserStateSchema.parse(newState),
    enteredAt: Date.now(),
    context,
  };
}

export function createStreakRiskDetectedEvent(
  userId: string,
  currentStreak: number,
  hoursSinceLastSession: number,
  riskLevel: string
): StreakRiskDetectedEvent {
  return {
    userId,
    currentStreak,
    hoursSinceLastSession,
    riskLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).parse(riskLevel),
    detectedAt: Date.now(),
  };
}

export function createComebackActivatedEvent(
  userId: string,
  comebackId: string,
  previousStreak: number,
  daysInactive: number,
  bonusMultiplier: number
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
  confidence: number
): BehaviorSignalDetectedEvent {
  return {
    userId,
    signalType: BehaviorSignalDetectedEventSchema.shape.signalType.parse(signalType),
    value,
    confidence,
    timestamp: Date.now(),
  };
}

export function createStateTransitionEvent(
  userId: string,
  previousState: string,
  newState: string,
  context?: Record<string, unknown>
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
  action: string
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

// ============================================================================
// Event Handlers Type Definition
// ============================================================================

export type AICoachEventHandler<T extends keyof AICoachEventPayloadMap> = (
  payload: AICoachEventPayloadMap[T]
) => void | Promise<void>;

export interface AICoachEventHandlers {
  onMessageGenerated?: AICoachEventHandler<'coach:messageGenerated'>;
  onMessageDelivered?: AICoachEventHandler<'coach:messageDelivered'>;
  onMessageActionTaken?: AICoachEventHandler<'coach:messageActionTaken'>;
  onStateChanged?: AICoachEventHandler<'coach:stateChanged'>;
  onInterventionTriggered?: AICoachEventHandler<'coach:interventionTriggered'>;
  onBehaviorSignalDetected?: AICoachEventHandler<'coach:behaviorSignalDetected'>;
  onStreakRiskDetected?: AICoachEventHandler<'coach:streakRiskDetected'>;
  onComebackActivated?: AICoachEventHandler<'coach:comebackActivated'>;
  onComebackCompleted?: AICoachEventHandler<'coach:comebackCompleted'>;
  onRecommendationGenerated?: AICoachEventHandler<'coach:recommendationGenerated'>;
  onDifficultyAdjusted?: AICoachEventHandler<'coach:difficultyAdjusted'>;
  onPreferencesUpdated?: AICoachEventHandler<'coach:preferencesUpdated'>;
}
