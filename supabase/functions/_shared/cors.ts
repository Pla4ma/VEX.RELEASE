const PRODUCTION_ORIGINS_PATTERNS: ReadonlyArray<RegExp> = [
  /^https:\/\/vex\.app$/,
  /^https:\/\/[a-z0-9-]+\.vex\.app$/,
] as const;

const DEVELOPMENT_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19006',
] as const;

function matchesOriginPattern(origin: string): boolean {
  return PRODUCTION_ORIGINS_PATTERNS.some((pattern) => pattern.test(origin));
}

type CorsOptions = {
  methods?: string;
  headers?: string;
  includeJsonContentType?: boolean;
};

export function resolveCorsOrigin(request: Request): string {
  const origin = request.headers.get('origin');
  if (!origin) {
    return 'https://vex.app';
  }

  if (matchesOriginPattern(origin)) {
    return origin;
  }

  const isDev = (Deno.env.get('ENVIRONMENT') ?? 'development') !== 'production';
  if (isDev) {
    for (const devOrigin of DEVELOPMENT_ORIGINS) {
      if (origin === devOrigin) return origin;
    }
  }

  return 'https://vex.app';
}

export function buildCorsHeaders(
  request: Request,
  options: CorsOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': resolveCorsOrigin(request),
    'Access-Control-Allow-Methods': options.methods ?? 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      options.headers ?? 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };

  if (options.includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

export function withCorsHeaders(
  response: Response,
  corsHeaders: Record<string, string>,
): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function jsonWithCors(
  request: Request,
  payload: unknown,
  status: number,
  options: CorsOptions = {},
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: buildCorsHeaders(request, { ...options, includeJsonContentType: true }),
  });
}

export type { CorsOptions };
