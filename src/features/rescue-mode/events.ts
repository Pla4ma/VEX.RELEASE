import { z } from 'zod';
import { RescueReasonSchema } from './schemas';

export const RescueModeEventSchema = z
  .object({
    type: z.enum([
      'rescue_plan_created',
      'rescue_plan_started',
      'rescue_plan_completed',
    ]),
    userId: z.string().min(1),
    reason: RescueReasonSchema,
    occurredAt: z.number().int().min(0),
  })
  .strict();

export type RescueModeEvent = z.infer<typeof RescueModeEventSchema>;
