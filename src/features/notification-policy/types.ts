import type { z } from 'zod';
import { NudgeDecisionSchema, NudgePolicyInputSchema, NudgeTypeSchema } from './schemas';

export type NudgeType = z.infer<typeof NudgeTypeSchema>;
export type NudgeDecision = z.infer<typeof NudgeDecisionSchema>;
export type NudgePolicyInput = z.infer<typeof NudgePolicyInputSchema>;
