import { z } from 'zod';

export const CaptureTypeSchema = z.enum(['voice', 'photo', 'link', 'braindump']);

export const CaptureItemSchema = z.object({
  id: z.string().uuid(),
  type: CaptureTypeSchema,
  content: z.string().min(1).max(10000),
  metadata: z.record(z.string(), z.string()).optional(),
  createdAt: z.string().datetime(),
  userId: z.string().uuid(),
});

export const CaptureFormStateSchema = z.object({
  type: CaptureTypeSchema,
  content: z.string(),
  isSubmitting: z.boolean(),
  error: z.string().nullable(),
});

export type CaptureType = z.infer<typeof CaptureTypeSchema>;
export type CaptureItem = z.infer<typeof CaptureItemSchema>;
export type CaptureFormState = z.infer<typeof CaptureFormStateSchema>;
