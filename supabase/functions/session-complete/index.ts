1|     2|import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
3|import { buildCorsHeaders } from '../_shared/cors.ts';
4|import { verifyAuthorizedUser } from '../_shared/auth.ts';
5|import { checkRateLimit } from '../_shared/rate-limit.ts';
6|import { CompleteSessionRequestSchema, type CompleteSessionRequest } from './schemas.ts';
7|
8|const RATE_LIMIT_OPERATION = 'session:complete';
9|const RATE_LIMIT_MAX = 10;
10|const RATE_LIMIT_WINDOW = 60;
11|
12|Deno.serve(async (request: Request) => {
13|  const corsHeaders = buildCorsHeaders(request);
14|  if (request.method === 'OPTIONS') {
15|    return new Response('ok', { headers: corsHeaders });
16|  }
17|
18|  // --- Auth ---
19|  const auth = await verifyAuthorizedUser(request, respond);
20|  if (!auth.ok) return auth.response;
21|
22|  // --- Method check ---
23|  if (request.method !== 'POST') {
24|    return respond({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'POST required' } }, 405, request);
25|  }
26|
27|  const startedAt = Date.now();
28|
29|  // --- Rate Limiting ---
30|  const supabaseUrl = Deno.env.get('SUPABASE_URL');
31|  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
32|
33|  if (supabaseUrl && serviceRoleKey) {
34|    const rateLimit = await checkRateLimit(
35|      auth.userId,
36|      RATE_LIMIT_OPERATION,
37|      supabaseUrl,
38|      serviceRoleKey,
39|      { maxRequests: RATE_LIMIT_MAX, windowSeconds: RATE_LIMIT_WINDOW },
40|    );
41|
42|    if (!rateLimit.allowed) {
43|      return respond({
44|        success: false,
45|        error: {
46|          code: 'RATE_LIMITED',
47|          message: `Max ${RATE_LIMIT_MAX} completions per ${RATE_LIMIT_WINDOW}s`,
48|          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
49|        },
50|      }, 429, request);
51|    }
52|  }
53|
54|  // --- Body parsing ---
55|  let body: unknown;
56|  try {
57|    body = await request.json();
58|  } catch {
59|    return respond({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } }, 400, request);
60|  }
61|
62|  const parsed = CompleteSessionRequestSchema.safeParse(body);
63|  if (!parsed.success) {
64|    return respond({
65|      success: false,
66|      error: { code: 'VALIDATION_ERROR', message: 'Invalid session completion payload', details: parsed.error.flatten() },
67|    }, 400, request);
68|  }
69|
70|  const req: CompleteSessionRequest = parsed.data;
71|
72|  // --- Server-Side Validation: clamp client-provided values ---
73|  const MAX_SESSION_SECONDS = 14400; // 4 hours max
74|  const clampedDuration = Math.min(req.durationSeconds, MAX_SESSION_SECONDS);
75|  const clampedEffective = Math.min(req.effectiveDurationSeconds, clampedDuration);
76|  const clampedQuality = Math.max(0, Math.min(100, req.focusQuality));
77|
78|  // Streak is now fully server-authoritative — no client-provided streakDays sent to RPC
79|
80|  // --- Execute Server-Authoritative Completion ---
81|  if (!supabaseUrl || !serviceRoleKey) {
82|    return respond({ success: false, error: { code: 'CONFIG_ERROR', message: 'Missing Supabase configuration' } }, 500, request);
83|  }
84|
85|  const supabase = createClient(supabaseUrl, serviceRoleKey);
86|
87|  const { data, error } = await supabase.rpc('complete_session', {
88|    p_user_id: auth.userId,
89|    p_session_id: req.sessionId,
90|    p_idempotency_key: req.idempotencyKey,
91|    p_duration_seconds: clampedDuration,
92|    p_effective_duration_seconds: clampedEffective,
93|    p_completion_percentage: req.completionPercentage,
94|    p_focus_quality: clampedQuality,
95|    p_interruptions: req.interruptions,
96|    p_pauses: req.pauses,
97|    p_session_mode: req.sessionMode,
98|    p_final_score: req.finalScore,
99|    p_mode_bonus: req.modeBonus,
100|  });
101|
102|  if (error) {
103|    console.error('complete_session RPC failed:', error);
104|    return respond({
105|      success: false,
106|      error: { code: 'SESSION_COMPLETION_FAILED', message: 'Session completion failed. Please try again.' },
107|      processingTimeMs: Date.now() - startedAt,
108|    }, 500, request);
109|  }
110|
111|  const result = data as Record<string, unknown>;
112|
113|  return respond({
114|    success: true,
115|    ...result,
116|    processingTimeMs: Date.now() - startedAt,
117|    rateLimit: {
118|      remaining: RATE_LIMIT_MAX,
119|      windowSeconds: RATE_LIMIT_WINDOW,
120|    },
121|  }, 200, request);
122|});
123|
124|function respond(payload: unknown, status: number, request: Request): Response {
125|  return new Response(JSON.stringify(payload), {
126|    status,
127|    headers: buildCorsHeaders(request, { includeJsonContentType: true }),
128|  });
129|}
130|