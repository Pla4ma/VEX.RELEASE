import { z } from 'zod';

import { FocusMemorySchema } from './schemas';

export const FocusMemoryEventSchema = z.object({
  type: z.enum(['memory_candidate_created', 'memory_accepted', 'memory_deleted']),
  memory: FocusMemorySchema,
}).strict();

export type FocusMemoryEvent = z.infer<typeof FocusMemoryEventSchema>;
