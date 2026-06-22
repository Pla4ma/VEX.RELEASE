import { jwtVerify } from 'https://esm.sh/jose@5.9.6';

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

interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  app_metadata?: {
    role?: string;
    banned?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const CACHED_JWKS = new Map<string, Uint8Array | null>();

function getJwtSecret(): Uint8Array | null {
  if (CACHED_JWKS.has('jwt_secret')) {
    return CACHED_JWKS.get('jwt_secret') ?? null;
  }

  const secret = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!secret) {
    CACHED_JWKS.set('jwt_secret', null);
    return null;
  }

  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  CACHED_JWKS.set('jwt_secret', key);
  return key;
}

export interface VerifyAuthOptions {
  requireEmailVerified?: boolean;
}

export async function verifyAuthorizedUser(
  request: Request,
  jsonResponse: (payload: unknown, status: number, request: Request) => Response,
  options: VerifyAuthOptions = {},
): Promise<AuthResult> {
  const authorization = request.headers.get('authorization');
  const apiKey = request.headers.get('apikey');

  if (!authorization || !apiKey) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  const token = authorization.replace('Bearer ', '').trim();
  if (!token) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  const jwtSecret = getJwtSecret();
  let payload: SupabaseJwtPayload;

  if (jwtSecret) {
    try {
      const { payload: verified } = await jwtVerify<SupabaseJwtPayload>(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: Deno.env.get('SUPABASE_URL') ?? undefined,
      });
      payload = verified;
    } catch {
      return verifyAuthorizedUserRemote(request, jsonResponse, options);
    }
  } else {
    return verifyAuthorizedUserRemote(request, jsonResponse, options);
  }

  if (!payload.sub) {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  const appMeta = payload.app_metadata ?? {};

  if (appMeta.banned === true) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Account suspended' }, 403, request),
    };
  }

  // NOTE: Supabase JWTs do NOT contain email_confirmed_at — only the
  // /auth/v1/user endpoint exposes it. Local JWT verification cannot determine
  // email confirmation status. Edge functions requiring verified email MUST
  // use the remote path (omit SUPABASE_JWT_SECRET env) or call /auth/v1/user
  // themselves. We reject anonymous users here as a minimal guard.
  const isAnonymous = !!payload.is_anonymous;
  let emailVerified = !isAnonymous;

  // If email verification is required and we used local JWT path,
  // fetch actual email_confirmed_at from Supabase
  if (options.requireEmailVerified && jwtSecret) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseAnonKey,
            'Content-Type': 'application/json',
          },
        });
        if (authResponse.ok) {
          const rawUser = (await authResponse.json()) as Record<string, unknown>;
          emailVerified = !!rawUser.email_confirmed_at;
        }
      } catch {
        // If fetch fails, FAIL CLOSED — do not grant email verified status
        emailVerified = false;
      }
    }
  }

  const user: AuthUser = {
    id: payload.sub,
    email: payload.email ?? null,
    emailVerified,
    role: appMeta.role ?? null,
    banned: appMeta.banned === true,
  };

  return { ok: true, user };
}

async function verifyAuthorizedUserRemote(
  request: Request,
  jsonResponse: (payload: unknown, status: number, request: Request) => Response,
  options: VerifyAuthOptions = {},
): Promise<AuthResult> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.replace('Bearer ', '').trim() ?? '';

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

  const rawUser = (await authResponse.json()) as Record<string, unknown>;
  if (!rawUser.id || typeof rawUser.id !== 'string') {
    return { ok: false, response: jsonResponse({ error: 'Unauthorized' }, 401, request) };
  }

  if (options.requireEmailVerified && !rawUser.email_confirmed_at) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Email not verified' }, 403, request),
    };
  }

  const appMeta = (rawUser.app_metadata as Record<string, unknown> | undefined) ?? {};
  if (appMeta.banned === true) {
    return {
      ok: false,
      response: jsonResponse({ error: 'Account suspended' }, 403, request),
    };
  }

  const user: AuthUser = {
    id: rawUser.id,
    email: typeof rawUser.email === 'string' ? rawUser.email : null,
    emailVerified: !!rawUser.email_confirmed_at,
    role: typeof appMeta.role === 'string' ? appMeta.role : null,
    banned: appMeta.banned === true,
  };

  return { ok: true, user };
}
