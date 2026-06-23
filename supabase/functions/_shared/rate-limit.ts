import { getRateLimitClient } from './rate-limit-client.ts';

export { getRateLimitClient, resetRateLimitClient } from './rate-limit-client.ts';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'session:complete': { maxRequests: 10, windowSeconds: 60 },
  'ai:coach': { maxRequests: 120, windowSeconds: 3600 },
  'ai:generate': { maxRequests: 20, windowSeconds: 3600 },
  'auth:login': { maxRequests: 10, windowSeconds: 300 },
  'auth:signup': { maxRequests: 5, windowSeconds: 300 },
  'default': { maxRequests: 20, windowSeconds: 60 },
};

function logStructured(
  level: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  console.log(
    JSON.stringify({
      level,
      feature: 'rate-limit',
      message,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  );
}

export async function checkRateLimit(
  userId: string,
  operation: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  config?: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { maxRequests, windowSeconds } =
    config ?? DEFAULT_CONFIGS[operation] ?? DEFAULT_CONFIGS.default!;
  const supabase = getRateLimitClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_operation: operation,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    logStructured('error', `Rate limit check failed for ${operation}`, {
      operation,
      error: error.message ?? String(error),
    });
    return { allowed: false, remaining: 0, resetAt: Date.now() + windowSeconds * 1000 };
  }

  const result = data as { allowed: boolean; remaining: number; reset_at: number };
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: result.reset_at,
  };
}
