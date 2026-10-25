import { z } from 'https://esm.sh/zod@3.22.4';
import { buildCorsHeaders } from '../_shared/cors.ts';
import {
  AIRequestTypeSchema,
  CoachPayloadSchema,
  type AIRequest,
} from './schemas.ts';

export const GeminiResponseSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({
      parts: z.array(z.object({ text: z.string().optional() })).optional(),
    }).optional(),
  })).optional(),
  usageMetadata: z.object({
    promptTokenCount: z.number().optional(),
    candidatesTokenCount: z.number().optional(),
  }).optional(),
}).passthrough();
export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;

export function buildError(
  requestType: AIRequest['requestType'],
  startedAt: number,
  code: string,
  message: string,
  retryable: boolean,
) {
  return {
    success: false,
    requestType,
    content: '',
    structuredData: requestType === 'GENERATE_COACH_MESSAGE'
      ? { message: '', tone: 'calm', urgency: 'low' }
      : {},
    metadata: {
      model: 'unavailable',
      processingTimeMs: Date.now() - startedAt,
      cached: false,
    },
    error: { code, message, retryable },
  };
}

export function buildTextSuccess(
  request: AIRequest,
  content: string,
  model: string,
  startedAt: number,
  fallbackUsed: boolean,
  promptTokens = 0,
  responseTokens = 0,
  structuredData?: unknown,
) {
  return {
    success: true,
    requestType: request.requestType,
    content,
    structuredData: structuredData ?? readStructuredData(request, content),
    metadata: {
      model,
      processingTimeMs: Date.now() - startedAt,
      cached: false,
      fallbackUsed,
      tokensUsed: promptTokens + responseTokens,
    },
  };
}


export function readRequestType(rawBody: unknown): AIRequest['requestType'] {
  if (isRecord(rawBody) && AIRequestTypeSchema.safeParse(rawBody.requestType).success) {
    return rawBody.requestType as AIRequest['requestType'];
  }
  return 'GENERATE_COACH_MESSAGE';
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function hasAppUserId(body: unknown): boolean {
  return isRecord(body) && typeof body.userId === 'string' && body.userId.length > 0;
}

export function respond(payload: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: buildCorsHeaders(request, { includeJsonContentType: true }),
  });
}

function readStructuredData(request: AIRequest, content: string): Record<string, unknown> {
  if (request.requestType !== 'GENERATE_COACH_MESSAGE') return {};
  const parsed = CoachPayloadSchema.safeParse({
    message: content,
    tone: 'calm',
    urgency: 'low',
  });
  return parsed.success ? parsed.data : { message: content, tone: 'calm', urgency: 'low' };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
