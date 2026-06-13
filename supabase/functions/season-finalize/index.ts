import { z } from 'npm:zod';

import { configure } from 'npm:@trigger.dev/sdk@latest';
import { finalizeSeasonTask } from '../../../jobs/seasons/finalize-season.ts';
import { buildCorsHeaders, jsonWithCors } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';

configure({
  apiKey: Deno.env.get('TRIGGER_SECRET_KEY') ?? '',
  project: Deno.env.get('TRIGGER_PROJECT_REF') ?? '',
  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
  logLevel: 'info',
});

const BodySchema = z.object({
  seasonId: z.string().uuid(),
});

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authResult = await verifyAuthorizedUser(req, jsonWithCors);
  if (!authResult.ok) return authResult.response;
  const userId = authResult.user.id;

  const rateLimitResult = await checkRateLimit(
    userId, 'season:finalize',
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  if (!rateLimitResult.allowed) {
    return jsonWithCors(req, { success: false, error: 'Rate limit exceeded', remaining: rateLimitResult.remaining }, 429);
  }

  try {
    const body = BodySchema.parse(await req.json());
    const handle = await finalizeSeasonTask.trigger(body, {
      idempotencyKey: `season-finalize:${body.seasonId}`,
    });

    return jsonWithCors(req, { success: true, runId: handle.id }, 200);
  } catch (error: unknown) {
    console.error('season-finalize failed:', error);
    return jsonWithCors(
      req,
      {
        success: false,
        message: 'Season finalization failed. Please try again.',
      },
      500,
    );
  }
});
