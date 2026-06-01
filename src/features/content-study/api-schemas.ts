import { z } from 'zod';
import { invokeContentStudy } from './repository';
import { buildError } from './validation';
import { ERROR_MESSAGES } from './constants';
import { ContentStudyErrorCode } from './types';

export const submitContentResponseSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  status: z.enum([
    'PENDING',
    'EXTRACTING',
    'EXTRACTED',
    'PROCESSING',
    'READY',
    'FAILED',
  ]),
  message: z.string(),
  error: z.string().optional(),
});

export const extractContentResponseSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  extractedLength: z.number().default(0),
  status: z.enum([
    'PENDING',
    'EXTRACTING',
    'EXTRACTED',
    'PROCESSING',
    'READY',
    'FAILED',
  ]),
  error: z.string().optional(),
});

export const generationResponseSchema = z.object({
  success: z.boolean(),
  generationId: z.string(),
  contentId: z.string(),
  summary: z.string(),
  keyConcepts: z.array(z.string()),
  tasks: z.array(z.unknown()),
  quizItems: z.array(z.unknown()),
  sessionPlan: z.unknown(),
  remaining: z.number(),
  error: z.string().optional(),
});

export const statusResponseSchema = z.object({
  success: z.boolean(),
  contentId: z.string(),
  status: z.enum([
    'PENDING',
    'EXTRACTING',
    'EXTRACTED',
    'PROCESSING',
    'READY',
    'FAILED',
  ]),
  extractedLength: z.number().default(0),
  errorMessage: z.string().optional(),
  generation: z.unknown().optional(),
  error: z.string().optional(),
});

export const feedbackResponseSchema = z.object({ success: z.boolean() });

export const ContentStudyTimeoutFallbackSchema = z
  .object({
    body: z.string().min(1),
    ctaLabel: z.string().min(1),
    title: z.string().min(1),
  })
  .strict();

export type ContentStudyTimeoutFallback = z.infer<
  typeof ContentStudyTimeoutFallbackSchema
>;

export function normalizeError(
  error: unknown,
  code: ContentStudyErrorCode,
  message: string,
) {
  if (error instanceof Error) {
    return buildError(
      code,
      error.message || message,
      { cause: error.name },
      true,
    );
  }
  return buildError(code, message, undefined, true);
}

export async function invokeAndParse<T>(
  path: string,
  schema: z.ZodSchema<T>,
  body?: unknown,
  method?: 'GET' | 'POST',
): Promise<T> {
  const { data, error } = await invokeContentStudy(path, body, method);
  if (error) {
    throw normalizeError(
      error,
      ContentStudyErrorCode.NETWORK_ERROR,
      ERROR_MESSAGES.NETWORK_ERROR,
    );
  }
  return schema.parse(data);
}
