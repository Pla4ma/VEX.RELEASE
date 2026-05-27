/**
 * Trigger.dev Configuration
 * 
 * Server-side configuration for Trigger.dev v4.
 * This file is NEVER imported into client-side code.
 */

import type { TriggerDevConfig, RetryConfig } from './job-types';
import { RETRY_CONFIGS, ERROR_CODES } from './job-constants';
import type { LogConfig, SupabaseConfig, QueueConfig } from './trigger-config-types';
import { QUEUE_CONFIGS } from './trigger-config-types';

export type { LogConfig, SupabaseConfig, QueueConfig };
export { QUEUE_CONFIGS };

// ============================================================================
// Environment Validation
// ============================================================================

function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || '';
}

// ============================================================================
// Configuration Factory
// ============================================================================

export function createTriggerConfig(): TriggerDevConfig {
  return {
    projectId: getEnvVar('TRIGGER_PROJECT_ID'),
    apiKey: getEnvVar('TRIGGER_API_KEY'),
    apiUrl: getEnvVar('TRIGGER_API_URL', false) || 'https://api.trigger.dev',
    environment: (getEnvVar('NODE_ENV', false) as TriggerDevConfig['environment']) || 'development',
    defaultRetryConfig: RETRY_CONFIGS.DEFAULT,
    sentryDsn: getEnvVar('SENTRY_DSN', false),
    postHogKey: getEnvVar('POSTHOG_KEY', false),
  };
}

// ============================================================================
// Retry Configuration Helpers
// ============================================================================

export function getRetryConfig(configName: keyof typeof RETRY_CONFIGS): RetryConfig {
  return RETRY_CONFIGS[configName];
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const code = (error as { code?: string }).code;
    
    const networkErrors = ['network', 'timeout', 'econnreset', 'econnrefused', 'ENOTFOUND', 'ETIMEDOUT'];
    const retryableStatusCodes = ['429', '500', '502', '503', '504'];
    const dbErrors = ['23505', '40P01', '40001', '40P02'];
    
    const isNetworkError = networkErrors.some(e => message.includes(e));
    const isStatusCode = typeof code === 'string' && retryableStatusCodes.some(c => code.includes(c));
    const isDBError = typeof code === 'string' && dbErrors.includes(code);
    
    return isNetworkError || isStatusCode || isDBError;
  }
  
  return false;
}

export function getNonRetryableErrors(): string[] {
  return [
    ERROR_CODES.JOB_PAYLOAD_INVALID,
    ERROR_CODES.SEASON_NOT_FOUND,
    ERROR_CODES.SEASON_ALREADY_ACTIVE,
    ERROR_CODES.NON_RETRYABLE_ERROR,
    'VALIDATION_ERROR',
    'NOT_FOUND',
    'UNAUTHORIZED',
    'FORBIDDEN',
  ];
}

// ============================================================================
// Job Logging Configuration
// ============================================================================

export function getLogConfig(): LogConfig {
  const level = (getEnvVar('JOB_LOG_LEVEL', false) as LogConfig['level']) || 'INFO';
  
  return {
    level,
    maxEntries: 1000,
    redactFields: [
      'password', 'token', 'secret', 'key', 'apiKey',
      'authorization', 'auth', 'credential', 'private',
    ],
  };
}

// ============================================================================
// Sentry Integration
// ============================================================================

export function shouldReportToSentry(error: unknown): boolean {
  const nonReportableErrors = [
    ERROR_CODES.JOB_TIMEOUT,
    'ValidationError',
    'PayloadError',
  ];
  
  if (error instanceof Error) {
    return !nonReportableErrors.some(e => 
      error.message.includes(e) || 
      (error as { code?: string }).code?.includes(e)
    );
  }
  
  return true;
}

// ============================================================================
// Supabase Integration
// ============================================================================

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: getEnvVar('SUPABASE_URL'),
    serviceKey: getEnvVar('SUPABASE_SERVICE_KEY'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY'),
  };
}

// ============================================================================
// Environment Guards
// ============================================================================

/**
 * Throws if called from client-side environment
 */
export function guardServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'CRITICAL: Trigger.dev configuration accessed from client-side code. ' +
      'This file must only be imported in server-side code. ' +
      'Check your imports and ensure this is not bundled with client code.'
    );
  }
  
  if (process.env.EXPO_PUBLIC_ANYTHING) {
    throw new Error(
      'CRITICAL: Trigger.dev configuration loaded in Expo environment. ' +
      'This indicates a bundling or import error. ' +
      'Never import shared/jobs/* in React Native code.'
    );
  }
}

// Run guard on module load
guardServerOnly();
