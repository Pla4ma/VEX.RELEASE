/**
 * Coach Memories Repository
 *
 * Supabase-backed storage for coach memories.
 * Replaces the in-memory Map that reset on app close.
 */

import { supabase } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import type { MemoryType, CoachMemory } from '../CoachMemory';

const debug = createDebugger('ai-coach:memory-repo');

// ============================================================================
// Database Types
// ============================================================================

interface CoachMemoryRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  occurred_at: string;
  metadata: Record<string, unknown>;
  referenced_count: number;
  last_referenced_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Mapping
// ============================================================================

function mapRowToMemory(row: CoachMemoryRow): CoachMemory {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as MemoryType,
    title: row.title,
    description: row.description,
    occurredAt: new Date(row.occurred_at).getTime(),
    metadata: row.metadata || {},
    referencedCount: row.referenced_count,
    lastReferencedAt: row.last_referenced_at ? new Date(row.last_referenced_at).getTime() : null,
  };
}

function mapMemoryToRow(memory: Omit<CoachMemory, 'id' | 'referencedCount' | 'lastReferencedAt'> & { id?: string }): Omit<CoachMemoryRow, 'created_at' | 'updated_at'> {
  return {
    id: memory.id || crypto.randomUUID(),
    user_id: memory.userId,
    type: memory.type,
    title: memory.title,
    description: memory.description,
    occurred_at: new Date(memory.occurredAt).toISOString(),
    metadata: memory.metadata,
    referenced_count: 0,
    last_referenced_at: null,
  };
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new memory
 */
export async function createMemory(
  userId: string,
  type: MemoryType,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<CoachMemory> {
  const row = mapMemoryToRow({
    userId,
    type,
    title,
    description,
    occurredAt: Date.now(),
    metadata,
  });

  const { data, error } = await supabase
    .from('coach_memories')
    .insert(row)
    .select()
    .single();

  if (error) {
    debug.error('Failed to create memory:', error);
    throw new Error(`Failed to create memory: ${error.message}`);
  }

  debug.info('Created memory: %s for user %s', type, userId);
  return mapRowToMemory(data);
}

/**
 * Get all memories for a user
 */
export async function getMemoriesByUser(userId: string): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories:', error);
    throw new Error(`Failed to get memories: ${error.message}`);
  }

  return (data || []).map(mapRowToMemory);
}

/**
 * Get memories by type for a user
 */
export async function getMemoriesByType(
  userId: string,
  type: MemoryType
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories by type:', error);
    throw new Error(`Failed to get memories by type: ${error.message}`);
  }

  return (data || []).map(mapRowToMemory);
}

/**
 * Mark a memory as referenced
 */
export async function markMemoryReferenced(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_memories')
    .update({
      referenced_count: supabase.rpc('increment', { x: 1 }),
      last_referenced_at: new Date().toISOString(),
    })
    .eq('id', memoryId);

  if (error) {
    // Don't throw - this is not critical
    debug.warn('Failed to mark memory referenced:', error);
  }
}

/**
 * Delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from('coach_memories')
    .delete()
    .eq('id', memoryId);

  if (error) {
    debug.error('Failed to delete memory:', error);
    throw new Error(`Failed to delete memory: ${error.message}`);
  }
}

/**
 * Get memories for multiple types
 */
export async function getMemoriesByTypes(
  userId: string,
  types: MemoryType[]
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('*')
    .eq('user_id', userId)
    .in('type', types)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories by types:', error);
    throw new Error(`Failed to get memories by types: ${error.message}`);
  }

  return (data || []).map(mapRowToMemory);
}

/**
 * Get most recent memory of a specific type
 */
export async function getMostRecentMemoryByType(
  userId: string,
  type: MemoryType
): Promise<CoachMemory | null> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('occurred_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    debug.error('Failed to get most recent memory:', error);
    throw new Error(`Failed to get most recent memory: ${error.message}`);
  }

  return mapRowToMemory(data);
}

/**
 * Check if user has memory of a specific type
 */
export async function hasMemoryOfType(
  userId: string,
  type: MemoryType
): Promise<boolean> {
  const { count, error } = await supabase
    .from('coach_memories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', type);

  if (error) {
    debug.error('Failed to check memory existence:', error);
    return false;
  }

  return (count || 0) > 0;
}
