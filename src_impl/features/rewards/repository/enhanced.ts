import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Enhanced Rewards Repository
 * Features: Retry logic, offline queue integration
 */

import { withRetry, RepositoryError, RepositoryErrorCode } from '../../../lib/repository/base';
import { enqueue } from '../../../lib/offline/queue';
import { getSupabaseClient } from '../../../config/supabase';
import { RewardSchema, RewardLedgerSchema, type Reward, type RewardLedger } from '../schemas';
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
  error: RewardsRepositoryError | null;
  fromCache: boolean;
}

async function executeWithFallback<T>(operation: string, onlineFn: () => Promise<T>, offlineFn?: () => Promise<T | null>): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError = error instanceof RepositoryError ? new RewardsRepositoryError(operation, error.originalError, error.code) : new RewardsRepositoryError(operation, error);

    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (error) {
        captureSilentFailure(error, { feature: 'rewards', operation: 'network-fallback', type: 'network' });
        // Cache miss
      }
    }

    return { data: null, error: repoError, fromCache: false };
  }
}

// ============================================================================
// Enhanced Reward CRUD
// ============================================================================
// ============================================================================
// Claim Operations
// ============================================================================
// ============================================================================
// Duplicate Prevention
// ============================================================================
// ============================================================================
// Ledger Operations
// ============================================================================
// ============================================================================
// Expired Rewards
// ============================================================================
// ============================================================================
// Batch Operations
// ============================================================================
export * from "./enhanced.types";
export * from "./enhanced.part1";
export * from "./enhanced.part2";
