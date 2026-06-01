import { z } from 'zod';

import { MotivationStyleSchema } from './schemas';

export const PersonalizationEventSchema = z.discriminatedUnion('type', [
  z
    .object({
      motivationStyle: MotivationStyleSchema,
      timestamp: z.number().int().min(0),
      type: z.literal('personalization:motivation-style-changed'),
    })
    .strict(),
  z
    .object({
      timestamp: z.number().int().min(0),
      type: z.literal('personalization:reset-requested'),
    })
    .strict(),
]);

export type PersonalizationEvent = z.infer<typeof PersonalizationEventSchema>;

export function validatePersonalizationEvent(
  event: PersonalizationEvent,
): PersonalizationEvent {
  return PersonalizationEventSchema.parse(event);
}
