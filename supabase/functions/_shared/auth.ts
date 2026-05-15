export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: Response };

export async function verifyAuthorizedUser(
  request: Request,
  jsonResponse: (payload: unknown, status: number, request: Request) => Response,
): Promise<AuthResult> {
  const authorization = request.headers.get('authorization');
  const apiKey = request.headers.get('apikey');
  if (!authorization || !apiKey) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  const token = authorization.replace('Bearer ', '').trim();
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!token || !supabaseUrl || !supabaseAnonKey) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
  });
  if (!authResponse.ok) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  const user = (await authResponse.json()) as { id?: string };
  return user.id
    ? { ok: true, userId: user.id }
    : { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
}
