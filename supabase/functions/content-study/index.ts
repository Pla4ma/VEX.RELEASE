import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { buildCorsHeaders, withCorsHeaders } from '../_shared/cors.ts';
import {
  handleSubmit,
  handleExtract,
  handleGenerate,
  handleStatus,
  handleFeedback,
} from './handlers.ts';

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ success: false, error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const url = new URL(req.url);
    const routePath = url.pathname.replace('/functions/v1/content-study', '').replace(/^\//, '');
    if (req.method === 'POST' && routePath === 'submit') return withCorsHeaders(await handleSubmit(req, supabase, user.id), corsHeaders);
    if (req.method === 'POST' && routePath === 'extract') return withCorsHeaders(await handleExtract(req, supabase, user.id), corsHeaders);
    if (req.method === 'POST' && routePath === 'generate') return withCorsHeaders(await handleGenerate(req, supabase, user.id), corsHeaders);
    if (req.method === 'GET' && routePath.startsWith('status/')) return withCorsHeaders(await handleStatus(req, supabase, user.id), corsHeaders);
    if (req.method === 'POST' && routePath === 'feedback') return withCorsHeaders(await handleFeedback(req, supabase, user.id), corsHeaders);
    return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
