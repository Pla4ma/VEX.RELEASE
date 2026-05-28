import { z } from "zod";
import { CoachPersonalitySchema, CoachFrequencySchema } from "./enums";

export const CoachSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    enabled: z.boolean(),
    personality: CoachPersonalitySchema,
    frequency: CoachFrequencySchema,
    messageTypes: z
      .object({
        streakReminders: z.boolean(),
        sessionTips: z.boolean(),
        milestoneCelebrations: z.boolean(),
        encouragement: z.boolean(),
        challenges: z.boolean(),
      })
      .strict(),
    quietHours: z
      .object({
        enabled: z.boolean(),
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        timezone: z.string(),
      })
      .strict(),
    customTriggers: z.array(
      z
        .object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          eventType: z.string(),
          condition: z.enum(["before", "after", "during"]),
          threshold: z.number().optional(),
          messageTemplate: z.string(),
          isActive: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export type CoachSettings = z.infer<typeof CoachSettingsSchema>;
