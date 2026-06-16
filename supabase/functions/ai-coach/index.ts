import { buildCorsHeaders } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { AIRequestSchema, AIRequestTypeSchema, CoachPayloadSchema, type AIRequest } from './schemas.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { callOpenAICompatible, getOpenAICompatibleConfig, getOpenAICompatibleModel } from '../_shared/openai-compatible.ts';
import { buildCoachSystemPrompt } from '../_shared/vex-ai-prompt.ts';
import { extractJsonObject, stripAiMarkdown } from '../_shared/vex-ai-output.ts';

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
const httpRequest = globalThis.fetch.bind(globalThis);
const MAX_BODY_LENGTH = 10000;

Deno.serve(async (request) => {
  const corsHeaders = buildCorsHeaders(request);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = await verifyAuthorizedUser(request, respond);
  if (!auth.ok) return auth.response;
  if (request.method !== 'POST') return respond(buildError('GENERATE_COACH_MESSAGE', Date.now(), 'INVALID_REQUEST', 'Method not allowed', false), 405, request);
  const startedAt = Date.now();
  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_LENGTH) {
    return respond(buildError('GENERATE_COACH_MESSAGE', startedAt, 'INVALID_REQUEST', 'Request body too large', false), 413, request);
  }
  let body: unknown;
  try { body = JSON.parse(bodyText); } catch { body = null; }
  const parsed = AIRequestSchema.safeParse(body);
  if (!parsed.success) return respond(buildError(readRequestType(body), startedAt, 'INVALID_REQUEST', 'Invalid AI request payload', false), 400, request);
  if (parsed.data.userId !== auth.user.id) return respond(buildError(parsed.data.requestType, startedAt, 'FORBIDDEN', 'Request user does not match auth token', false), 403, request);
  const llmConfig = getOpenAICompatibleConfig();
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!llmConfig && !apiKey) return respond(buildError(parsed.data.requestType, startedAt, 'LLM_API_ERROR', 'Missing LLM configuration', true), 200, request);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (parsed.data.requestType === 'GENERATE_COACH_MESSAGE' && supabaseUrl && serviceRoleKey) {
    const rateLimit = await checkRateLimit(parsed.data.userId, 'ai:coach', supabaseUrl, serviceRoleKey);
    if (!rateLimit.allowed) return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_RATE_LIMIT', 'Hourly AI coach message limit reached', true), 200, request);
  }
  try {
    const prompt = buildPrompt(parsed.data);
    if (llmConfig) {
      const model = getOpenAICompatibleModel('fast', 'auto');
      const llm = await callOpenAICompatible({ config: llmConfig, model, systemPrompt: prompt.system, userPrompt: prompt.user, timeoutMs: 9000, temperature: 0.4, maxTokens: prompt.maxOutputTokens, jsonMode: parsed.data.requestType === 'GENERATE_COACH_MESSAGE' });
      try {
        return respond(buildTextSuccess(parsed.data, llm.content, llm.model, startedAt, false, llm.promptTokens, llm.responseTokens), 200, request);
      } catch (error) {
        if (parsed.data.requestType !== 'GENERATE_COACH_MESSAGE') throw error;
        const fallbackModel = Deno.env.get('LLM_MODEL_JSON_FALLBACK') ?? 'groq/compound-mini';
        const fallback = await callOpenAICompatible({ config: llmConfig, model: fallbackModel, systemPrompt: prompt.system, userPrompt: prompt.user, timeoutMs: 9000, temperature: 0.2, maxTokens: prompt.maxOutputTokens, jsonMode: true });
        return respond(buildTextSuccess(parsed.data, fallback.content, fallback.model, startedAt, true, fallback.promptTokens, fallback.responseTokens), 200, request);
      }
    }
    if (!apiKey) return respond(buildError(parsed.data.requestType, startedAt, 'LLM_API_ERROR', 'Missing LLM configuration', true), 200, request);
    const gemini = await callGemini(apiKey, prompt.system, prompt.user, prompt.maxOutputTokens);
    return respond(buildSuccess(parsed.data, gemini, startedAt), 200, request);
  } catch (error) {
    return respond(buildError(parsed.data.requestType, startedAt, 'LLM_API_ERROR', error instanceof Error ? error.message : 'LLM request failed', true), 200, request);
  }
});

function buildPrompt(request: AIRequest): { system: string; user: string; maxOutputTokens: number } {
  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
    const persona = request.context.personaStyle ?? 'MENTOR';
    const recent = (request.context.recentSessionOutcomes ?? []).map((e, i) => `#${i + 1}: score=${e.score}, quality=${e.focusQuality ?? e.score}, duration=${e.durationMinutes ?? 0}m`).join('; ') || 'none';
    return { system: buildCoachSystemPrompt(persona), user: `Category=${request.context.category}. Level=${request.context.currentLevel ?? 1}. Streak=${request.context.currentStreak ?? 0}. Hours=${request.context.hoursSinceLastSession ?? 0}. Inactive=${request.context.daysInactive ?? 0}. Recent3=${recent}.`, maxOutputTokens: 150 };
  }
  return { system: 'Return a short plain-text coaching response.', user: JSON.stringify(request.context), maxOutputTokens: 150 };
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string, maxOutputTokens: number): Promise<GeminiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await httpRequest(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, signal: controller.signal, body: JSON.stringify({ systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] }, contents: [{ role: 'user', parts: [{ text: userPrompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens } }) });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    return (await response.json()) as GeminiResponse;
  } finally { clearTimeout(timeoutId); }
}

function buildSuccess(request: AIRequest, gemini: GeminiResponse, startedAt: number) {
  const rawText = gemini.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? '';
  const metadata = { model: 'gemini-1.5-flash', processingTimeMs: Date.now() - startedAt, promptTokens: gemini.usageMetadata?.promptTokenCount, responseTokens: gemini.usageMetadata?.candidatesTokenCount, cached: false };
  return buildTextPayload(request, rawText, metadata);
}

function buildTextSuccess(request: AIRequest, rawText: string, model: string, startedAt: number, fallbackUsed: boolean, promptTokens?: number, responseTokens?: number) {
  const metadata = { model, provider: 'freellmapi', fallbackUsed, processingTimeMs: Date.now() - startedAt, promptTokens, responseTokens, cached: false };
  return buildTextPayload(request, rawText, metadata);
}

function buildTextPayload(request: AIRequest, rawText: string, metadata: { model: string; provider?: string; fallbackUsed?: boolean; processingTimeMs: number; promptTokens?: number; responseTokens?: number; cached: boolean }) {
  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
    const structuredData = CoachPayloadSchema.parse(parseJsonBlock(rawText));
    return { success: true, requestType: request.requestType, content: structuredData.message, structuredData, metadata };
  }
  return { success: true, requestType: request.requestType, content: stripMarkdown(rawText).slice(0, 1000), structuredData: {}, metadata };
}

function buildError(requestType: AIRequest['requestType'], startedAt: number, code: string, message: string, retryable: boolean) {
  return { success: false, requestType, content: '', structuredData: requestType === 'GENERATE_COACH_MESSAGE' ? { message: '', tone: 'calm', urgency: 'low' } : {}, metadata: { model: 'gemini-1.5-flash', processingTimeMs: Date.now() - startedAt, cached: false }, error: { code, message, retryable } };
}

function parseJsonBlock(text: string): unknown {
  const matched = extractJsonObject(text);
  if (!matched) throw new Error('LLM returned non-JSON content');
  return JSON.parse(matched) as unknown;
}

function stripMarkdown(text: string): string { return stripAiMarkdown(text); }

function readRequestType(rawBody: unknown): AIRequest['requestType'] {
  if (typeof rawBody !== 'object' || rawBody === null || !('requestType' in rawBody)) return 'GENERATE_COACH_MESSAGE';
  const parsed = AIRequestTypeSchema.safeParse(rawBody.requestType);
  return parsed.success ? parsed.data : 'GENERATE_COACH_MESSAGE';
}

function respond(payload: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(payload), { status, headers: buildCorsHeaders(request, { includeJsonContentType: true }) });
}
