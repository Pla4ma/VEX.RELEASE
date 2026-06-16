import { buildCorsHeaders } from '../_shared/cors.ts';
import { AIRequestSchema, type AIRequest, type AIResponse } from '../../../src/shared/ai/ai-types.ts';
import { AI_TIMEOUTS, FALLBACK_CONTENT, GENERATION_CONFIG, MODEL_BY_USE_CASE, SYSTEM_PROMPTS, USER_PROMPT_TEMPLATES } from '../../../src/shared/ai/ai-constants.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { callGemini } from './gemini.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { getOpenAICompatibleConfig, getOpenAICompatibleModel } from '../_shared/openai-compatible.ts';

function jsonResponse(payload: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
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

Deno.serve(async (request) => {
  const corsHeaders = buildCorsHeaders(request);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
  }

  const auth = await verifyAuthorizedUser(request, jsonResponse);
  if (!auth.ok) return auth.response;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server configuration error' }, 500, corsHeaders);
  }
  const rateLimit = await checkRateLimit(auth.user.id, 'ai:generate', supabaseUrl, serviceRoleKey);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        error: 'Rate limit exceeded. Try again later.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
      429,
      corsHeaders,
    );
  }

  const slug = getRouteSlug(request.url);
  const expectedRequestType = ROUTE_BY_SLUG[slug];
  if (!expectedRequestType) return jsonResponse({ error: 'Unknown AI endpoint' }, 404, corsHeaders);

  try {
    const payload = await request.json();
    const parsedRequest = AIRequestSchema.safeParse(payload);
    if (!parsedRequest.success) return jsonResponse({ error: 'Invalid AI request payload' }, 400, corsHeaders);
    if (parsedRequest.data.requestType !== expectedRequestType) return jsonResponse({ error: `Route expects ${expectedRequestType}, received ${parsedRequest.data.requestType}` }, 400, corsHeaders);
    if (parsedRequest.data.userId !== auth.user.id) return jsonResponse({ error: 'Forbidden: request user does not match auth token' }, 403, corsHeaders);
    const response = await generateAIResponse(parsedRequest.data);
    return jsonResponse(response, 200, corsHeaders);
  } catch (error) {
    if (error instanceof SyntaxError) return jsonResponse({ error: 'Invalid JSON payload' }, 400, corsHeaders);
    const fallback = buildFallbackResponse({ requestType: expectedRequestType, userId: crypto.randomUUID(), context: {} } as AIRequest, error instanceof Error ? error.message : 'Unknown AI error', 0, 503);
    return jsonResponse(fallback, 503, corsHeaders);
  }
});

function getRouteSlug(url: string): string {
  const parts = new URL(url).pathname.replace(/\/$/, '').split('/').filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  const startedAt = Date.now();
  const llmConfig = getOpenAICompatibleConfig();
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!llmConfig && !geminiApiKey) return buildFallbackResponse(request, 'Missing LLM configuration', 0, 503);

  try {
    const model = resolveModel(request.requestType);
    const content = await callGemini({ apiKey: geminiApiKey ?? '', model, systemPrompt: resolveSystemPrompt(request.requestType), userPrompt: renderPromptTemplate(request), timeoutMs: resolveTimeout(request.requestType), generationConfig: resolveGenerationConfig(request.requestType) });
    return {
      success: true,
      requestType: request.requestType,
      content,
      metadata: { model, processingTimeMs: Date.now() - startedAt },
      structuredData: buildStructuredData(request, content),
    } as AIResponse;
  } catch (error) {
    return buildFallbackResponse(request, error instanceof Error ? error.message : 'Gemini API failure', Date.now() - startedAt);
  }
}

function resolveModel(requestType: AIRequest['requestType']): string {
  const llmConfig = getOpenAICompatibleConfig();
  if (llmConfig) return getOpenAICompatibleModel(requestType === 'GENERATE_SESSION_SUMMARY' || requestType === 'GENERATE_WEEKLY_REFLECTION' ? 'pro' : 'fast', 'auto');
  return Deno.env.get(requestType === 'GENERATE_SESSION_SUMMARY' || requestType === 'GENERATE_WEEKLY_REFLECTION' ? 'GEMINI_MODEL_PRO' : 'GEMINI_MODEL_FLASH') || MODEL_BY_USE_CASE[requestType] || 'gemini-2.5-flash';
}

function resolveTimeout(requestType: AIRequest['requestType']): number {
  const map: Record<string, number> = { GENERATE_COACH_MESSAGE: AI_TIMEOUTS.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: AI_TIMEOUTS.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: AI_TIMEOUTS.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: AI_TIMEOUTS.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: AI_TIMEOUTS.WEEKLY_REFLECTION };
  return map[requestType] ?? AI_TIMEOUTS.DEFAULT;
}

function resolveGenerationConfig(requestType: AIRequest['requestType']): Record<string, number> {
  const map: Record<string, Record<string, number>> = { GENERATE_COACH_MESSAGE: GENERATION_CONFIG.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: GENERATION_CONFIG.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: GENERATION_CONFIG.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: GENERATION_CONFIG.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: GENERATION_CONFIG.WEEKLY_REFLECTION };
  return map[requestType] ?? GENERATION_CONFIG.COACH_MESSAGE;
}

function resolveSystemPrompt(requestType: AIRequest['requestType']): string {
  const map: Record<string, string> = { GENERATE_COACH_MESSAGE: SYSTEM_PROMPTS.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: SYSTEM_PROMPTS.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: SYSTEM_PROMPTS.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: SYSTEM_PROMPTS.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: SYSTEM_PROMPTS.WEEKLY_REFLECTION };
  return map[requestType] ?? SYSTEM_PROMPTS.COACH_MESSAGE;
}

function renderPromptTemplate(request: AIRequest): string {
  const map: Record<string, string> = { GENERATE_COACH_MESSAGE: USER_PROMPT_TEMPLATES.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: USER_PROMPT_TEMPLATES.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: USER_PROMPT_TEMPLATES.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: USER_PROMPT_TEMPLATES.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: USER_PROMPT_TEMPLATES.WEEKLY_REFLECTION };
  let rendered = map[request.requestType] ?? USER_PROMPT_TEMPLATES.COACH_MESSAGE;
  const values = request.context as Record<string, unknown>;
  for (const [key, value] of Object.entries(values)) {
    const renderedValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');
    rendered = rendered.replaceAll(`{{${key}}}`, renderedValue);
  }
  return rendered.replace(/\{\{[^}]+\}\}/g, '').replace(/\{\{\#[^}]+\}\}|\{\{\/[^}]+\}\}/g, '');
}

function buildStructuredData(request: AIRequest, content: string): Record<string, unknown> | undefined {
  const ctx = request.context as Record<string, number>;
  switch (request.requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return { message: content };
    case 'GENERATE_SESSION_SUMMARY':
      return { headline: 'Momentum check', highlights: [content], encouragement: 'Keep stacking focused sessions.' };
    case 'GENERATE_COMEBACK_PROMPT':
      return { message: content, progressPercent: Math.min(100, Math.round(((ctx.sessionsCompleted ?? 0) / 3) * 100)), encouragement: 'Fresh starts count.' };
    case 'GENERATE_STREAK_RISK_NUDGE':
      return { urgencyMessage: content, streakCount: ctx.currentStreak ?? 0, suggestedDuration: 15, emoji: '🔥' };
    case 'GENERATE_WEEKLY_REFLECTION':
      return { headline: 'Week at a glance', wins: [content], reflection: 'Momentum compounds when you keep showing up.', nextWeekGoal: 'Protect the streak and finish one more session than last week.', encouragement: 'You are building a repeatable focus habit.' };
    default:
      return undefined;
  }
}

function buildFallbackResponse(request: AIRequest, errorMessage: string, processingTimeMs = 0, status: number = 200): AIResponse {
  const contextData = request.context as Record<string, unknown>;
  const hasContext = Object.keys(contextData).filter((k) => contextData[k] !== undefined && contextData[k] !== null).length > 0;
  const fallbackContent = getFallbackContent(request);
  return {
    success: status < 400,
    requestType: request.requestType,
    content: hasContext ? fallbackContent : '',
    metadata: { model: 'fallback', processingTimeMs, cached: false },
    error: status < 400 ? undefined : { code: 'FALLBACK_USED', message: errorMessage, retryable: true },
    structuredData: hasContext ? buildStructuredData(request, fallbackContent) : undefined,
  } as AIResponse;
}

function getFallbackContent(request: AIRequest): string {
  const ctx = request.context as Record<string, unknown>;
  switch (request.requestType) {
    case 'GENERATE_COACH_MESSAGE': {
      const persona = (ctx.personaStyle ?? 'MENTOR') as string;
      return persona === 'CALM_COACH' ? 'Keep breathing. Progress over perfection.' : persona === 'HARD_PUSHER' ? 'Push one more rep.' : 'Small step today. Big progress this week.';
    }
    case 'GENERATE_SESSION_SUMMARY': {
      const quality = typeof ctx.averageSessionQuality === 'number' ? ctx.averageSessionQuality : 72;
      const focus = typeof ctx.totalFocusMinutes === 'number' ? ctx.totalFocusMinutes : 90;
      const mins = Math.round(focus);
      return `You completed a solid session. Quality was ${quality}% across ${mins} minutes. Momentum is building.`;
    }
    case 'GENERATE_COMEBACK_PROMPT': {
      const days = typeof ctx.daysInactive === 'number' ? ctx.daysInactive : 1;
      return days >= 7 ? `Welcome back after ${days} days. The first session back is the hardest — start small.` : 'Welcome back. Keep the streak alive with one short session.';
    }
    case 'GENERATE_STREAK_RISK_NUDGE': {
      const streak = typeof ctx.currentStreak === 'number' ? ctx.currentStreak : 0;
      return streak >= 7 ? 'Your streak is strong. One session keeps the chain intact.' : 'Your streak is at risk. A 15-minute session resets the clock.';
    }
    case 'GENERATE_WEEKLY_REFLECTION': {
      const completed = typeof ctx.sessionsCompleted === 'number' ? ctx.sessionsCompleted : 3;
      return `You completed ${completed} sessions this week. Consistent effort compounds. Protect the streak and build on this rhythm.`;
    }
    default:
      return 'Keep going. Consistency beats intensity.';
  }
}
