import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Enhanced Streaks Repository
 * Features: Retry logic, offline queue integration
 */

import { withRetry, RepositoryError, RepositoryErrorCode } from '../../../lib/repository/base';
import { enqueue, type OfflineQueueEntryInput } from '../../../lib/offline/queue';
import { getSupabaseClient } from '../../../config/supabase';
import { StreakSchema, type Streak } from '../schemas';
import { v4 } from '../../../utils/uuid';

const supabase = getSupabaseClient();

// ============================================================================
// Enhanced Error Handling
// ============================================================================
// ============================================================================
// Connection-Aware Operations
// ============================================================================

interface RepositoryResult<T> {
  data: T | null;
  error: StreaksRepositoryError | null;
  fromCache: boolean;
}

async function executeWithFallback<T>(operation: string, onlineFn: () => Promise<T>, offlineFn?: () => Promise<T | null>): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError = error instanceof RepositoryError
      ? new StreaksRepositoryError(operation, error.originalError, error.code)
      : new StreaksRepositoryError(operation, error instanceof Error ? error : new Error(String(error)));

    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (error) {
        captureSilentFailure(error, { feature: 'streaks', operation: 'network-fallback', type: 'network' });
        // Cache miss
      }
    }

    return { data: null, error: repoError, fromCache: false };
  }
}

// ============================================================================
// Enhanced Streak CRUD
// ============================================================================
// ============================================================================
// Shield Operations
// ============================================================================
// ============================================================================
// Batch Operations
// ============================================================================
// ============================================================================
// Streak Repair Quest Operations
// ============================================================================

import { StreakRepairQuestSchema, type StreakRepairQuest } from '../schemas-enhanced';
// ============================================================================
// Risk Monitor Operations
// ============================================================================

import { StreakRiskStatusSchema, type StreakRiskStatus } from '../schemas-enhanced';
export * from "./enhanced.types";
export * from "./enhanced.part1";
export * from "./enhanced.part2";
