export interface AuthUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  role: string | null;
  banned: boolean;
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; response: Response };

interface SupabaseUser {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  app_metadata?: {
    role?: string;
    banned?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

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

  const rawUser = (await authResponse.json()) as SupabaseUser;
  if (!rawUser.id) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  if (!rawUser.email_confirmed_at) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Email not verified' }, 403, request),
    };
  }

  const appMeta = rawUser.app_metadata ?? {};
  if (appMeta.banned === true) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Account suspended' }, 403, request),
    };
  }

  const user: AuthUser = {
    id: rawUser.id,
    email: rawUser.email ?? null,
    emailVerified: !!rawUser.email_confirmed_at,
    role: appMeta.role ?? null,
    banned: appMeta.banned === true,
  };

  return { ok: true, user };
}
