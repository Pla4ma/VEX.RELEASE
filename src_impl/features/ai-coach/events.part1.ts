import { z } from "zod";
import { MessageCategorySchema, TriggerTypeSchema, RecommendationTypeSchema, CoachUserStateSchema } from "./schemas";


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
  signalType: z.enum(['SESSION_FREQUENCY', 'SESSION_QUALITY_TREND', 'STREAK_MAINTENANCE_RATE', 'PREFERRED_TIME_OF_DAY', 'FOCUS_DURATION_PREFERENCE', 'DIFFICULTY_PREFERENCE', 'SOCIAL_ENGAGEMENT', 'CHALLENGE_COMPLETION_RATE', 'BOSS_PARTICIPATION', 'MORNING_PERSON', 'NIGHT_OWL', 'WEEKEND_WARRIOR', 'CONSISTENCY_SCORE', 'RESPONSIVENESS_TO_REMINDERS', 'COMEBACK_VELOCITY']),
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

export function validateCoachMessageGeneratedEvent(payload: unknown): CoachMessageGeneratedEvent {
  return CoachMessageGeneratedEventSchema.parse(payload);
}

export function validateCoachMessageDeliveredEvent(payload: unknown): CoachMessageDeliveredEvent {
  return CoachMessageDeliveredEventSchema.parse(payload);
}

export function validateCoachMessageActionTakenEvent(payload: unknown): CoachMessageActionTakenEvent {
  return CoachMessageActionTakenEventSchema.parse(payload);
}

export function validateCoachStateChangedEvent(payload: unknown): CoachStateChangedEvent {
  return CoachStateChangedEventSchema.parse(payload);
}

export function validateInterventionTriggeredEvent(payload: unknown): InterventionTriggeredEvent {
  return InterventionTriggeredEventSchema.parse(payload);
}

export function validateBehaviorSignalDetectedEvent(payload: unknown): BehaviorSignalDetectedEvent {
  return BehaviorSignalDetectedEventSchema.parse(payload);
}

export function validateStreakRiskDetectedEvent(payload: unknown): StreakRiskDetectedEvent {
  return StreakRiskDetectedEventSchema.parse(payload);
}

export function validateComebackActivatedEvent(payload: unknown): ComebackActivatedEvent {
  return ComebackActivatedEventSchema.parse(payload);
}

export function validateComebackCompletedEvent(payload: unknown): ComebackCompletedEvent {
  return ComebackCompletedEventSchema.parse(payload);
}

export function validateRecommendationGeneratedEvent(payload: unknown): RecommendationGeneratedEvent {
  return RecommendationGeneratedEventSchema.parse(payload);
}

export function validateDifficultyAdjustedEvent(payload: unknown): DifficultyAdjustedEvent {
  return DifficultyAdjustedEventSchema.parse(payload);
}

export function validateCoachPreferencesUpdatedEvent(payload: unknown): CoachPreferencesUpdatedEvent {
  return CoachPreferencesUpdatedEventSchema.parse(payload);
}

export function createCoachMessageGeneratedEvent(userId: string, messageId: string, category: string, content: string, priority: number, deliveryMethod: string): CoachMessageGeneratedEvent {
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

export function createCoachStateChangedEvent(userId: string, previousState: string | null, newState: string, context?: Record<string, unknown>): CoachStateChangedEvent {
  return {
    userId,
    previousState: previousState === null ? null : CoachUserStateSchema.parse(previousState),
    newState: CoachUserStateSchema.parse(newState),
    enteredAt: Date.now(),
    context,
  };
}