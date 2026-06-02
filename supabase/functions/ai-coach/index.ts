1|     2|import { buildCorsHeaders } from '../_shared/cors.ts';
3|import { verifyAuthorizedUser } from '../_shared/auth.ts';
4|import { AIRequestSchema, AIRequestTypeSchema, CoachPayloadSchema, type AIRequest } from './schemas.ts';
5|import { checkRateLimit } from '../_shared/rate-limit.ts';
6|
7|type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
8|const httpRequest = globalThis.fetch.bind(globalThis);
9|
10|Deno.serve(async (request) => {
11|  const corsHeaders = buildCorsHeaders(request);
12|  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
13|  const auth = await verifyAuthorizedUser(request, respond);
14|  if (!auth.ok) return auth.response;
15|  if (request.method !== 'POST') return respond(buildError('GENERATE_COACH_MESSAGE', Date.now(), 'INVALID_REQUEST', 'Method not allowed', false), 405, request);
16|  const startedAt = Date.now();
17|  const body = await request.json().catch(() => null);
18|  const parsed = AIRequestSchema.safeParse(body);
19|  if (!parsed.success) return respond(buildError(readRequestType(body), startedAt, 'INVALID_REQUEST', 'Invalid AI request payload', false), 400, request);
20|  if (parsed.data.userId !== auth.user.id) return respond(buildError(parsed.data.requestType, startedAt, 'FORBIDDEN', 'Request user does not match auth token', false), 403, request);
21|  const apiKey = Deno.env.get('GEMINI_API_KEY');
22|  if (!apiKey) return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_API_ERROR', 'Missing Gemini configuration', true), 200, request);
23|  const supabaseUrl = Deno.env.get('SUPABASE_URL');
24|  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
25|  if (parsed.data.requestType === 'GENERATE_COACH_MESSAGE' && supabaseUrl && serviceRoleKey) {
26|    const rateLimit = await checkRateLimit(parsed.data.userId, 'ai:coach', supabaseUrl, serviceRoleKey);
27|    if (!rateLimit.allowed) return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_RATE_LIMIT', 'Hourly AI coach message limit reached', true), 200, request);
28|  }
    // REVIEW: entitlement check — no server-side entitlement table exists yet.
    // TODO: query profiles.entitlement_tier (or equivalent) here before allowing AI coach access.
    // Current behavior: fail-open. Remove this block once entitlement sync is implemented.
    // See audit SEC-05.
29|  try {
30|    const prompt = buildPrompt(parsed.data);
31|    const gemini = await callGemini(apiKey, prompt.system, prompt.user, prompt.maxOutputTokens);
32|    return respond(buildSuccess(parsed.data, gemini, startedAt), 200, request);
33|  } catch (error) {
34|    return respond(buildError(parsed.data.requestType, startedAt, 'GEMINI_API_ERROR', error instanceof Error ? error.message : 'Gemini request failed', true), 200, request);
35|  }
36|});
37|
38|function buildPrompt(request: AIRequest): { system: string; user: string; maxOutputTokens: number } {
39|  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
40|    const persona = request.context.personaStyle ?? 'MENTOR';
41|    const recent = (request.context.recentSessionOutcomes ?? []).map((e, i) => `#${i + 1}: score=${e.score}, quality=${e.focusQuality ?? e.score}, duration=${e.durationMinutes ?? 0}m`).join('; ') || 'none';
42|    return { system: `You are VEX AI Coach in ${persona} persona. Return ONLY valid JSON with keys message, tone, urgency, optional actionLabel, optional action (START_SESSION, VIEW_PROGRESS, VIEW_SETTINGS, START_COMEBACK, VIEW_BOSS, VIEW_CHALLENGES, VIEW_SQUAD, VIEW_SHOP, OPEN_COACH, OPEN_CONTENT_STUDY, NONE).`, user: `Category=${request.context.category}. Level=${request.context.currentLevel ?? 1}. Streak=${request.context.currentStreak ?? 0}. Hours=${request.context.hoursSinceLastSession ?? 0}. Inactive=${request.context.daysInactive ?? 0}. Recent3=${recent}.`, maxOutputTokens: 150 };
43|  }
44|  return { system: 'Return a short plain-text coaching response.', user: JSON.stringify(request.context), maxOutputTokens: 150 };
45|}
46|
47|
48|async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string, maxOutputTokens: number): Promise<GeminiResponse> {
49|  const controller = new AbortController();
50|  const timeoutId = setTimeout(() => controller.abort(), 9000);
51|  try {
52|    const response = await httpRequest(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, signal: controller.signal, body: JSON.stringify({ systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] }, contents: [{ role: 'user', parts: [{ text: userPrompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens } }) });
53|    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
54|    return (await response.json()) as GeminiResponse;
55|  } finally { clearTimeout(timeoutId); }
56|}
57|
58|function buildSuccess(request: AIRequest, gemini: GeminiResponse, startedAt: number) {
59|  const rawText = gemini.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('\n') ?? '';
60|  const metadata = { model: 'gemini-1.5-flash', processingTimeMs: Date.now() - startedAt, promptTokens: gemini.usageMetadata?.promptTokenCount, responseTokens: gemini.usageMetadata?.candidatesTokenCount, cached: false };
61|  if (request.requestType === 'GENERATE_COACH_MESSAGE') {
62|    const structuredData = CoachPayloadSchema.parse(parseJsonBlock(rawText));
63|    return { success: true, requestType: request.requestType, content: structuredData.message, structuredData, metadata };
64|  }
65|  return { success: true, requestType: request.requestType, content: stripMarkdown(rawText).slice(0, 1000), structuredData: {}, metadata };
66|}
67|
68|function buildError(requestType: AIRequest['requestType'], startedAt: number, code: string, message: string, retryable: boolean) {
69|  return { success: false, requestType, content: '', structuredData: requestType === 'GENERATE_COACH_MESSAGE' ? { message: '', tone: 'calm', urgency: 'low' } : {}, metadata: { model: 'gemini-1.5-flash', processingTimeMs: Date.now() - startedAt, cached: false }, error: { code, message, retryable } };
70|}
71|
72|function parseJsonBlock(text: string): unknown {
73|  const matched = stripMarkdown(text).match(/\{[\s\S]*\}/);
74|  if (!matched) throw new Error('Gemini API error: invalid JSON response');
75|  return JSON.parse(matched[0]) as unknown;
76|}
77|
78|function stripMarkdown(text: string): string { return text.replace(/```json|```/g, '').replace(/\*\*/g, '').trim(); }
79|
80|function readRequestType(rawBody: unknown): AIRequest['requestType'] {
81|  if (typeof rawBody !== 'object' || rawBody === null || !('requestType' in rawBody)) return 'GENERATE_COACH_MESSAGE';
82|  const parsed = AIRequestTypeSchema.safeParse(rawBody.requestType);
83|  return parsed.success ? parsed.data : 'GENERATE_COACH_MESSAGE';
84|}
85|
86|function respond(payload: unknown, status: number, request: Request): Response {
87|  return new Response(JSON.stringify(payload), { status, headers: buildCorsHeaders(request, { includeJsonContentType: true }) });
88|}
89|