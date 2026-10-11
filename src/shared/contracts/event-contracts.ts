import { z } from 'zod';

export const CoreEventNameSchema = z.enum([
  'session:started',
  'session:completed',
  'session:abandoned',
  'progression:xp_added',
  'progression:level_up',
  'streak:updated',
  'onboarding:completed',
  'coach:message_sent',
  'coach:memory_created',
  'notification:opened',
]);

export const DomainEventEnvelopeSchema = z
  .object({
    eventId: z.string().uuid(),
    eventName: CoreEventNameSchema,
    payload: z.record(z.string(), z.unknown()),
    userId: z.string().min(1),
    sessionId: z.string().uuid().nullable(),
    idempotencyKey: z.string().min(1),
    occurredAt: z.number().int().min(0),
    version: z.literal(1),
  })
  .strict();

export type CoreEventName = z.infer<typeof CoreEventNameSchema>;
export type DomainEventEnvelope = z.infer<typeof DomainEventEnvelopeSchema>;
