import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';
import { NudgeSignalTypeSchema, NudgeTypeSchema } from './schemas';

export const NotificationPolicyEventSchema = z
  .object({
    type: z.enum([
      'nudge_allowed',
      'nudge_blocked',
      'nudge_dismissed',
      'nudge_signal',
    ]),
    userId: z.string().min(1),
    nudgeType: NudgeTypeSchema,
    occurredAt: z.number().int().min(0),
    signal: NudgeSignalTypeSchema.optional(),
    lane: LaneSchema.optional(),
  })
  .strict();

export const NudgeSignalEventSchema = z
  .object({
    userId: z.string().min(1),
    nudgeType: NudgeTypeSchema,
    signal: NudgeSignalTypeSchema,
    lane: LaneSchema,
    occurredAt: z.number().int().min(0),
  })
  .strict();

export type NotificationPolicyEvent = z.infer<
  typeof NotificationPolicyEventSchema
>;
export type NudgeSignalEvent = z.infer<typeof NudgeSignalEventSchema>;
