import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

import { buildCorsHeaders } from '../_shared/cors.ts';
import {
  AIRequestSchema,
  type AIRequest,
  type AIResponse,
  type GeminiAPIResponse,
} from '../../../src/shared/ai/ai-types.ts';
import {
  AI_TIMEOUTS,
  FALLBACK_CONTENT,
  GENERATION_CONFIG,
  MODEL_BY_USE_CASE,
  RETRY_CONFIG,
  SAFETY_SETTINGS,
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
} from '../../../src/shared/ai/ai-constants.ts';

const ROUTE_BY_SLUG: Record<string, AIRequest['requestType']> = {
  'coach-message': 'GENERATE_COACH_MESSAGE',
  'session-summary': 'GENERATE_SESSION_SUMMARY',
  'comeback-prompt': 'GENERATE_COMEBACK_PROMPT',
  'streak-nudge': 'GENERATE_STREAK_RISK_NUDGE',
  'weekly-reflection': 'GENERATE_WEEKLY_REFLECTION',
};

const httpRequest = globalThis.fetch.bind(globalThis);

async function verifyAuthorizedUser(request: Request): Promise<
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      response: Response;
    }
> {
  const authorization = request.headers.get('authorization');
  const apiKey = request.headers.get('apikey');

  if (!authorization || !apiKey) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Unauthorized' }, 401, request),
    };
  }

  const token = authorization.replace('Bearer ', '').trim();
  if (!token) {
    return {
      ok: false,
      response: jsonResponse(
        { error: 'Invalid authorization token' },
        401,
        request,
      ),
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      response: jsonResponse(
        { error: 'Server auth is not configured' },
        500,
        request,
      ),
    };
  }

  const authResponse = await httpRequest(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
  });

  if (!authResponse.ok) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Unauthorized' }, 401, request),
    };
  }

  const userPayload = (await authResponse.json()) as { id?: string };
  if (!userPayload.id) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Unauthorized' }, 401, request),
    };
  }

  return { ok: true, userId: userPayload.id };
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: buildCorsHeaders(request) });
  }

  const auth = await verifyAuthorizedUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'Method not allowed',
      },
      405,
      request,
    );
  }

  const slug = getRouteSlug(request.url);
  const expectedRequestType = ROUTE_BY_SLUG[slug];

  if (!expectedRequestType) {
    return jsonResponse(
      {
        error: 'Unknown AI endpoint',
      },
      404,
      request,
    );
  }

  try {
    const payload = await request.json();
    const parsedRequest = AIRequestSchema.safeParse(payload);

    if (!parsedRequest.success) {
      return jsonResponse(
        {
          error: 'Invalid AI request payload',
        },
        400,
        request,
      );
    }

    if (parsedRequest.data.requestType !== expectedRequestType) {
      return jsonResponse(
        {
          error: `Route expects ${expectedRequestType}, received ${parsedRequest.data.requestType}`,
        },
        400,
        request,
      );
    }

    if (parsedRequest.data.userId !== auth.userId) {
      return jsonResponse(
        {
          error: 'Forbidden: request user does not match auth token',
        },
        403,
        request,
      );
    }

    const response = await generateAIResponse(parsedRequest.data);
    return jsonResponse(response, 200, request);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonResponse(
        {
          error: 'Invalid JSON payload',
        },
        400,
        request,
      );
    }

    const fallbackResponse = buildFallbackResponse(
      {
        requestType: expectedRequestType,
        userId: crypto.randomUUID(),
        context: {},
      } as AIRequest,
      error instanceof Error ? error.message : 'Unknown AI error',
    );

    return jsonResponse(fallbackResponse, 200, request);
  }
});

function getRouteSlug(url: string): string {
  const pathname = new URL(url).pathname.replace(/\/$/, '');
  const segments = pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
}

async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  const startedAt = Date.now();
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

  if (!geminiApiKey) {
    return buildFallbackResponse(request, 'Missing GEMINI_API_KEY');
  }

  try {
    const model = resolveModel(request.requestType);
    const content = await callGemini({
      apiKey: geminiApiKey,
      model,
      systemPrompt: resolveSystemPrompt(request.requestType),
      userPrompt: renderPromptTemplate(request),
      timeoutMs: resolveTimeout(request.requestType),
      generationConfig: resolveGenerationConfig(request.requestType),
    });

    return {
      success: true,
      requestType: request.requestType,
      content,
      metadata: {
        model,
        processingTimeMs: Date.now() - startedAt,
      },
      structuredData: buildStructuredData(request, content),
    } as AIResponse;
  } catch (error) {
    return buildFallbackResponse(
      request,
      error instanceof Error ? error.message : 'Gemini API failure',
      Date.now() - startedAt,
    );
  }
}

async function callGemini(params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
  generationConfig: Record<string, number>;
}): Promise<string> {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < RETRY_CONFIG.MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), params.timeoutMs);

      const response = await httpRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': params.apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              role: 'user',
              parts: [{ text: params.systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: params.userPrompt }],
              },
            ],
            generationConfig: params.generationConfig,
            safetySettings: SAFETY_SETTINGS,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const payload = (await response.json()) as GeminiAPIResponse;
      const content = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join('\n');

      if (!content) {
        throw new Error('Gemini returned no content');
      }

      return sanitizeContent(content);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt += 1;

      if (attempt >= RETRY_CONFIG.MAX_RETRIES) {
        break;
      }

      const delay = Math.min(
        RETRY_CONFIG.INITIAL_DELAY_MS *
          RETRY_CONFIG.BACKOFF_MULTIPLIER ** (attempt - 1),
        RETRY_CONFIG.MAX_DELAY_MS,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError ?? new Error('Gemini call failed');
}

function sanitizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim().slice(0, 1800);
}

function resolveModel(requestType: AIRequest['requestType']): string {
  const envOverride =
    requestType === 'GENERATE_SESSION_SUMMARY' ||
    requestType === 'GENERATE_WEEKLY_REFLECTION'
      ? Deno.env.get('GEMINI_MODEL_PRO')
      : Deno.env.get('GEMINI_MODEL_FLASH');

  return envOverride || MODEL_BY_USE_CASE[requestType] || 'gemini-2.5-flash';
}

function resolveTimeout(requestType: AIRequest['requestType']): number {
  switch (requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return AI_TIMEOUTS.COACH_MESSAGE;
    case 'GENERATE_SESSION_SUMMARY':
      return AI_TIMEOUTS.SESSION_SUMMARY;
    case 'GENERATE_COMEBACK_PROMPT':
      return AI_TIMEOUTS.COMEBACK_PROMPT;
    case 'GENERATE_STREAK_RISK_NUDGE':
      return AI_TIMEOUTS.STREAK_RISK_NUDGE;
    case 'GENERATE_WEEKLY_REFLECTION':
      return AI_TIMEOUTS.WEEKLY_REFLECTION;
    default:
      return AI_TIMEOUTS.DEFAULT;
  }
}

function resolveGenerationConfig(
  requestType: AIRequest['requestType'],
): Record<string, number> {
  switch (requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return GENERATION_CONFIG.COACH_MESSAGE;
    case 'GENERATE_SESSION_SUMMARY':
      return GENERATION_CONFIG.SESSION_SUMMARY;
    case 'GENERATE_COMEBACK_PROMPT':
      return GENERATION_CONFIG.COMEBACK_PROMPT;
    case 'GENERATE_STREAK_RISK_NUDGE':
      return GENERATION_CONFIG.STREAK_RISK_NUDGE;
    case 'GENERATE_WEEKLY_REFLECTION':
      return GENERATION_CONFIG.WEEKLY_REFLECTION;
    default:
      return GENERATION_CONFIG.COACH_MESSAGE;
  }
}

function resolveSystemPrompt(requestType: AIRequest['requestType']): string {
  switch (requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return SYSTEM_PROMPTS.COACH_MESSAGE;
    case 'GENERATE_SESSION_SUMMARY':
      return SYSTEM_PROMPTS.SESSION_SUMMARY;
    case 'GENERATE_COMEBACK_PROMPT':
      return SYSTEM_PROMPTS.COMEBACK_PROMPT;
    case 'GENERATE_STREAK_RISK_NUDGE':
      return SYSTEM_PROMPTS.STREAK_RISK_NUDGE;
    case 'GENERATE_WEEKLY_REFLECTION':
      return SYSTEM_PROMPTS.WEEKLY_REFLECTION;
    default:
      return SYSTEM_PROMPTS.COACH_MESSAGE;
  }
}

function renderPromptTemplate(request: AIRequest): string {
  const template = (() => {
    switch (request.requestType) {
      case 'GENERATE_COACH_MESSAGE':
        return USER_PROMPT_TEMPLATES.COACH_MESSAGE;
      case 'GENERATE_SESSION_SUMMARY':
        return USER_PROMPT_TEMPLATES.SESSION_SUMMARY;
      case 'GENERATE_COMEBACK_PROMPT':
        return USER_PROMPT_TEMPLATES.COMEBACK_PROMPT;
      case 'GENERATE_STREAK_RISK_NUDGE':
        return USER_PROMPT_TEMPLATES.STREAK_RISK_NUDGE;
      case 'GENERATE_WEEKLY_REFLECTION':
        return USER_PROMPT_TEMPLATES.WEEKLY_REFLECTION;
      default:
        return USER_PROMPT_TEMPLATES.COACH_MESSAGE;
    }
  })();

  const values = request.context as Record<string, unknown>;
  let rendered = template;

  Object.entries(values).forEach(([key, value]) => {
    const renderedValue = Array.isArray(value)
      ? value.join(', ')
      : String(value ?? '');
    rendered = rendered.replaceAll(`{{${key}}}`, renderedValue);
    rendered = rendered.replaceAll(`{{${camelCaseAlias(key)}}}`, renderedValue);
  });

  rendered = rendered.replace(/\{\{[^}]+\}\}/g, '');
  rendered = rendered.replace(/\{\{#[^}]+\}\}|\{\{\/[^}]+\}\}/g, '');

  return rendered;
}

function camelCaseAlias(key: string): string {
  if (key === 'averageSessionQuality') {return 'averageQuality';}
  if (key === 'totalFocusHours') {return 'totalFocusHours';}
  if (key === 'totalFocusMinutes') {return 'totalFocusHours';}
  return key;
}

function buildStructuredData(
  request: AIRequest,
  content: string,
): Record<string, unknown> | undefined {
  switch (request.requestType) {
    case 'GENERATE_COACH_MESSAGE':
      return {
        message: content,
      };
    case 'GENERATE_SESSION_SUMMARY':
      return {
        headline: 'Momentum check',
        highlights: [content],
        encouragement: 'Keep stacking focused sessions.',
      };
    case 'GENERATE_COMEBACK_PROMPT':
      return {
        message: content,
        progressPercent: Math.min(
          100,
          Math.round(
            (((request.context as Record<string, number>).sessionsCompleted ??
              0) /
              3) *
              100,
          ),
        ),
        encouragement: 'Fresh starts count.',
      };
    case 'GENERATE_STREAK_RISK_NUDGE':
      return {
        urgencyMessage: content,
        streakCount:
          (request.context as Record<string, number>).currentStreak ?? 0,
        suggestedDuration: 15,
        emoji: '🔥',
      };
    case 'GENERATE_WEEKLY_REFLECTION':
      return {
        headline: 'Week at a glance',
        wins: [content],
        reflection: 'Momentum compounds when you keep showing up.',
        nextWeekGoal:
          'Protect the streak and finish one more session than last week.',
        encouragement: 'You are building a repeatable focus habit.',
      };
    default:
      return undefined;
  }
}

function buildFallbackResponse(
  request: AIRequest,
  errorMessage: string,
  processingTimeMs: number = 0,
): AIResponse {
  const contextData = request.context as Record<string, unknown>;
  const hasContext = Object.keys(contextData).filter((k) => contextData[k] !== undefined && contextData[k] !== null).length > 0;

  const fallbackContent = (() => {
    switch (request.requestType) {
      case 'GENERATE_COACH_MESSAGE': {
        const category = String(
          (request.context as Record<string, string>).category ??
            'MOTIVATION_BOOST',
        );
        const options =
          FALLBACK_CONTENT.COACH_MESSAGE[
            category as keyof typeof FALLBACK_CONTENT.COACH_MESSAGE
          ] ?? FALLBACK_CONTENT.COACH_MESSAGE.MOTIVATION_BOOST;
        return options[0];
      }
      case 'GENERATE_SESSION_SUMMARY':
        return FALLBACK_CONTENT.SESSION_SUMMARY.daily[0];
      case 'GENERATE_COMEBACK_PROMPT': {
        const comebackDay = Number(
          (request.context as Record<string, number>).comebackDay ?? 1,
        );
        if (comebackDay >= 3) {return FALLBACK_CONTENT.COMEBACK_PROMPT.day3;}
        if (comebackDay === 2) {return FALLBACK_CONTENT.COMEBACK_PROMPT.day2;}
        return FALLBACK_CONTENT.COMEBACK_PROMPT.day1;
      }
      case 'GENERATE_STREAK_RISK_NUDGE': {
        const riskLevel = String(
          (request.context as Record<string, string>).riskLevel ?? 'medium',
        );
        return (
          FALLBACK_CONTENT.STREAK_RISK_NUDGE[
            riskLevel as keyof typeof FALLBACK_CONTENT.STREAK_RISK_NUDGE
          ] ?? FALLBACK_CONTENT.STREAK_RISK_NUDGE.medium
        );
      }
      case 'GENERATE_WEEKLY_REFLECTION':
        return FALLBACK_CONTENT.WEEKLY_REFLECTION.default;
      default:
        return 'Keep going. Your next focused session matters.';
    }
  })();

  return {
    success: true,
    requestType: request.requestType,
    content: hasContext ? fallbackContent : '',
    metadata: {
      model: 'fallback',
      processingTimeMs,
      cached: false,
    },
    error: {
      code: 'FALLBACK_USED',
      message: errorMessage,
      retryable: true,
    },
    structuredData: hasContext ? buildStructuredData(request, fallbackContent) : undefined,
  } as AIResponse;
}

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
