import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';
import { SessionModeSchema } from '../../session/modes';

export const RescueReasonSchema = z.enum(['too_big', 'tired', 'distracted', 'anxious', 'unclear', 'no_time']);

export const RescuePlanSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  lane: LaneSchema,
  reason: RescueReasonSchema,
  durationSeconds: z.number().int().min(5 * 60).max(12 * 60),
  sessionMode: SessionModeSchema,
  taskDescription: z.string().min(1).max(120),
  frictionLevel: z.enum(['none', 'soft', 'medium']),
  createdAt: z.number().int().min(0),
}).strict();

export const RescuePlanInputSchema = z.object({
  userId: z.string().min(1),
  lane: LaneSchema,
  reason: RescueReasonSchema,
  durationSeconds: z.number().int().min(60).max(60 * 60).optional(),
  taskDescription: z.string().min(1).max(120).optional(),
  createdAt: z.number().int().min(0).optional(),
}).strict();

export const RescueCompletionMemorySchema = z.object({
  id: z.string().min(1),
  source: z.literal('rescue_completion'),
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
}).strict();

export type RescueReason = z.infer<typeof RescueReasonSchema>;
export type RescuePlan = z.infer<typeof RescuePlanSchema>;
export type RescuePlanInput = z.infer<typeof RescuePlanInputSchema>;
export type RescueCompletionMemory = z.infer<typeof RescueCompletionMemorySchema>;
