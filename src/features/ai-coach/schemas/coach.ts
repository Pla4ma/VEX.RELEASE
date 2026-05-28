import { z } from "zod";
import {
  VoiceToneSchema,
  CoachStyleSchema,
  MessageCategorySchema,
  ConditionTypeSchema,
  DeliveryMethodSchema,
  MessageStatusSchema,
  CoachUserStateSchema,
} from "./enums";
import { BehaviorProfileSchema } from "./behavior";

export const CoachPersonaSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(50),
    description: z.string().max(500),
    avatarUrl: z.string().url().nullable(),
    voiceTone: VoiceToneSchema,
    style: CoachStyleSchema,
    catchphrase: z.string().max(200),
    defaultEnabled: z.boolean(),
  })
  .strict();

export const MessageConditionSchema = z
  .object({
    type: ConditionTypeSchema,
    operator: z.enum(["eq", "gt", "lt", "gte", "lte", "in", "between"]),
    value: z.unknown(),
    field: z.string().optional(),
  })
  .strict();

export const CoachMessageTemplateSchema = z
  .object({
    id: z.string().uuid(),
    personaId: z.string().uuid(),
    category: MessageCategorySchema,
    subcategory: z.string().max(100),
    priority: z.number().int().min(1).max(10),
    content: z.string().min(1).max(1000),
    conditions: z.array(MessageConditionSchema).max(10),
    variations: z.array(z.string().max(1000)).max(5),
    cooldownHours: z.number().int().min(0).max(168),
  })
  .strict();

export const CoachMessageSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    personaId: z.string().uuid(),
    category: MessageCategorySchema,
    content: z.string().max(1000),
    deliveryMethod: DeliveryMethodSchema,
    priority: z.number().int().min(1).max(10),
    status: MessageStatusSchema,
    createdAt: z.number().int().positive(),
    scheduledFor: z.number().int().positive().nullable(),
    deliveredAt: z.number().int().positive().nullable(),
    readAt: z.number().int().positive().nullable(),
    dismissedAt: z.number().int().positive().nullable(),
    actionTaken: z.string().max(100).nullable(),
    actionTakenAt: z.number().int().positive().nullable(),
  })
  .strict();

export const CoachHistorySchema = z
  .object({
    userId: z.string().uuid(),
    messages: z.array(CoachMessageSchema).max(100),
    totalMessages: z.number().int().min(0),
    responseRate: z.number().min(0).max(1),
    preferredCategories: z.array(MessageCategorySchema).max(5),
    mutedCategories: z.array(MessageCategorySchema).max(11),
    lastMessageAt: z.number().int().positive(),
  })
  .strict();

export const CoachStateSchema = z
  .object({
    userId: z.string().uuid(),
    currentState: CoachUserStateSchema,
    previousState: CoachUserStateSchema.nullable(),
    stateEnteredAt: z.number().int().positive(),
    personaId: z.string().uuid(),
    behaviorProfile: BehaviorProfileSchema.nullable(),
    lastInterventionAt: z.number().int().positive().nullable(),
    interventionsToday: z.number().int().min(0),
    muteUntil: z.number().int().positive().nullable(),
    reduceNotifications: z.boolean(),
  })
  .strict();

export const CoachEffectivenessSchema = z
  .object({
    messageId: z.string().uuid(),
    category: MessageCategorySchema,
    userId: z.string().uuid(),
    deliveredAt: z.number().int().positive(),
    opened: z.boolean(),
    actionTaken: z.boolean(),
    actionType: z.string().max(100).nullable(),
    timeToAction: z.number().int().positive().nullable(),
    subsequentSessionCompleted: z.boolean(),
    subsequentSessionQuality: z.number().min(0).max(100).nullable(),
  })
  .strict();

// --- Inferred types ---

export type CoachPersona = z.infer<typeof CoachPersonaSchema>;
export type MessageCondition = z.infer<typeof MessageConditionSchema>;
export type CoachMessageTemplate = z.infer<typeof CoachMessageTemplateSchema>;
export type CoachMessage = z.infer<typeof CoachMessageSchema>;
export type CoachHistory = z.infer<typeof CoachHistorySchema>;
export type CoachState = z.infer<typeof CoachStateSchema>;
export type CoachEffectiveness = z.infer<typeof CoachEffectivenessSchema>;
