import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * Enhanced Boss Repository
 * Features: Retry logic, offline queue integration
 */

import { withRetry, RepositoryError, RepositoryErrorCode } from '../../../lib/repository/base';
import { enqueue } from '../../../lib/offline/queue';
import { getSupabaseClient } from '../../../config/supabase';
import { BossEncounterSchema, BossTemplateSchema, type BossEncounter, type BossTemplate } from '../schemas';

const supabase = getSupabaseClient();

// ============================================================================
// Enhanced Error Handling
// ============================================================================
// ============================================================================
// Connection-Aware Operations
// ============================================================================

interface RepositoryResult<T> {
  data: T | null;
  error: BossRepositoryError | null;
  fromCache: boolean;
}

async function executeWithFallback<T>(operation: string, onlineFn: () => Promise<T>, offlineFn?: () => Promise<T | null>): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError = error instanceof RepositoryError ? new BossRepositoryError(operation, error.originalError, error.code) : new BossRepositoryError(operation, error);

    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (error) {
        captureSilentFailure(error, { feature: 'boss', operation: 'network-fallback', type: 'network' });
        // Cache miss
      }
    }

    return { data: null, error: repoError, fromCache: false };
  }
}

// ============================================================================
// Enhanced Encounter Operations
// ============================================================================
// ============================================================================
// Defeat Operations
// ============================================================================
// ============================================================================
// Template Operations
// ============================================================================
// ============================================================================
// Cooldown Operations
// ============================================================================
export * from "./enhanced.types";
export * from "./enhanced.types";
export * from "./enhanced.part1";
