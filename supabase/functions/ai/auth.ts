const httpRequest = globalThis.fetch.bind(globalThis);

export async function verifyAuthorizedUser(request: Request): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: Response }
> {
  const authorization = request.headers.get('authorization');
  const apiKey = request.headers.get('apikey');
  if (!authorization || !apiKey) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  const token = authorization.replace('Bearer ', '').trim();
  if (!token) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Invalid authorization token' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Server auth is not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } }) };
  }
  const authResponse = await httpRequest(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey, 'Content-Type': 'application/json' },
  });
  if (!authResponse.ok) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  const userPayload = (await authResponse.json()) as { id?: string };
  if (!userPayload.id) {
    return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }) };
  }
  return { ok: true, userId: userPayload.id };
}

export function jsonResponse(payload: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
