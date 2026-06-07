import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.3';
import { buildCorsHeaders } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { CompleteSessionRequestSchema, type CompleteSessionRequest } from './schemas.ts';

const RATE_LIMIT_OPERATION = 'session:complete';
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60;

Deno.serve(async (request: Request) => {
  const corsHeaders = buildCorsHeaders(request);
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Auth ---
  const auth = await verifyAuthorizedUser(request, respond);
  if (!auth.ok) return auth.response;

  // --- Method check ---
  if (request.method !== 'POST') {
    return respond({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'POST required' } }, 405, request);
  }

  const startedAt = Date.now();

  // --- Server configuration ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // --- Rate Limiting ---
  if (!supabaseUrl || !serviceRoleKey) return respond({ success: false, error: { code: 'CONFIG_ERROR', message: 'Missing Supabase configuration' } }, 500, request);

  const rateLimit = await checkRateLimit(
    auth.user.id,
    RATE_LIMIT_OPERATION,
    supabaseUrl,
    serviceRoleKey,
    { maxRequests: RATE_LIMIT_MAX, windowSeconds: RATE_LIMIT_WINDOW },
  );

  if (!rateLimit.allowed) {
    return respond({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: `Max ${RATE_LIMIT_MAX} completions per ${RATE_LIMIT_WINDOW}s`,
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      },
    }, 429, request);
  }

  // --- Body parsing ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond({ success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } }, 400, request);
  }

  const parsed = CompleteSessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return respond({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid session completion payload', details: parsed.error.flatten() },
    }, 400, request);
  }

  const req: CompleteSessionRequest = parsed.data;

  // --- Server-Side Validation: clamp client-provided values ---
  const MAX_SESSION_SECONDS = 14400; // 4 hours max
  const clampedDuration = Math.min(req.durationSeconds, MAX_SESSION_SECONDS);
  const clampedEffective = Math.min(req.effectiveDurationSeconds, clampedDuration);
  const clampedQuality = Math.max(0, Math.min(100, req.focusQuality));

  // Streak is now fully server-authoritative — no client-provided streakDays sent to RPC

  // --- Execute Server-Authoritative Completion ---
  if (!supabaseUrl || !serviceRoleKey) return respond({ success: false, error: { code: 'CONFIG_ERROR', message: 'Missing Supabase configuration' } }, 500, request);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.rpc('complete_session', {
    p_user_id: auth.user.id,
    p_session_id: req.sessionId,
    p_idempotency_key: req.idempotencyKey,
    p_duration_seconds: clampedDuration,
    p_effective_duration_seconds: clampedEffective,
    p_completion_percentage: req.completionPercentage,
    p_focus_quality: clampedQuality,
    p_interruptions: req.interruptions,
    p_pauses: req.pauses,
    p_session_mode: req.sessionMode,
    p_final_score: req.finalScore,
    p_mode_bonus: req.modeBonus,
  });

  if (error) {
    return respond({
      success: false,
      error: { code: 'SESSION_COMPLETION_FAILED', message: 'Session completion failed. Please try again.' },
      processingTimeMs: Date.now() - startedAt,
    }, 500, request);
  }

  const result = data as Record<string, unknown>;

  return respond({
    success: true,
    ...result,
    processingTimeMs: Date.now() - startedAt,
    rateLimit: {
      remaining: typeof rateLimit.remaining === 'number' ? rateLimit.remaining : 0,
      windowSeconds: RATE_LIMIT_WINDOW,
    },
  }, 200, request);
});

function respond(payload: unknown, status: number, request: Request): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: buildCorsHeaders(request, { includeJsonContentType: true }),
  });
}
