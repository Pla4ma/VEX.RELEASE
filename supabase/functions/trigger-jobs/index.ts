/**
 * Trigger.dev Edge Function Entry Point
 *
 * Supabase Edge Function that serves as the webhook handler for Trigger.dev jobs.
 * Deploy with: supabase functions deploy trigger-jobs
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { configure, handleRequest } from 'npm:@trigger.dev/sdk@latest';
import {
  buildCorsHeaders,
  withCorsHeaders,
  jsonWithCors,
} from '../_shared/cors.ts';

type TriggerLogLevel = 'debug' | 'info' | 'warn' | 'error';

function resolveTriggerLogLevel(value: string | null): TriggerLogLevel {
  return value === 'debug' ||
    value === 'info' ||
    value === 'warn' ||
    value === 'error'
    ? value
    : 'info';
}

// Configure Trigger.dev SDK
configure({
  apiKey: Deno.env.get('TRIGGER_SECRET_KEY')!,
  project: Deno.env.get('TRIGGER_PROJECT_REF')!,
  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
  logLevel: resolveTriggerLogLevel(Deno.env.get('TRIGGER_LOG_LEVEL')),
});

// Import all job definitions
// These imports register the jobs with Trigger.dev
import '../../../jobs/challenges/daily-refresh.ts';
import '../../../jobs/notifications/batch-send.ts';
import '../../../jobs/maintenance/health-check.ts';
import '../../../jobs/seasons/finalize-season.ts';

/**
 * Handle incoming requests
 */
serve(async (req) => {
  // CORS headers for webhook access
  const corsHeaders = buildCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Let Trigger.dev handle the request
    const response = await handleRequest(req);

    // Add CORS headers to response
    return withCorsHeaders(response, corsHeaders);
  } catch (error) {
    return jsonWithCors(
      req,
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
