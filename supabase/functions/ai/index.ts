1|     2|import { buildCorsHeaders } from '../_shared/cors.ts';
3|import { AIRequestSchema, type AIRequest, type AIResponse } from '../../../src/shared/ai/ai-types.ts';
4|import { AI_TIMEOUTS, FALLBACK_CONTENT, GENERATION_CONFIG, MODEL_BY_USE_CASE, SYSTEM_PROMPTS, USER_PROMPT_TEMPLATES } from '../../../src/shared/ai/ai-constants.ts';
5|import { verifyAuthorizedUser, jsonResponse } from './auth.ts';
6|import { callGemini } from './gemini.ts';
7|import { checkRateLimit } from '../_shared/rate-limit.ts';
8|
9|const ROUTE_BY_SLUG: Record<string, AIRequest['requestType']> = {
10|  'coach-message': 'GENERATE_COACH_MESSAGE',
11|  'session-summary': 'GENERATE_SESSION_SUMMARY',
12|  'comeback-prompt': 'GENERATE_COMEBACK_PROMPT',
13|  'streak-nudge': 'GENERATE_STREAK_RISK_NUDGE',
14|  'weekly-reflection': 'GENERATE_WEEKLY_REFLECTION',
15|};
16|
17|Deno.serve(async (request) => {
18|  const corsHeaders = buildCorsHeaders(request);
19|  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
20|  const auth = await verifyAuthorizedUser(request);
21|  if (!auth.ok) return auth.response;
22|  const supabaseUrl = Deno.env.get('SUPABASE_URL');
23|  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
24|  if (supabaseUrl && serviceRoleKey) {
25|    const rateLimit = await checkRateLimit(auth.userId, 'ai:generate', supabaseUrl, serviceRoleKey);
26|    if (!rateLimit.allowed) return jsonResponse({ error: 'Rate limit exceeded. Try again later.', retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) }, 429, corsHeaders);
27|  }
28|  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
29|
30|  const slug = getRouteSlug(request.url);
31|  const expectedRequestType = ROUTE_BY_SLUG[slug];
32|  if (!expectedRequestType) return jsonResponse({ error: 'Unknown AI endpoint' }, 404, corsHeaders);
33|
34|  try {
35|    const payload = await request.json();
36|    const parsedRequest = AIRequestSchema.safeParse(payload);
37|    if (!parsedRequest.success) return jsonResponse({ error: 'Invalid AI request payload' }, 400, corsHeaders);
38|    if (parsedRequest.data.requestType !== expectedRequestType) return jsonResponse({ error: `Route expects ${expectedRequestType}, received ${parsedRequest.data.requestType}` }, 400, corsHeaders);
39|    if (parsedRequest.data.userId !== auth.userId) return jsonResponse({ error: 'Forbidden: request user does not match auth token' }, 403, corsHeaders);
40|    const response = await generateAIResponse(parsedRequest.data);
41|    return jsonResponse(response, 200, corsHeaders);
42|  } catch (error) {
43|    if (error instanceof SyntaxError) return jsonResponse({ error: 'Invalid JSON payload' }, 400, corsHeaders);
44|    const fallback = buildFallbackResponse({ requestType: expectedRequestType, userId: crypto.randomUUID(), context: {} } as AIRequest, error instanceof Error ? error.message : 'Unknown AI error');
45|    return jsonResponse(fallback, 200, corsHeaders);
46|  }
47|});
48|
49|function getRouteSlug(url: string): string {
50|  const parts = new URL(url).pathname.replace(/\/$/, '').split('/').filter(Boolean);
51|  return parts[parts.length - 1] ?? '';
52|}
53|
54|async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
55|  const startedAt = Date.now();
56|  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
57|  if (!geminiApiKey) return buildFallbackResponse(request, 'Missing GEMINI_API_KEY');
58|  try {
59|    const model = resolveModel(request.requestType);
60|    const content = await callGemini({ apiKey: geminiApiKey, model, systemPrompt: resolveSystemPrompt(request.requestType), userPrompt: renderPromptTemplate(request), timeoutMs: resolveTimeout(request.requestType), generationConfig: resolveGenerationConfig(request.requestType) });
61|    return { success: true, requestType: request.requestType, content, metadata: { model, processingTimeMs: Date.now() - startedAt }, structuredData: buildStructuredData(request, content) } as AIResponse;
62|  } catch (error) {
63|    return buildFallbackResponse(request, error instanceof Error ? error.message : 'Gemini API failure', Date.now() - startedAt);
64|  }
65|}
66|
67|function resolveModel(requestType: AIRequest['requestType']): string {
68|  return Deno.env.get(requestType === 'GENERATE_SESSION_SUMMARY' || requestType === 'GENERATE_WEEKLY_REFLECTION' ? 'GEMINI_MODEL_PRO' : 'GEMINI_MODEL_FLASH') || MODEL_BY_USE_CASE[requestType] || 'gemini-2.5-flash';
69|}
70|
71|function resolveTimeout(requestType: AIRequest['requestType']): number {
72|  const map: Record<string, number> = { GENERATE_COACH_MESSAGE: AI_TIMEOUTS.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: AI_TIMEOUTS.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: AI_TIMEOUTS.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: AI_TIMEOUTS.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: AI_TIMEOUTS.WEEKLY_REFLECTION };
73|  return map[requestType] ?? AI_TIMEOUTS.DEFAULT;
74|}
75|
76|function resolveGenerationConfig(requestType: AIRequest['requestType']): Record<string, number> {
77|  const map: Record<string, Record<string, number>> = { GENERATE_COACH_MESSAGE: GENERATION_CONFIG.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: GENERATION_CONFIG.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: GENERATION_CONFIG.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: GENERATION_CONFIG.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: GENERATION_CONFIG.WEEKLY_REFLECTION };
78|  return map[requestType] ?? GENERATION_CONFIG.COACH_MESSAGE;
79|}
80|
81|function resolveSystemPrompt(requestType: AIRequest['requestType']): string {
82|  const map: Record<string, string> = { GENERATE_COACH_MESSAGE: SYSTEM_PROMPTS.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: SYSTEM_PROMPTS.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: SYSTEM_PROMPTS.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: SYSTEM_PROMPTS.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: SYSTEM_PROMPTS.WEEKLY_REFLECTION };
83|  return map[requestType] ?? SYSTEM_PROMPTS.COACH_MESSAGE;
84|}
85|
86|function renderPromptTemplate(request: AIRequest): string {
87|  const map: Record<string, string> = { GENERATE_COACH_MESSAGE: USER_PROMPT_TEMPLATES.COACH_MESSAGE, GENERATE_SESSION_SUMMARY: USER_PROMPT_TEMPLATES.SESSION_SUMMARY, GENERATE_COMEBACK_PROMPT: USER_PROMPT_TEMPLATES.COMEBACK_PROMPT, GENERATE_STREAK_RISK_NUDGE: USER_PROMPT_TEMPLATES.STREAK_RISK_NUDGE, GENERATE_WEEKLY_REFLECTION: USER_PROMPT_TEMPLATES.WEEKLY_REFLECTION };
88|  let rendered = map[request.requestType] ?? USER_PROMPT_TEMPLATES.COACH_MESSAGE;
89|  const values = request.context as Record<string, unknown>;
90|  for (const [key, value] of Object.entries(values)) {
91|    const renderedValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');
92|    rendered = rendered.replaceAll(`{{${key}}}`, renderedValue);
93|    if (key === 'averageSessionQuality') rendered = rendered.replaceAll('{{averageQuality}}', renderedValue);
94|    if (key === 'totalFocusMinutes') rendered = rendered.replaceAll('{{totalFocusHours}}', renderedValue);
95|  }
96|  return rendered.replace(/\{\{[^}]+\}\}/g, '').replace(/\{\{#[^}]+\}\}|\{\{\/[^}]+\}\}/g, '');
97|}
98|
99|function buildStructuredData(request: AIRequest, content: string): Record<string, unknown> | undefined {
100|  const ctx = request.context as Record<string, number>;
101|  switch (request.requestType) {
102|    case 'GENERATE_COACH_MESSAGE': return { message: content };
103|    case 'GENERATE_SESSION_SUMMARY': return { headline: 'Momentum check', highlights: [content], encouragement: 'Keep stacking focused sessions.' };
104|    case 'GENERATE_COMEBACK_PROMPT': return { message: content, progressPercent: Math.min(100, Math.round(((ctx.sessionsCompleted ?? 0) / 3) * 100)), encouragement: 'Fresh starts count.' };
105|    case 'GENERATE_STREAK_RISK_NUDGE': return { urgencyMessage: content, streakCount: ctx.currentStreak ?? 0, suggestedDuration: 15, emoji: '🔥' };
106|    case 'GENERATE_WEEKLY_REFLECTION': return { headline: 'Week at a glance', wins: [content], reflection: 'Momentum compounds when you keep showing up.', nextWeekGoal: 'Protect the streak and finish one more session than last week.', encouragement: 'You are building a repeatable focus habit.' };
107|    default: return undefined;
108|  }
109|}
110|
111|function buildFallbackResponse(request: AIRequest, errorMessage: string, processingTimeMs = 0): AIResponse {
112|  const contextData = request.context as Record<string, unknown>;
113|  const hasContext = Object.keys(contextData).filter((k) => contextData[k] !== undefined && contextData[k] !== null).length > 0;
114|  const fallbackContent = getFallbackContent(request);
115|  return { success: true, requestType: request.requestType, content: hasContext ? fallbackContent : '', metadata: { model: 'fallback', processingTimeMs, cached: false }, error: { code: 'FALLBACK_USED', message: errorMessage, retryable: true }, structuredData: hasContext ? buildStructuredData(request, fallbackContent) : undefined } as AIResponse;
116|}
117|
118|function getFallbackContent(request: AIRequest): string {
119|  const ctx = request.context as Record<string, unknown>;
120|  switch (request.requestType) {
121|    case 'GENERATE_COACH_MESSAGE': {
122|      const cat = String(ctx.category ?? 'MOTIVATION_BOOST') as keyof typeof FALLBACK_CONTENT.COACH_MESSAGE;
123|      return (FALLBACK_CONTENT.COACH_MESSAGE[cat] ?? FALLBACK_CONTENT.COACH_MESSAGE.MOTIVATION_BOOST)[0];
124|    }
125|    case 'GENERATE_SESSION_SUMMARY': return FALLBACK_CONTENT.SESSION_SUMMARY.daily[0];
126|    case 'GENERATE_COMEBACK_PROMPT': {
127|      const day = Number(ctx.comebackDay ?? 1);
128|      if (day >= 3) return FALLBACK_CONTENT.COMEBACK_PROMPT.day3;
129|      if (day === 2) return FALLBACK_CONTENT.COMEBACK_PROMPT.day2;
130|      return FALLBACK_CONTENT.COMEBACK_PROMPT.day1;
131|    }
132|    case 'GENERATE_STREAK_RISK_NUDGE': return FALLBACK_CONTENT.STREAK_RISK_NUDGE[String(ctx.riskLevel ?? 'medium') as keyof typeof FALLBACK_CONTENT.STREAK_RISK_NUDGE] ?? FALLBACK_CONTENT.STREAK_RISK_NUDGE.medium;
133|    case 'GENERATE_WEEKLY_REFLECTION': return FALLBACK_CONTENT.WEEKLY_REFLECTION.default;
134|    default: return 'Keep going. Your next focused session matters.';
135|  }
136|}
137|