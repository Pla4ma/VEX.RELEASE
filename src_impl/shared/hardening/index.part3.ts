import { captureSilentFailure } from "../../utils/silent-failure";
import * as Sentry from "@sentry/react-native";


export function classifyError(error: Error): {
  type: 'transient' | 'persistent' | 'auth' | 'validation' | 'unknown';
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('timeout') || message.includes('temporarily')) {
    return { type: 'transient', retryable: true, severity: 'medium' };
  }

  if (message.includes('rate limit') || message.includes('too many requests')) {
    return { type: 'transient', retryable: true, severity: 'low' };
  }

  if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('auth')) {
    return { type: 'auth', retryable: false, severity: 'high' };
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return { type: 'validation', retryable: false, severity: 'medium' };
  }

  if (message.includes('not found') || message.includes('does not exist')) {
    return { type: 'persistent', retryable: false, severity: 'low' };
  }

  return { type: 'unknown', retryable: false, severity: 'high' };
}

export function safeJsonParse<T>(
  json: string,
  fallback: T,
  context?: string
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'parse_error',
      message: `Failed to parse JSON${context ? ` (${context})` : ''}`,
      level: 'warning',
    });
    return fallback;
  }
}

export function safeJsonStringify(
  obj: unknown,
  fallback = '{}',
  context?: string
): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'stringify_error',
      message: `Failed to stringify${context ? ` (${context})` : ''}`,
      level: 'warning',
    });
    return fallback;
  }
}

export async function runHealthChecks(
  checks: HealthCheck[]
): Promise<{
  healthy: boolean;
  results: Array<{ name: string; healthy: boolean; critical: boolean }>;
}> {
  const results = await Promise.all(
    checks.map(async (check) => {
      try {
        const healthy = await check.check();
        return { name: check.name, healthy, critical: check.critical };
      } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'ui-fallback', type: 'ui' });
        return { name: check.name, healthy: false, critical: check.critical };
      }
    })
  );

  const healthy = results.every((r) => !r.critical || r.healthy);

  return { healthy, results };
}