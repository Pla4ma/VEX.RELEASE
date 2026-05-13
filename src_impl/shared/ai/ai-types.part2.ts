import { z } from "zod";


export const GenerateWeeklyReflectionResponseSchema = AIBaseResponseSchema.extend({
  requestType: z.literal('GENERATE_WEEKLY_REFLECTION'),
  content: z.string().max(2000),
  structuredData: z.object({
    headline: z.string(),
    wins: z.array(z.string()),
    reflection: z.string(),
    nextWeekGoal: z.string(),
    encouragement: z.string(),
  }),
});

export const AIRequestSchema = z.discriminatedUnion('requestType', [
  GenerateCoachMessageRequestSchema,
  GenerateSessionSummaryRequestSchema,
  GenerateComebackPromptRequestSchema,
  GenerateStreakRiskNudgeRequestSchema,
  GenerateWeeklyReflectionRequestSchema,
]);

export const AIResponseSchema = z.discriminatedUnion('requestType', [
  GenerateCoachMessageResponseSchema,
  GenerateSessionSummaryResponseSchema,
  GenerateComebackPromptResponseSchema,
  GenerateStreakRiskNudgeResponseSchema,
  GenerateWeeklyReflectionResponseSchema,
]);

export const AIErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'PROMPT_CONSTRUCTION_FAILED',
  'GEMINI_API_ERROR',
  'GEMINI_RATE_LIMIT',
  'GEMINI_SAFETY_BLOCK',
  'OUTPUT_VALIDATION_FAILED',
  'OUTPUT_PARSING_FAILED',
  'TIMEOUT',
  'INTERNAL_ERROR',
]);