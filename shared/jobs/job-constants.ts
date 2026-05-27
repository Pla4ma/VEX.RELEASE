/**
 * Job Constants
 *
 * Shared constants for Trigger.dev job definitions.
 * Server-side only - never import in client code.
 */

export {
  RETRY_CONFIGS,
  TIMEOUT_CONFIGS,
  BATCH_CONFIGS,
  SCHEDULE_CONFIGS,
  DELAY_CONFIGS,
  RATE_LIMIT_CONFIGS,
} from './retry-timeout-constants.ts';

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
  KEY_TTL: 24 * 60 * 60 * 1000,
  CLEANUP_AFTER_DAYS: 7,
  MAX_KEYS_PER_USER: 100,
} as const;

// ============================================================================
// Error Code Constants
// ============================================================================

export const ERROR_CODES = {
  JOB_TIMEOUT: 'JOB_TIMEOUT',
  JOB_CANCELLED: 'JOB_CANCELLED',
  JOB_CONFLICT: 'JOB_CONFLICT',
  JOB_PAYLOAD_INVALID: 'JOB_PAYLOAD_INVALID',
  MAX_RETRIES_EXCEEDED: 'MAX_RETRIES_EXCEEDED',
  NON_RETRYABLE_ERROR: 'NON_RETRYABLE_ERROR',
  SEASON_NOT_FOUND: 'SEASON_NOT_FOUND',
  SEASON_ALREADY_ACTIVE: 'SEASON_ALREADY_ACTIVE',
  CHALLENGE_GENERATION_FAILED: 'CHALLENGE_GENERATION_FAILED',
  NOTIFICATION_SEND_FAILED: 'NOTIFICATION_SEND_FAILED',
  AI_WORKFLOW_FAILED: 'AI_WORKFLOW_FAILED',
  ECONOMY_RECONCILE_FAILED: 'ECONOMY_RECONCILE_FAILED',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  SUPABASE_ERROR: 'SUPABASE_ERROR',
  TRIGGER_DEV_ERROR: 'TRIGGER_DEV_ERROR',
  SENTRY_ERROR: 'SENTRY_ERROR',
} as const;

// ============================================================================
// Logging Constants
// ============================================================================

export const LOG_CONFIGS = {
  MAX_LOG_ENTRIES: 1000,
  MAX_LOG_LENGTH: 10000,
  SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key', 'apiKey', 'authorization'],
} as const;

// ============================================================================
// Concurrency Constants
// ============================================================================

export const CONCURRENCY_CONFIGS = {
  DEFAULT: 10,
  HIGH: 50,
  LOW: 1,
  SEQUENTIAL: 1,
  UNLIMITED: -1,
} as const;
