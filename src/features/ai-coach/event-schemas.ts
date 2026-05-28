import { z } from "zod";
import {
  MessageCategorySchema,
  TriggerTypeSchema,
  RecommendationTypeSchema,
  CoachUserStateSchema,
} from "./schemas";

export const CoachMessageGeneratedEventSchema = z.object({
  userId: z.string().uuid(),
  messageId: z.string().uuid(),
  category: MessageCategorySchema,
  content: z.string(),
  priority: z.number(),
  deliveryMethod: z.enum(["IN_APP", "PUSH", "BOTH", "DEFERRED"]),
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
    "SESSION_FREQUENCY",
    "SESSION_QUALITY_TREND",
    "STREAK_MAINTENANCE_RATE",
    "PREFERRED_TIME_OF_DAY",
    "FOCUS_DURATION_PREFERENCE",
    "DIFFICULTY_PREFERENCE",
    "SOCIAL_ENGAGEMENT",
    "CHALLENGE_COMPLETION_RATE",
    "BOSS_PARTICIPATION",
    "MORNING_PERSON",
    "NIGHT_OWL",
    "WEEKEND_WARRIOR",
    "CONSISTENCY_SCORE",
    "RESPONSIVENESS_TO_REMINDERS",
    "COMEBACK_VELOCITY",
  ]),
  value: z.number(),
  confidence: z.number(),
  timestamp: z.number(),
});

export const StreakRiskDetectedEventSchema = z.object({
  userId: z.string().uuid(),
  currentStreak: z.number(),
  hoursSinceLastSession: z.number(),
  riskLevel: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
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
  suggestedDifficulty: z.enum(["EASY", "NORMAL", "CHALLENGING", "PUSH"]),
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

// Inferred types for consumers
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
