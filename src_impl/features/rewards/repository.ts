/**
 * Rewards Repository
 * Supabase queries for reward data
 */

import { getSupabaseClient } from '../../config/supabase';
import {
  RewardSchema,
  type Reward,
  type RewardStatus,
} from './schemas';
import { v4 } from '../../utils/uuid';

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

// ============================================================================
// Reward CRUD
// ============================================================================
// ============================================================================
// Duplicate Prevention
// ============================================================================
// ============================================================================
// Expired Rewards
// ============================================================================
// ============================================================================
// Ledger
// ============================================================================
export * from "./repository.part1";
