import { buildCorsHeaders } from './cors.ts';

export interface EdgeFunctionConfig {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY?: string;
}

export function requireConfig(): EdgeFunctionConfig {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: Deno.env.get('GEMINI_API_KEY') ?? undefined,
  };
}

export function respondError(message: string, status: number, request: Request): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'ERROR',
        message,
      },
    }),
    {
      status,
      headers: buildCorsHeaders(request, { includeJsonContentType: true }),
    },
  );
}
