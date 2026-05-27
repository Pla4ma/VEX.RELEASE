import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { AIRequestSchema, AIRequestTypeSchema, CoachPayloadSchema, type AIRequest } from './schemas.ts';

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
const httpRequest = globalThis.fetch.bind(globalThis);

serve(async (request) => {
  const corsHeaders = buildCorsHeaders(request);
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = await verifyAuthorizedUser(request, respond);
  if (!auth.ok) return auth.response;
  if (request.method !== 'POST') return respond(buildError('GENERATE_COACH_MESSAGE', Date.now(), 'INVALID_REQUEST', 'Method not allowed', false), 405, request);
  const startedAt = Date.now();
  const body = await request.json().catch(() => null);
  const parsed = AIRequestSchema.safeParse(body);
  if (!parsed.success) return respond(buildError(readRequestType(body), startedAt, 'INVALID_REQUEST', 'Invalid AI request payload', false), 400, request);
  if (parsed.data.userId !== auth.userId) return respond(buildError(parsed.data.requestType, startedAt, 'FORBIDDEN', 'Request user does not match auth token', false), 403, request);
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_API_ERROR', 'Missing Gemini configuration', true), 200, request);
  if (parsed.data.requestType === 'GENERATE_COACH_MESSAGE' && await isRateLimited(parsed.data.userId)) {
    return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_RATE_LIMIT', 'Hourly AI coach message limit reached', true), 200, request);
  }
  try {
    const prompt = buildPrompt(parsed.data);
    const gemini = await callGemini(apiKey, prompt.system, prompt.user, prompt.maxOutputTokens);
    return respond(buildSuccess(parsed.data, gemini, startedAt), 200, request);
  } catch (error) {
    return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_API_ERROR', error instanceof Error ? error.message : 'Gemini request failed', true), 200, request);
  }
});

function buildPrompt(request: AIRequest): { system: string; user: string; maxOutputTokens: number } {
  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
    const persona = request.context.personaStyle ?? 'MENTOR';
    const recent = (request.context.recentSessionOutcomes ?? []).map((e, i) => `#${i + 1}: score=${e.score}, quality=${e.focusQuality ?? e.score}, duration=${e.durationMinutes ?? 0}m`).join('; ') || 'none';
    return { system: `You are VEX AI Coach in ${persona} persona. Return ONLY valid JSON with keys message, tone, urgency, optional actionLabel, optional action (START_SESSION, VIEW_PROGRESS, VIEW_SETTINGS, START_COMEBACK, VIEW_BOSS, VIEW_CHALLENGES, VIEW_SQUAD, VIEW_SHOP, OPEN_COACH, OPEN_CONTENT_STUDY, NONE).`, user: `Category=${request.context.category}. Level=${request.context.currentLevel ?? 1}. Streak=${request.context.currentStreak ?? 0}. Hours=${request.context.hoursSinceLastSession ?? 0}. Inactive=${request.context.daysInactive ?? 0}. Recent3=${recent}.`, maxOutputTokens: 150 };
  }
  return { system: 'Return a short plain-text coaching response.', user: JSON.stringify(request.context), maxOutputTokens: 150 };
}

async function isRateLimited(userId: string): Promise<boolean> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) return false;
  const supabase = createClient(url, serviceRoleKey);
  const { count } = await supabase.from('coach_messages').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
  return (count ?? 0) >= 5;
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string, maxOutputTokens: number): Promise<GeminiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await httpRequest(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] }, contents: [{ role: 'user', parts: [{ text: userPrompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens } }) });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    return (await response.json()) as GeminiResponse;
  } finally { clearTimeout(timeoutId); }
}

function buildSuccess(request: AIRequest, gemini: GeminiResponse, startedAt: number) {
  const rawText = gemini.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? '';
  const metadata = { model: 'gemini-1.5-flash', processingTimeMs: Date.now() - startedAt, promptTokens: gemini.usageMetadata?.promptTokenCount, responseTokens: gemini.usageMetadata?.candidatesTokenCount, cached: false };
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
  const matched = stripMarkdown(text).match(/\{[\s\S]*\}/);
  if (!matched) throw new Error('Gemini API error: invalid JSON response');
  return JSON.parse(matched[0]) as unknown;
}

function stripMarkdown(text: string): string { return text.replace(/```json|```/g, '').replace(/\*\*/g, '').trim(); }

function readRequestType(rawBody: unknown): AIRequest['requestType'] {
  if (typeof rawBody !== 'object' || rawBody === null || !('requestType' in rawBody)) return 'GENERATE_COACH_MESSAGE';
  const parsed = AIRequestTypeSchema.safeParse(rawBody.requestType);
  return parsed.success ? parsed.data : 'GENERATE_COACH_MESSAGE';
}

function respond(payload: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(payload), { status, headers: buildCorsHeaders(request, { includeJsonContentType: true }) });
}
