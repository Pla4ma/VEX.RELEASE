/**
 * Retry, Timeout & Scheduling Constants
 *
 * Extracted from job-constants.ts to stay under 200-line limit.
 * Server-side only - never import in client code.
 */

// ============================================================================
// Retry Configuration Constants
// ============================================================================

export const RETRY_CONFIGS = {
  DEFAULT: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },

  CRITICAL: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'],
  },

  LIGHT: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },

  NO_RETRY: {
    maxAttempts: 1,
    factor: 1,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 1000,
  },

  LONG_RUNNING: {
    maxAttempts: 3,
    factor: 1.5,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 120000,
  },
} as const;

// ============================================================================
// Timeout Constants (in seconds)
// ============================================================================

export const TIMEOUT_CONFIGS = {
  QUICK: 30,
  STANDARD: 60,
  MEDIUM: 300,
  LONG: 900,
  EXTENDED: 3600,
  MAXIMUM: 7200,
} as const;

// ============================================================================
// Batch Processing Constants
// ============================================================================

export const BATCH_CONFIGS = {
  CHALLENGE_ASSIGN: 100,
  NOTIFICATION_SEND: 500,
  ECONOMY_RECONCILE: 50,
  SEASON_MIGRATE: 200,
  CLEANUP: 1000,
} as const;

// ============================================================================
// Scheduling Constants
// ============================================================================

export const SCHEDULE_CONFIGS = {
  DAILY_CHALLENGE_REFRESH: '0 0 * * *',
  WEEKLY_CHALLENGE_REFRESH: '0 0 * * 0',
  DAILY_MAINTENANCE: '0 3 * * *',
  WEEKLY_ANALYTICS_SYNC: '0 4 * * 0',
  HOURLY_ECONOMY_CHECK: '0 * * * *',
  HEALTH_CHECK_EVERY_5_MIN: '*/5 * * * *',
  DAILY_RE_ENGAGEMENT_CHECK: '0 6 * * *',
} as const;

// ============================================================================
// Delay Constants (in seconds)
// ============================================================================

export const DELAY_CONFIGS = {
  IMMEDIATE: 0,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  ONE_HOUR: 3600,
  SEASON_END_GRACE_PERIOD: 3 * 24 * 60 * 60,
  SEASON_PRE_END_WARNING: 7 * 24 * 60 * 60,
  CHALLENGE_EXPIRY_DAILY: 24 * 60 * 60,
  CHALLENGE_EXPIRY_WEEKLY: 7 * 24 * 60 * 60,
} as const;

// ============================================================================
// Rate Limiting Constants
// ============================================================================

export const RATE_LIMIT_CONFIGS = {
  NOTIFICATIONS_PER_SECOND: 50,
  EXTERNAL_API_CALLS_PER_MINUTE: 100,
  DB_OPERATIONS_PER_SECOND: 100,
  AI_TOKENS_PER_MINUTE: 100000,
} as const;
