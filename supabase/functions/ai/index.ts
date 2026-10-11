import { buildCorsHeaders } from '../_shared/cors.ts';
import {
  AIRequestSchema,
  AIResponseSchema,
  type AIRequest,
  type AIResponse,
} from '../../../src/shared/ai/ai-types.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { getOpenAICompatibleConfig } from '../_shared/openai-compatible.ts';
import { requireConfig } from '../_shared/config.ts';
import { generateAIContent } from './generation.ts';
import { buildAIResponseData } from '../../../src/shared/ai/response-data.ts';

function jsonResponse(
  payload: unknown,
  status: number,
  request: Request,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...buildCorsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

const ROUTE_BY_SLUG: Record<string, AIRequest['requestType']> = {
  'coach-message': 'GENERATE_COACH_MESSAGE',
  'session-summary': 'GENERATE_SESSION_SUMMARY',
  'comeback-prompt': 'GENERATE_COMEBACK_PROMPT',
  'streak-nudge': 'GENERATE_STREAK_RISK_NUDGE',
  'weekly-reflection': 'GENERATE_WEEKLY_REFLECTION',
};

Deno.serve(async (request: Request) => {
  try {
    return await handleRequest(request);
  } catch {
    return jsonResponse({ error: 'AI service unavailable' }, 503, request);
  }
});

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(request) });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, request);
  }

  const auth = await verifyAuthorizedUser(request, jsonResponse);
  if (!auth.ok) return auth.response;

  const expectedRequestType = ROUTE_BY_SLUG[getRouteSlug(request.url)];
  if (!expectedRequestType) {
    return jsonResponse({ error: 'Unknown AI endpoint' }, 404, request);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload' }, 400, request);
  }
  const parsed = AIRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonResponse({ error: 'Invalid AI request payload' }, 400, request);
  }
  if (parsed.data.requestType !== expectedRequestType) {
    return jsonResponse({ error: 'AI route does not match request type' }, 400, request);
  }
  if (parsed.data.userId !== auth.user.id) {
    return jsonResponse({ error: 'Forbidden: user identity mismatch' }, 403, request);
  }

  const config = requireConfig();
  const rateLimit = await checkRateLimit(
    auth.user.id,
    'ai:generate',
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        error: 'Rate limit exceeded. Try again later.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      429,
      request,
    );
  }

  const response = await generateAIResponse(parsed.data, config.GEMINI_API_KEY);
  return jsonResponse(response, 200, request);
}

function getRouteSlug(url: string): string {
  const parts = new URL(url).pathname.replace(/\/$/, '').split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

async function generateAIResponse(
  request: AIRequest,
  geminiApiKey: string | undefined,
): Promise<AIResponse> {
  const startedAt = Date.now();
  if (!getOpenAICompatibleConfig() && !geminiApiKey) {
    return buildFallbackResponse(request, 'Missing LLM configuration', 0, 503);
  }

  try {
    const generated = await generateAIContent(request, geminiApiKey);
    const content = generated.content.slice(0, getResponseLimit(request.requestType));
    return AIResponseSchema.parse({
      success: true,
      requestType: request.requestType,
      content,
      structuredData: buildAIResponseData(request, content),
      metadata: {
        model: generated.model,
        processingTimeMs: Date.now() - startedAt,
        cached: false,
        ...(generated.promptTokens !== undefined
          ? { promptTokens: generated.promptTokens }
          : {}),
        ...(generated.responseTokens !== undefined
          ? { responseTokens: generated.responseTokens }
          : {}),
      },
    });
  } catch (error) {
    return buildFallbackResponse(
      request,
      error instanceof Error ? error.message : 'AI generation failed',
      Date.now() - startedAt,
    );
  }
}

function getResponseLimit(requestType: AIRequest['requestType']): number {
  switch (requestType) {
    case 'GENERATE_COACH_MESSAGE': return 1000;
    case 'GENERATE_SESSION_SUMMARY': return 1500;
    case 'GENERATE_COMEBACK_PROMPT': return 800;
    case 'GENERATE_STREAK_RISK_NUDGE': return 600;
    case 'GENERATE_WEEKLY_REFLECTION': return 2000;
    default: return 2000;
  }
}

function buildFallbackResponse(
  request: AIRequest,
  errorMessage: string,
  processingTimeMs: number,
  status = 200,
): AIResponse {
  const content = getFallbackContent(request).slice(
    0,
    getResponseLimit(request.requestType),
  );
  return AIResponseSchema.parse({
    success: status < 400,
    requestType: request.requestType,
    content,
    structuredData: buildAIResponseData(request, content),
    metadata: { model: 'fallback', processingTimeMs, cached: false },
    ...(status < 400
      ? {}
      : { error: { code: 'FALLBACK_USED', message: errorMessage, retryable: true } }),
  });
}

function getFallbackContent(request: AIRequest): string {
  switch (request.requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return request.context.personaStyle === 'MINDFUL'
        ? 'Keep breathing. Progress over perfection.'
        : request.context.personaStyle === 'DRILL_SERGEANT'
          ? 'Push one more rep.'
          : 'Small step today. Big progress this week.';
    case 'GENERATE_SESSION_SUMMARY':
      return `You completed a solid session. Quality was ${request.context.averageSessionQuality}% across ${Math.round(request.context.totalFocusMinutes)} minutes. Momentum is building.`;
    case 'GENERATE_COMEBACK_PROMPT':
      return request.context.daysInactive >= 7
        ? `Welcome back after ${request.context.daysInactive} days. The first session back is the hardest — start small.`
        : 'Welcome back. Keep the streak alive with one short session.';
    case 'GENERATE_STREAK_RISK_NUDGE':
      return request.context.currentStreak >= 7
        ? 'Your streak is strong. One session keeps the chain intact.'
        : 'Your streak is at risk. A 15-minute session resets the clock.';
    case 'GENERATE_WEEKLY_REFLECTION':
      return `You completed ${request.context.sessionsCompleted} sessions this week. Consistent effort compounds. Protect the streak and build on this rhythm.`;
    default:
      return 'Keep going. Consistency beats intensity.';
  }
}
