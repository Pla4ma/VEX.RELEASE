/**
 * Boss Repository
 * Supabase queries for boss data
 */

import { getSupabaseClient } from '../../config/supabase';
import { BossTemplateSchema, BossEncounterSchema, type BossTemplate, type BossEncounter } from './schemas';
import { v4 } from '../../utils/uuid';

// ============================================================================
// Error Handling
// ============================================================================

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

// ============================================================================
// Boss Templates
// ============================================================================
// ============================================================================
// Boss Encounters
// ============================================================================
// ============================================================================
// Boss Defeat History
// ============================================================================
// ============================================================================
// Boss Cooldowns
// ============================================================================
export * from "./repository.part1";
export * from "./repository.part2";
