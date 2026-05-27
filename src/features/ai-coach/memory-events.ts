import { z } from "zod";
import { CoachMemorySchema } from "./memory-schemas";

export const CoachMemoryCreatedEventSchema = z.object({
  userId: z.string().uuid(),
  memoryId: z.string().uuid(),
  type: CoachMemorySchema.shape.type,
  occurredAt: z.number().int().nonnegative(),
  timestamp: z.number().int().nonnegative(),
});

export type CoachMemoryCreatedEvent = z.infer<
  typeof CoachMemoryCreatedEventSchema
>;

export function createCoachMemoryCreatedEvent(
  memory: Pick<
    z.infer<typeof CoachMemorySchema>,
    "id" | "userId" | "type" | "occurredAt"
  >,
): CoachMemoryCreatedEvent {
  return CoachMemoryCreatedEventSchema.parse({
    userId: memory.userId,
    memoryId: memory.id,
    type: memory.type,
    occurredAt: memory.occurredAt,
    timestamp: Date.now(),
  });
}
