export type {
  CoachMessageGeneratedEvent,
  CoachMessageDeliveredEvent,
  CoachMessageActionTakenEvent,
  CoachStateChangedEvent,
  InterventionTriggeredEvent,
  BehaviorSignalDetectedEvent,
  StreakRiskDetectedEvent,
  ComebackActivatedEvent,
  ComebackCompletedEvent,
  RecommendationGeneratedEvent,
  DifficultyAdjustedEvent,
  CoachPreferencesUpdatedEvent,
} from './event-detail/event-schemas';

export {
  CoachMessageGeneratedEventSchema,
  CoachMessageDeliveredEventSchema,
  CoachMessageActionTakenEventSchema,
  CoachStateChangedEventSchema,
  InterventionTriggeredEventSchema,
  BehaviorSignalDetectedEventSchema,
  StreakRiskDetectedEventSchema,
  ComebackActivatedEventSchema,
  ComebackCompletedEventSchema,
  RecommendationGeneratedEventSchema,
  DifficultyAdjustedEventSchema,
  CoachPreferencesUpdatedEventSchema,
} from './event-detail/event-schemas';

export {
  createCoachMessageGeneratedEvent,
  createCoachStateChangedEvent,
  createStreakRiskDetectedEvent,
  createComebackActivatedEvent,
  createBehaviorSignalDetectedEvent,
  createStateTransitionEvent,
  createInterventionExecutedEvent,
} from './event-detail/event-factories';

import type {
  CoachMessageGeneratedEvent,
  CoachMessageDeliveredEvent,
  CoachMessageActionTakenEvent,
  CoachStateChangedEvent,
  InterventionTriggeredEvent,
  BehaviorSignalDetectedEvent,
  StreakRiskDetectedEvent,
  ComebackActivatedEvent,
  ComebackCompletedEvent,
  RecommendationGeneratedEvent,
  DifficultyAdjustedEvent,
  CoachPreferencesUpdatedEvent,
} from './event-detail/event-schemas';

import {
  CoachMessageGeneratedEventSchema,
  CoachMessageDeliveredEventSchema,
  CoachMessageActionTakenEventSchema,
  CoachStateChangedEventSchema,
  InterventionTriggeredEventSchema,
  BehaviorSignalDetectedEventSchema,
  StreakRiskDetectedEventSchema,
  ComebackActivatedEventSchema,
  ComebackCompletedEventSchema,
  RecommendationGeneratedEventSchema,
  DifficultyAdjustedEventSchema,
  CoachPreferencesUpdatedEventSchema,
} from './event-detail/event-schemas';

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

export function validateCoachMessageGeneratedEvent(
  payload: unknown,
): CoachMessageGeneratedEvent {
  return CoachMessageGeneratedEventSchema.parse(payload);
}

export function validateCoachMessageDeliveredEvent(
  payload: unknown,
): CoachMessageDeliveredEvent {
  return CoachMessageDeliveredEventSchema.parse(payload);
}

export function validateCoachMessageActionTakenEvent(
  payload: unknown,
): CoachMessageActionTakenEvent {
  return CoachMessageActionTakenEventSchema.parse(payload);
}

export function validateCoachStateChangedEvent(
  payload: unknown,
): CoachStateChangedEvent {
  return CoachStateChangedEventSchema.parse(payload);
}

export function validateInterventionTriggeredEvent(
  payload: unknown,
): InterventionTriggeredEvent {
  return InterventionTriggeredEventSchema.parse(payload);
}

export function validateBehaviorSignalDetectedEvent(
  payload: unknown,
): BehaviorSignalDetectedEvent {
  return BehaviorSignalDetectedEventSchema.parse(payload);
}

export function validateStreakRiskDetectedEvent(
  payload: unknown,
): StreakRiskDetectedEvent {
  return StreakRiskDetectedEventSchema.parse(payload);
}

export function validateComebackActivatedEvent(
  payload: unknown,
): ComebackActivatedEvent {
  return ComebackActivatedEventSchema.parse(payload);
}

export function validateComebackCompletedEvent(
  payload: unknown,
): ComebackCompletedEvent {
  return ComebackCompletedEventSchema.parse(payload);
}

export function validateRecommendationGeneratedEvent(
  payload: unknown,
): RecommendationGeneratedEvent {
  return RecommendationGeneratedEventSchema.parse(payload);
}

export function validateDifficultyAdjustedEvent(
  payload: unknown,
): DifficultyAdjustedEvent {
  return DifficultyAdjustedEventSchema.parse(payload);
}

export function validateCoachPreferencesUpdatedEvent(
  payload: unknown,
): CoachPreferencesUpdatedEvent {
  return CoachPreferencesUpdatedEventSchema.parse(payload);
}

export type AICoachEventHandler<T extends keyof AICoachEventPayloadMap> = (
  payload: AICoachEventPayloadMap[T],
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
