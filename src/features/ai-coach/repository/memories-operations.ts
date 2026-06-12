/**
 * Coach Memories Repository — Type & History Operations
 *
 * Query by type, mark referenced, soft-delete, and existence checks.
 */

import { supabase } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import { RepositoryError } from '../../../lib/repository/error-handling';
import type { CoachMemory, MemoryType } from '../memory/memory-schemas';
import { mapRowToMemory } from './memory-mapper';

const debug = createDebugger('ai-coach:memory-repo');

/**
 * Get active memories by type for a user
 */
export async function getMemoriesByType(
  userId: string,
  type: MemoryType,
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('id,user_id,type,title,description,occurred_at,metadata,referenced_count,last_referenced_at,deleted_at,evidence_hash,created_at,updated_at')
    .eq('user_id', userId)
    .eq('type', type)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories by type:', error);
    throw new RepositoryError('getMemoriesByType', error);
  }

  return (data ?? []).map(mapRowToMemory);
}

/**
 * Mark a memory as referenced
 */
export async function markMemoryReferenced(memoryId: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('coach_memories')
    .select('id,user_id,type,title,description,occurred_at,metadata,referenced_count,last_referenced_at,deleted_at,evidence_hash,created_at,updated_at')
    .eq('id', memoryId)
    .single();

  if (fetchError) {
    debug.warn('Failed to fetch memory before reference update:', fetchError);
    return;
  }

  const memory = mapRowToMemory(existing);
  const { error } = await supabase
    .from('coach_memories')
    .update({
      referenced_count: memory.referencedCount + 1,
      last_referenced_at: new Date().toISOString(),
    })
    .eq('id', memoryId);

  if (error) {
    // Don't throw - this is not critical
    debug.warn('Failed to mark memory referenced:', error);
  }
}

/**
 * Soft delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_memories')
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', memoryId);

  if (error) {
    debug.error('Failed to delete memory:', error);
    throw new RepositoryError('deleteMemory', error);
  }
}

/**
 * Get active memories for multiple types
 */
export async function getMemoriesByTypes(
  userId: string,
  types: MemoryType[],
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('id,user_id,type,title,description,occurred_at,metadata,referenced_count,last_referenced_at,deleted_at,evidence_hash,created_at,updated_at')
    .eq('user_id', userId)
    .in('type', types)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories by types:', error);
    throw new RepositoryError('getMemoriesByTypes', error);
  }

  return (data ?? []).map(mapRowToMemory);
}

/**
 * Get most recent active memory of a specific type
 */
export async function getMostRecentMemoryByType(
  userId: string,
  type: MemoryType,
): Promise<CoachMemory | null> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('id,user_id,type,title,description,occurred_at,metadata,referenced_count,last_referenced_at,deleted_at,evidence_hash,created_at,updated_at')
    .eq('user_id', userId)
    .eq('type', type)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    debug.error('Failed to get most recent memory:', error);
    throw new RepositoryError('getMostRecentMemoryByType', error);
  }

  return mapRowToMemory(data);
}

/**
 * Check if user has active memory of a specific type
 */
export async function hasMemoryOfType(
  userId: string,
  type: MemoryType,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('coach_memories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', type)
    .is('deleted_at', null);

  if (error) {
    debug.error('Failed to check memory existence:', error);
    return false;
  }

  return (count ?? 0) > 0;
}
