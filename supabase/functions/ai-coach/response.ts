import { buildCorsHeaders } from '../_shared/cors.ts';
import {
  AIRequestTypeSchema,
  CoachPayloadSchema,
  type AIRequest,
} from './schemas.ts';

export type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
};

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
      model: 'gemini-1.5-flash',
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
) {
  return {
    success: true,
    requestType: request.requestType,
    content,
    structuredData: readStructuredData(request, content),
    metadata: {
      model,
      processingTimeMs: Date.now() - startedAt,
      cached: false,
      fallbackUsed,
      tokensUsed: promptTokens + responseTokens,
    },
  };
}

export function buildSuccess(request: AIRequest, response: GeminiResponse, startedAt: number) {
  const content = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
  return buildTextSuccess(
    request,
    content,
    'gemini-1.5-flash',
    startedAt,
    false,
    response.usageMetadata?.promptTokenCount ?? 0,
    response.usageMetadata?.candidatesTokenCount ?? 0,
  );
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
