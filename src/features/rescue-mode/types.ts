import type { z } from 'zod';
import {
  RescueCompletionMemorySchema,
  RescuePlanInputSchema,
  RescuePlanSchema,
  RescueReasonSchema,
} from './schemas';

export type RescueReason = z.infer<typeof RescueReasonSchema>;
export type RescuePlan = z.infer<typeof RescuePlanSchema>;
export type RescuePlanInput = z.infer<typeof RescuePlanInputSchema>;
export type RescueCompletionMemory = z.infer<typeof RescueCompletionMemorySchema>;
