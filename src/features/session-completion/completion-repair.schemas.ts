import { z } from 'zod';

export const CompletionRepairInputSchema = z.object({
  userId: z.string().uuid(), sessionId: z.string().uuid().optional(),
}).strict();
export type CompletionRepairInput = z.infer<typeof CompletionRepairInputSchema>;
