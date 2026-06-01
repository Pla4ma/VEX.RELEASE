import { z } from 'zod';
import {
  TriggerTypeSchema,
  ActionTypeSchema,
  DeliveryMethodSchema,
  ExecutionStatusSchema,
} from './enums';

export const InterventionTriggerSchema = z
  .object({ type: TriggerTypeSchema, threshold: z.number().optional() })
  .strict();

export const InterventionConditionSchema = z
  .object({
    field: z.string(),
    operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'in']),
    value: z.unknown(),
  })
  .strict();

export const InterventionActionSchema = z
  .object({
    type: ActionTypeSchema,
    messageTemplateId: z.string().uuid().nullable(),
    deliveryMethod: DeliveryMethodSchema,
    delayMinutes: z.number().int().min(0).max(1440),
  })
  .strict();

export const InterventionRuleSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    trigger: InterventionTriggerSchema,
    conditions: z.array(InterventionConditionSchema).max(5),
    action: InterventionActionSchema,
    priority: z.number().int().min(1).max(100),
    cooldownHours: z.number().int().min(0).max(168),
    maxPerDay: z.number().int().min(1).max(50),
    enabled: z.boolean(),
  })
  .strict();

export const UserResponseSchema = z
  .object({
    action: z.enum([
      'STARTED_SESSION',
      'DISMISSED',
      'ENGAGED',
      'IGNORED',
      'MUTED',
    ]),
    timestamp: z.number().int().positive(),
    metadata: z.record(z.unknown()),
  })
  .strict();

export const InterventionExecutionSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    ruleId: z.string().uuid(),
    triggerType: TriggerTypeSchema,
    status: ExecutionStatusSchema,
    triggeredAt: z.number().int().positive(),
    executedAt: z.number().int().positive().nullable(),
    messageId: z.string().uuid().nullable(),
    userResponse: UserResponseSchema.nullable(),
    effectiveness: z.number().min(0).max(1).nullable(),
    result: z.record(z.unknown()).nullable().optional(),
  })
  .strict();

// --- Inferred types ---

export type InterventionTrigger = z.infer<typeof InterventionTriggerSchema>;
export type InterventionCondition = z.infer<typeof InterventionConditionSchema>;
export type InterventionAction = z.infer<typeof InterventionActionSchema>;
export type InterventionRule = z.infer<typeof InterventionRuleSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type InterventionExecution = z.infer<typeof InterventionExecutionSchema>;
