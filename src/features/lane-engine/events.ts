import { z } from 'zod';

import { LaneProfileSchema, LaneSchema } from './schemas';

export const LaneEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('lane_resolved'),
    profile: LaneProfileSchema,
  }).strict(),
  z.object({
    type: z.literal('lane_changed'),
    previousLane: LaneSchema,
    nextProfile: LaneProfileSchema,
  }).strict(),
  z.object({
    type: z.literal('lane_overridden'),
    selectedLane: LaneSchema,
    profile: LaneProfileSchema,
  }).strict(),
]);

export type LaneEvent = z.infer<typeof LaneEventSchema>;

export function validateLaneEvent(event: LaneEvent): LaneEvent {
  return LaneEventSchema.parse(event);
}
