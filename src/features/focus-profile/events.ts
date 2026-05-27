import { z } from "zod";

export const FocusProfileEventSchema = z
  .object({
    type: z.enum(["focus_profile_created", "focus_profile_updated"]),
    userId: z.string().min(1),
    occurredAt: z.number().int().min(0),
  })
  .strict();

export type FocusProfileEvent = z.infer<typeof FocusProfileEventSchema>;
