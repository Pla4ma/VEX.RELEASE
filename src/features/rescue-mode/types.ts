import type { z } from 'zod';
import {
  RescueCompletionMemorySchema,
  RescueCompletionRecordSchema,
  RescueEligibilityInputSchema,
  RescueEligibilityResultSchema,
  RescueOutcomeSchema,
  RescuePlanInputSchema,
  RescuePlanSchema,
  RescueReasonSchema,
  RescueTriggerSourceSchema,
} from './schemas';

export type RescueReason = z.infer<typeof RescueReasonSchema>;
export type RescueTriggerSource = z.infer<typeof RescueTriggerSourceSchema>;
export type RescueEligibilityInput = z.infer<
  typeof RescueEligibilityInputSchema
>;
export type RescueEligibilityResult = z.infer<
  typeof RescueEligibilityResultSchema
>;
export type RescuePlan = z.infer<typeof RescuePlanSchema>;
export type RescuePlanInput = z.infer<typeof RescuePlanInputSchema>;
export type RescueOutcome = z.infer<typeof RescueOutcomeSchema>;
export type RescueCompletionRecord = z.infer<
  typeof RescueCompletionRecordSchema
>;
export type RescueCompletionMemory = z.infer<
  typeof RescueCompletionMemorySchema
>;
