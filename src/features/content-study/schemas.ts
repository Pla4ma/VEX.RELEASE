import { z } from 'zod';

export const ContentStudyEligibilityResponseSchema = z
  .object({
    success: z.literal(true),
    canUpload: z.boolean(),
    fallbackLabel: z.string().nullable(),
  })
  .strict();

export type ContentStudyEligibility = z.infer<
  typeof ContentStudyEligibilityResponseSchema
>;
