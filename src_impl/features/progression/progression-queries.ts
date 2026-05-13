/**
 * Progression Queries
 * Core CRUD operations for the progression table.
 */

import { getSupabaseClient } from '../../config/supabase';
import { ProgressionSchema, type Progression } from './schemas';
import { v4 } from '../../utils/uuid';
import { withResilience } from '../../utils/supabase-resilience';

// ============================================================================
// Error
// ============================================================================

export class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    const message =
      originalError instanceof Error
        ? originalError.message
        : 'Unknown error';
    super(`Repository error in ${operation}: ${message}`);
    this.name = 'RepositoryError';
  }
}

// ============================================================================
// Supabase Client
// ============================================================================

const supabase = getSupabaseClient();

// ============================================================================
// Fetch
// ============================================================================

export async function fetchProgression(
  userId: string
): Promise<Progression | null> {
  const { data, error } = await withResilience(
    supabase.from('progression').select('*').eq('user_id', userId).single(),
    { operation: 'fetchProgression' }
  );

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchProgression', error);
  }

  if (!data) {
    return null;
  }
  return ProgressionSchema.parse(data);
}

// ============================================================================
// Create
// ============================================================================

export async function createProgression(
  userId: string
): Promise<Progression> {
  const now = Date.now();
  const newProgression = {
    id: v4(),
    user_id: userId,
    level: 1,
    xp: 0,
    total_xp: 0,
    next_level_threshold: 100,
    last_level_up_at: null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await withResilience(
    supabase.from('progression').insert(newProgression).select().single(),
    { operation: 'createProgression', fallbackValue: newProgression }
  );

  if (error) {
    throw new RepositoryError('createProgression', error);
  }

  return ProgressionSchema.parse(data);
}

// ============================================================================
// Update
// ============================================================================

export async function updateProgression(
  userId: string,
  updates: Partial<{
    level: number;
    xp: number;
    total_xp: number;
    next_level_threshold: number;
    last_level_up_at: number | null;
  }>
): Promise<Progression> {
  const { data, error } = await withResilience(
    supabase
      .from('progression')
      .update({ ...updates, updated_at: Date.now() })
      .eq('user_id', userId)
      .select()
      .single(),
    { operation: 'updateProgression' }
  );

  if (error) {
    throw new RepositoryError('updateProgression', error);
  }

  return ProgressionSchema.parse(data);
}

export { supabase };
