import { z } from "zod";

export const TodaySystemEventSchema = z
  .object({
    type: z.enum(["today_system_viewed", "today_system_action_started"]),
    userId: z.string().min(1),
    section: z.enum(["now", "later", "done", "recovery"]),
    occurredAt: z.number().int().min(0),
  })
  .strict();

export type TodaySystemEvent = z.infer<typeof TodaySystemEventSchema>;
