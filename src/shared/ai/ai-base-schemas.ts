import { z } from 'zod';

export const AIRequestTypeSchema = z.enum([
  'GENERATE_COACH_MESSAGE',
  'GENERATE_SESSION_SUMMARY',
  'GENERATE_COMEBACK_PROMPT',
  'GENERATE_STREAK_RISK_NUDGE',
  'GENERATE_WEEKLY_REFLECTION',
  'GENERATE_PERSONALIZED_TIP',
]);
export type AIRequestType = z.infer<typeof AIRequestTypeSchema>;

export const AIBaseRequestSchema = z
  .object({
    requestType: AIRequestTypeSchema,
    userId: z.string().uuid(),
    context: z.record(z.string(), z.unknown()),
    personaId: z.string().uuid().optional(),
    metadata: z
      .object({
        timestamp: z.number(),
        appVersion: z.string().optional(),
        platform: z.enum(['ios', 'android']).optional(),
      })
      .optional(),
  })
  .strict();
export type AIBaseRequest = z.infer<typeof AIBaseRequestSchema>;

export const AIBaseResponseSchema = z
  .object({
    success: z.boolean(),
    requestType: AIRequestTypeSchema,
    content: z.string().max(2000).nullable(),
    structuredData: z.record(z.string(), z.unknown()).optional(),
    metadata: z.object({
      model: z.string(),
      processingTimeMs: z.number(),
      promptTokens: z.number().optional(),
      responseTokens: z.number().optional(),
      cached: z.boolean().optional(),
    }),
    error: z
      .object({ code: z.string(), message: z.string(), retryable: z.boolean() })
      .optional(),
  })
  .strict();
export type AIBaseResponse = z.infer<typeof AIBaseResponseSchema>;

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
export type AIErrorCode = z.infer<typeof AIErrorCodeSchema>;
