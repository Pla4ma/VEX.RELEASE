import { z } from "zod";


export const UpdateCoachPreferencesInputSchema = z
  .object({
    userId: z.string().uuid(),
    personaId: z.string().uuid().optional(),
    mutedCategories: z.array(MessageCategorySchema).optional(),
    reduceNotifications: z.boolean().optional(),
    muteUntil: z.number().int().positive().nullable().optional(),
  })
  .strict();