import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'session:complete': { maxRequests: 10, windowSeconds: 60 },
  'ai:coach': { maxRequests: 5, windowSeconds: 3600 },
  'auth:login': { maxRequests: 10, windowSeconds: 300 },
  'auth:signup': { maxRequests: 5, windowSeconds: 300 },
  'default': { maxRequests: 20, windowSeconds: 60 },
};

export async function checkRateLimit(
  userId: string,
  operation: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  config?: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { maxRequests, windowSeconds } =
    config ?? DEFAULT_CONFIGS[operation] ?? DEFAULT_CONFIGS.default!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_operation: operation,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error(`Rate limit check failed for ${operation}:`, error);
    return { allowed: true, remaining: maxRequests, resetAt: Date.now() + windowSeconds * 1000 };
  }

  const result = data as { allowed: boolean; remaining: number; reset_at: number };
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: result.reset_at,
  };
}
