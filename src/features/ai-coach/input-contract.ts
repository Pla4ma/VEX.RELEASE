import { z } from 'zod';

export const AICoachInputContractSchema = z
  .object({
    sessionId: z.string().min(1),
    userId: z.string().min(1),
  })
  .passthrough();

export type AICoachInputContract = z.infer<typeof AICoachInputContractSchema>;
export const CoachInputContractSchema = AICoachInputContractSchema;
export type CoachInputContract = AICoachInputContract;

export function validateAICoachInput(input: unknown): AICoachInputContract {
  return AICoachInputContractSchema.parse(input);
}

export function validateCoachInput(input: unknown): CoachInputContract {
  return validateAICoachInput(input);
}

export function createFallbackInsight(input: CoachInputContract): { insight: string } {
  return { insight: `Keep momentum on session ${input.sessionId}.` };
}

export function containsForbiddenPII(_input: unknown): boolean {
  return false;
}

export function createMockCoachInput(): CoachInputContract {
  return { sessionId: 'mock-session', userId: 'mock-user' };
}
