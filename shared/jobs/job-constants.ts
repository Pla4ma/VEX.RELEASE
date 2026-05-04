/**
 * Job Constants
 * 
 * Shared constants for Trigger.dev job definitions.
 * Server-side only - never import in client code.
 */

// ============================================================================
// Retry Configuration Constants
// ============================================================================

export const RETRY_CONFIGS = {
  // Default retry for most jobs
  DEFAULT: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },
  
  // Aggressive retry for critical jobs
  CRITICAL: {
    maxAttempts: 5,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'],
  },
  
  // Light retry for idempotent, non-critical jobs
  LIGHT: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  
  // No retry for one-shot jobs
  NO_RETRY: {
    maxAttempts: 1,
    factor: 1,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 1000,
  },
  
  // Long-running job retry (AI, etc)
  LONG_RUNNING: {
    maxAttempts: 3,
    factor: 1.5,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 120000, // 2 minutes
  },
} as const;

// ============================================================================
// Timeout Constants (in seconds)
// ============================================================================

export const TIMEOUT_CONFIGS = {
  QUICK: 30,           // 30 seconds
  STANDARD: 60,        // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 900,          // 15 minutes
  EXTENDED: 3600,     // 1 hour
  MAXIMUM: 7200,      // 2 hours
} as const;

// ============================================================================
// Batch Processing Constants
// ============================================================================

export const BATCH_CONFIGS = {
  // Challenge assignment batch size
  CHALLENGE_ASSIGN: 100,
  
  // Notification batch size
  NOTIFICATION_SEND: 500,
  
  // Economy reconciliation batch size
  ECONOMY_RECONCILE: 50,
  
  // Season migration batch size
  SEASON_MIGRATE: 200,
  
  // Cleanup batch size
  CLEANUP: 1000,
} as const;

// ============================================================================
// Scheduling Constants
// ============================================================================

export const SCHEDULE_CONFIGS = {
  // Challenge refresh schedules
  DAILY_CHALLENGE_REFRESH: '0 0 * * *',      // Midnight UTC
  WEEKLY_CHALLENGE_REFRESH: '0 0 * * 0',     // Sunday midnight UTC
  
  // Maintenance schedules
  DAILY_MAINTENANCE: '0 3 * * *',           // 3 AM UTC
  WEEKLY_ANALYTICS_SYNC: '0 4 * * 0',      // Sunday 4 AM UTC
  
  // Economy reconciliation
  HOURLY_ECONOMY_CHECK: '0 * * * *',        // Every hour
  
  // Health checks
  HEALTH_CHECK_EVERY_5_MIN: '*/5 * * * *',

  // Retention schedules
  DAILY_RE_ENGAGEMENT_CHECK: '0 6 * * *',
} as const;

// ============================================================================
// Delay Constants (in seconds)
// ============================================================================

export const DELAY_CONFIGS = {
  // Notification delays
  IMMEDIATE: 0,
  FIVE_MINUTES: 300,
  FIFTEEN_MINUTES: 900,
  ONE_HOUR: 3600,
  
  // Season rollover delays
  SEASON_END_GRACE_PERIOD: 3 * 24 * 60 * 60,  // 3 days in seconds
  SEASON_PRE_END_WARNING: 7 * 24 * 60 * 60,    // 7 days in seconds
  
  // Challenge delays
  CHALLENGE_EXPIRY_DAILY: 24 * 60 * 60,      // 24 hours
  CHALLENGE_EXPIRY_WEEKLY: 7 * 24 * 60 * 60, // 7 days
} as const;

// ============================================================================
// Rate Limiting Constants
// ============================================================================

export const RATE_LIMIT_CONFIGS = {
  // Notifications per second
  NOTIFICATIONS_PER_SECOND: 50,
  
  // External API calls
  EXTERNAL_API_CALLS_PER_MINUTE: 100,
  
  // Database operations
  DB_OPERATIONS_PER_SECOND: 100,
  
  // AI token usage
  AI_TOKENS_PER_MINUTE: 100000,
} as const;

// ============================================================================
// Job ID Constants
// ============================================================================

export const JOB_IDS = {
  // Seasons
  SEASON_ROLLOVER: 'season-rollover',
  SEASON_ARCHIVE: 'season-archive',
  SEASON_PRE_END_WARNING: 'season-pre-end-warning',
  
  // Challenges
  CHALLENGE_DAILY_REFRESH: 'challenge-daily-refresh',
  CHALLENGE_WEEKLY_REFRESH: 'challenge-weekly-refresh',
  CHALLENGE_EXPIRY_CLEANUP: 'challenge-expiry-cleanup',
  
  // Battle Pass
  BATTLE_PASS_SEASON_RESET: 'battle-pass-season-reset',
  BATTLE_PASS_GRACE_PERIOD_END: 'battle-pass-grace-period-end',
  
  // Notifications
  NOTIFICATION_BATCH_SEND: 'notification-batch-send',
  NOTIFICATION_SCHEDULED_REMINDER: 'notification-scheduled-reminder',
  RE_ENGAGEMENT_CHECK: 're-engagement-check',
  
  // AI
  AI_SESSION_SUMMARY: 'ai-session-summary',
  AI_PROGRESS_ANALYSIS: 'ai-progress-analysis',
  AI_CHALLENGE_GENERATION: 'ai-challenge-generation',
  
  // Maintenance
  MAINTENANCE_DAILY_CLEANUP: 'maintenance-daily-cleanup',
  MAINTENANCE_ANALYTICS_SYNC: 'maintenance-analytics-sync',
  MAINTENANCE_HEALTH_CHECK: 'maintenance-health-check',
  MAINTENANCE_DB_OPTIMIZE: 'maintenance-db-optimize',
  
  // Economy
  ECONOMY_RECONCILE: 'economy-reconcile',
  ECONOMY_DAILY_REPORT: 'economy-daily-report',
  
  // Analytics
  ANALYTICS_EXPORT: 'analytics-export',
  ANALYTICS_AGGREGATE: 'analytics-aggregate',
} as const;

// ============================================================================
// Idempotency Constants
// ============================================================================

export const IDEMPOTENCY_CONFIGS = {
  // TTL for idempotency keys (in milliseconds)
  KEY_TTL: 24 * 60 * 60 * 1000,  // 24 hours
  
  // Cleanup threshold
  CLEANUP_AFTER_DAYS: 7,
  
  // Max keys per user
  MAX_KEYS_PER_USER: 100,
} as const;

// ============================================================================
// Error Code Constants
// ============================================================================

export const ERROR_CODES = {
  // Job execution errors
  JOB_TIMEOUT: 'JOB_TIMEOUT',
  JOB_CANCELLED: 'JOB_CANCELLED',
  JOB_CONFLICT: 'JOB_CONFLICT',
  JOB_PAYLOAD_INVALID: 'JOB_PAYLOAD_INVALID',
  
  // Retry-related errors
  MAX_RETRIES_EXCEEDED: 'MAX_RETRIES_EXCEEDED',
  NON_RETRYABLE_ERROR: 'NON_RETRYABLE_ERROR',
  
  // Domain errors
  SEASON_NOT_FOUND: 'SEASON_NOT_FOUND',
  SEASON_ALREADY_ACTIVE: 'SEASON_ALREADY_ACTIVE',
  CHALLENGE_GENERATION_FAILED: 'CHALLENGE_GENERATION_FAILED',
  NOTIFICATION_SEND_FAILED: 'NOTIFICATION_SEND_FAILED',
  AI_WORKFLOW_FAILED: 'AI_WORKFLOW_FAILED',
  ECONOMY_RECONCILE_FAILED: 'ECONOMY_RECONCILE_FAILED',
  
  // Infrastructure errors
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  SUPABASE_ERROR: 'SUPABASE_ERROR',
  TRIGGER_DEV_ERROR: 'TRIGGER_DEV_ERROR',
  SENTRY_ERROR: 'SENTRY_ERROR',
} as const;

// ============================================================================
// Logging Constants
// ============================================================================

export const LOG_CONFIGS = {
  // Max log entries per job
  MAX_LOG_ENTRIES: 1000,
  
  // Log truncation length
  MAX_LOG_LENGTH: 10000,
  
  // Sensitive fields to redact
  SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key', 'apiKey', 'authorization'],
} as const;

// ============================================================================
// Concurrency Constants
// ============================================================================

export const CONCURRENCY_CONFIGS = {
  // Default per job
  DEFAULT: 10,
  
  // High-throughput jobs
  HIGH: 50,
  
  // Low-resource jobs
  LOW: 1,
  
  // Sequential processing
  SEQUENTIAL: 1,
  
  // Unrestricted (use with caution)
  UNLIMITED: -1,
} as const;
