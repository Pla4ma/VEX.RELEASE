/**
 * Base Repository Layer
 * Provides retry logic, connection handling, and error classification
 */

import { getSupabaseClient } from '../../config/supabase';

// ============================================================================
// Error Types
// ============================================================================
// ============================================================================
// Error Classification
// ============================================================================

function classifyError(error: unknown): RepositoryErrorCode {
  if (!error || typeof error !== 'object') {return RepositoryErrorCode.UNKNOWN;}

  const err = error as { code?: string; message?: string; status?: number };

  // Supabase/postgres error codes
  if (err.code) {
    if (err.code === 'PGRST116') {return RepositoryErrorCode.NOT_FOUND;}
    if (err.code === '23505') {return RepositoryErrorCode.CONFLICT;}
    if (err.code === 'PGRST301') {return RepositoryErrorCode.AUTH_ERROR;}
    if (err.code.startsWith('22')) {return RepositoryErrorCode.VALIDATION_ERROR;}
    if (err.code.startsWith('28')) {return RepositoryErrorCode.AUTH_ERROR;}
    if (err.code.startsWith('42')) {return RepositoryErrorCode.VALIDATION_ERROR;}
  }

  // HTTP status codes
  if (err.status) {
    if (err.status === 401 || err.status === 403) {return RepositoryErrorCode.AUTH_ERROR;}
    if (err.status === 404) {return RepositoryErrorCode.NOT_FOUND;}
    if (err.status === 409) {return RepositoryErrorCode.CONFLICT;}
    if (err.status === 422) {return RepositoryErrorCode.VALIDATION_ERROR;}
    if (err.status === 429) {return RepositoryErrorCode.RATE_LIMIT;}
    if (err.status >= 500) {return RepositoryErrorCode.SERVER_ERROR;}
  }

  // Network detection
  if (err.message?.includes('fetch') ||
      err.message?.includes('network') ||
      err.message?.includes('ECONNREFUSED') ||
      err.message?.includes('ETIMEDOUT')) {
    return RepositoryErrorCode.NETWORK_ERROR;
  }

  return RepositoryErrorCode.UNKNOWN;
}

// ============================================================================
// Retry Configuration
// ============================================================================
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, config.maxDelayMs);
}

// ============================================================================
// Retry Wrapper
// ============================================================================
// ============================================================================
// Connection State
// ============================================================================
let currentConnectionState: ConnectionState = 'unknown';
const connectionListeners: Set<(state: ConnectionState) => void> = new Set();
// ============================================================================
// Optimistic Locking Helper
// ============================================================================
// ============================================================================
// Batch Operations
// ============================================================================
// ============================================================================
// Supabase Query Builder with Retry
// ============================================================================
export * from "./base.types";
export * from "./base.part1";
