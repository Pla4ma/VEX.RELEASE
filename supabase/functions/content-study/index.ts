import { buildCorsHeaders, withCorsHeaders } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import {
  handleSubmit,
  handleExtract,
  handleGenerate,
  handleStatus,
  handleFeedback,
} from './handlers.ts';
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

let cachedServiceClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  if (!cachedServiceClient) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase service configuration');
    }
    cachedServiceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cachedServiceClient;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = await verifyAuthorizedUser(req, (payload, status, request) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: buildCorsHeaders(request, { includeJsonContentType: true }),
    }),
  );
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const routePath = url.pathname.replace('/functions/v1/content-study', '').replace(/^\//, '');
  const supabase = getServiceClient();
  if (req.method === 'POST' && routePath === 'submit') return withCorsHeaders(await handleSubmit(req, supabase, auth.user.id), corsHeaders);
  if (req.method === 'POST' && routePath === 'extract') return withCorsHeaders(await handleExtract(req, supabase, auth.user.id), corsHeaders);
  if (req.method === 'POST' && routePath === 'generate') return withCorsHeaders(await handleGenerate(req, supabase, auth.user.id), corsHeaders);
  if (req.method === 'GET' && routePath.startsWith('status/')) return withCorsHeaders(await handleStatus(req, supabase, auth.user.id), corsHeaders);
  if (req.method === 'POST' && routePath === 'feedback') return withCorsHeaders(await handleFeedback(req, supabase, auth.user.id), corsHeaders);
  return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
