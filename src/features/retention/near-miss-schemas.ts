import { z } from "zod";

export const NearMissTriggerSchema = z.string();
export const NearMissInterventionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  trigger: z.string(),
  triggeredAt: z.number(),
  shown: z.boolean(),
  actedUpon: z.boolean(),
  dismissed: z.boolean(),
  content: z.object({
    headline: z.string(),
    body: z.string(),
    primaryAction: z.string(),
    incentive: z.object({ type: z.string(), amount: z.number() }).optional(),
  }),
  urgency: z.string(),
});

export type NearMissTrigger = z.infer<typeof NearMissTriggerSchema>;
export type NearMissIntervention = z.infer<typeof NearMissInterventionSchema>;
