import type { PostgrestError } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';
import { useAuthStore } from '../store';

type ResilientQueryResult<TData, TError = PostgrestError | null> = {
  data: TData | null;
  error: TError;
};

/**
 * Supabase Resilience Utility
 *
 * Provides helpers to handle common Supabase errors, especially RLS violations
 * for development users who don't have real database sessions.
 */

export interface ResilienceOptions {
  operation: string;
  fallbackValue?: unknown;
  silent?: boolean;
}

/**
 * Checks if an error is an RLS (Row Level Security) violation.
 * PostgREST code 42501 or generic 403.
 */
export function isRLSViolation(error: unknown): boolean {
  if (!error) {return false;}
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: string }).code ?? '')
    : '';
  const message = typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message?: string }).message ?? '')
    : '';
  return (
    code === '42501' ||
    message.toLowerCase().includes('row-level security') ||
    message.toLowerCase().includes('violates row level security')
  );
}

/**
 * Checks if the current user is a dev user.
 */
export function isDevUser(): boolean {
  try {
    const user = useAuthStore.getState().user;
    return user?.id === 'dev-user-1' || Boolean(user?.id?.startsWith('dev-'));
  } catch {
    return false;
  }
}

/**
 * Wraps a Supabase query with resilience logic.
 * If an RLS violation occurs for a dev user, it suppresses the error and returns a fallback.
 */
export async function withResilience<T>(
  query: PromiseLike<ResilientQueryResult<T>>,
  options: ResilienceOptions
): Promise<ResilientQueryResult<T>> {
  try {
    const result = await query;

    if (result.error) {
      if (isRLSViolation(result.error) && isDevUser()) {
        Sentry.addBreadcrumb({
          category: 'repository',
          message: 'Suppressed dev-user RLS violation',
          level: 'info',
          data: { operation: options.operation },
        });
        return { data: (options.fallbackValue as T | null | undefined) ?? result.data, error: null };
      }

      if (!options.silent) {
        Sentry.captureException(result.error, {
          tags: {
            feature: 'repository',
            operation: options.operation,
            resilience: 'failed',
          },
        });
      }
    }

    return result;
  } catch (error) {
    if (!options.silent) {
      Sentry.captureException(error, {
        tags: {
          feature: 'repository',
          operation: options.operation,
          resilience: 'exception',
        },
      });
    }
    throw error;
  }
}
