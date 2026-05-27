/**
 * Trigger Config Types
 * 
 * Type definitions and constants for Trigger.dev configuration.
 * Extracted from trigger-config.ts for file size compliance.
 */

// ============================================================================
// Job Logging Configuration
// ============================================================================

export interface LogConfig {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  maxEntries: number;
  redactFields: string[];
}

// ============================================================================
// Supabase Integration
// ============================================================================

export interface SupabaseConfig {
  url: string;
  serviceKey: string;
  anonKey: string;
}

// ============================================================================
// Job Queue Configuration
// ============================================================================

export interface QueueConfig {
  concurrency: number;
  rateLimitPerSecond?: number;
}

export const QUEUE_CONFIGS: Record<string, QueueConfig> = {
  DEFAULT: {
    concurrency: 10,
  },
  HIGH_THROUGHPUT: {
    concurrency: 50,
    rateLimitPerSecond: 100,
  },
  NOTIFICATIONS: {
    concurrency: 20,
    rateLimitPerSecond: 50,
  },
  AI_WORKFLOWS: {
    concurrency: 5,
    rateLimitPerSecond: 10,
  },
  SEQUENTIAL: {
    concurrency: 1,
  },
} as const;
