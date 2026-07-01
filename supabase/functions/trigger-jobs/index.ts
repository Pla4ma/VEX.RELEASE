/**
 * Trigger.dev Edge Function Entry Point
 *
 * Supabase Edge Function serves as webhook handler for Trigger.dev jobs.
 * Deploy with: supabase functions deploy trigger-jobs
 */
import { configure, handleRequest } from 'npm:@trigger.dev/sdk@latest';
import { buildCorsHeaders, jsonWithCors } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';

type TriggerLogLevel = 'debug' | 'info' | 'warn' | 'error';

function resolveTriggerLogLevel(value: string | null): TriggerLogLevel {
  return value === 'debug' || value === 'info' || value === 'warn' || value === 'error' ? value : 'info';
}

configure({
  apiKey: Deno.env.get('TRIGGER_SECRET_KEY') ?? '',
  project: Deno.env.get('TRIGGER_PROJECT_REF') ?? '',
  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
  logLevel: resolveTriggerLogLevel(Deno.env.get('TRIGGER_LOG_LEVEL')),
});

// Imports register jobs with Trigger.dev.
import '../../../jobs/challenges/daily-refresh.ts';
import '../../../jobs/notifications/batch-send.ts';
import '../../../jobs/maintenance/health-check.ts';
import '../../../jobs/seasons/finalize-season.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const auth = await verifyAuthorizedUser(req, jsonWithCors);
  if (!auth.ok) return auth.response;

  try {
    return await handleRequest(req);
  } catch {
    return jsonWithCors(req, { error: 'Internal server error' }, 500);
  }
});
