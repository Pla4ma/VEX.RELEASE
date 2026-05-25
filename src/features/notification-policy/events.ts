import { z } from 'zod';
import { NudgeTypeSchema } from './schemas';

export const NotificationPolicyEventSchema = z.object({
  type: z.enum(['nudge_allowed', 'nudge_blocked', 'nudge_dismissed']),
  userId: z.string().min(1),
  nudgeType: NudgeTypeSchema,
  occurredAt: z.number().int().min(0),
}).strict();

export type NotificationPolicyEvent = z.infer<typeof NotificationPolicyEventSchema>;
