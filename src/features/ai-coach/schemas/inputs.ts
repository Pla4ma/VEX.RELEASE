import { z } from 'zod';
import {
  MessageCategorySchema,
  SignalTypeSchema,
  TriggerTypeSchema,
  RecommendationTypeSchema,
  ReminderTypeSchema,
  DeliveryMethodSchema,
} from './enums';

export const GenerateMessageInputSchema = z
  .object({
    userId: z.string().uuid(),
    category: MessageCategorySchema,
    context: z.record(z.unknown()),
    preferredDelivery: DeliveryMethodSchema,
  })
  .strict();

export const ProcessBehaviorSignalInputSchema = z
  .object({
    userId: z.string().uuid(),
    signalType: SignalTypeSchema,
    value: z.number(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const EvaluateInterventionsInputSchema = z
  .object({
    userId: z.string().uuid(),
    trigger: TriggerTypeSchema,
    context: z.record(z.unknown()),
  })
  .strict();

export const CreateRecommendationInputSchema = z
  .object({
    userId: z.string().uuid(),
    type: RecommendationTypeSchema,
    context: z.record(z.unknown()),
  })
  .strict();

export const ScheduleReminderInputSchema = z
  .object({
    userId: z.string().uuid(),
    reminderType: ReminderTypeSchema,
    scheduledFor: z.number().int().positive(),
    priority: z.number().int().min(1).max(10).optional(),
  })
  .strict();

export const ActivateComebackInputSchema = z
  .object({
    userId: z.string().uuid(),
    previousStreak: z.number().int().min(0),
    daysInactive: z.number().int().min(1),
  })
  .strict();

export const AdjustDifficultyInputSchema = z
  .object({
    userId: z.string().uuid(),
    reason: z.string().min(1).max(200),
    targetDifficulty: z.number().min(1).max(10).optional(),
  })
  .strict();

export const MarkMessageActionInputSchema = z
  .object({
    messageId: z.string().uuid(),
    action: z.string().min(1).max(100),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const UpdateCoachPreferencesInputSchema = z
  .object({
    userId: z.string().uuid(),
    personaId: z.string().uuid().optional(),
    mutedCategories: z.array(MessageCategorySchema).optional(),
    reduceNotifications: z.boolean().optional(),
    muteUntil: z.number().int().positive().nullable().optional(),
  })
  .strict();

// --- Inferred types ---

export type GenerateMessageInput = z.infer<typeof GenerateMessageInputSchema>;
export type ProcessBehaviorSignalInput = z.infer<
  typeof ProcessBehaviorSignalInputSchema
>;
export type EvaluateInterventionsInput = z.infer<
  typeof EvaluateInterventionsInputSchema
>;
export type CreateRecommendationInput = z.infer<
  typeof CreateRecommendationInputSchema
>;
export type ScheduleReminderInput = z.infer<typeof ScheduleReminderInputSchema>;
export type ActivateComebackInput = z.infer<typeof ActivateComebackInputSchema>;
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;
export type MarkMessageActionInput = z.infer<
  typeof MarkMessageActionInputSchema
>;
export type UpdateCoachPreferencesInput = z.infer<
  typeof UpdateCoachPreferencesInputSchema
>;
