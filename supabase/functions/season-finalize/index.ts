import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'npm:zod';

import { configure } from 'npm:@trigger.dev/sdk@latest';
import { finalizeSeasonTask } from '../../../jobs/seasons/finalize-season.ts';

configure({
  apiKey: Deno.env.get('TRIGGER_SECRET_KEY')!,
  project: Deno.env.get('TRIGGER_PROJECT_REF')!,
  apiUrl: Deno.env.get('TRIGGER_API_URL') || 'https://api.trigger.dev',
  logLevel: 'info',
});

const BodySchema = z.object({
  seasonId: z.string().uuid(),
});

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = BodySchema.parse(await req.json());
    const handle = await finalizeSeasonTask.trigger(body, {
      idempotencyKey: `season-finalize:${body.seasonId}`,
    });

    return new Response(JSON.stringify({ success: true, runId: handle.id }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
