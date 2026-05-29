const ALLOWED_ORIGINS = [
  'https://vex.app',
  'https://www.vex.app',
  'http://localhost:8081',
  'http://localhost:19006',
] as const;

type CorsOptions = {
  methods?: string;
  headers?: string;
  includeJsonContentType?: boolean;
};

export function resolveCorsOrigin(request: Request): string {
  const origin = request.headers.get('origin');
  if (!origin) {
    return ALLOWED_ORIGINS[0];
  }

  const allowed = ALLOWED_ORIGINS as readonly string[];
  if (allowed.includes(origin)) {
    return origin;
  }

  // Reject unknown origins — do not mirror them
  return ALLOWED_ORIGINS[0];
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
