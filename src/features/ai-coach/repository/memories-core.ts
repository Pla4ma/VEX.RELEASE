/**
 * Coach Memories Repository — Core Operations
 *
 * Create, conflict-check, and primary user query.
 */

import { supabase } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import {
  CreateCoachMemoryInputSchema,
  type CoachMemory,
  type MemoryType,
} from '../memory-schemas';
import { mapInputToRow, mapRowToMemory } from './memory-mapper';

const debug = createDebugger('ai-coach:memory-repo');

function isActive(memory: CoachMemory): boolean {
  return memory.deletedAt === null;
}

/**
 * Check if an evidence hash was previously deleted (conflict)
 */
export async function hasEvidenceConflict(
  userId: string,
  evidenceHash: string,
): Promise<boolean> {
  if (!evidenceHash) {return false;}
  const { data, error } = await supabase
    .from('coach_memories')
    .select('id')
    .eq('user_id', userId)
    .eq('evidence_hash', evidenceHash)
    .not('deleted_at', 'is', null)
    .limit(1);

  if (error) {
    debug.warn('Failed to check evidence conflict:', error);
    return false;
  }
  return (data ?? []).length > 0;
}

/**
 * Create a new memory
 */
export async function createMemory(
  userId: string,
  type: MemoryType,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {},
  evidenceHash?: string | null,
): Promise<CoachMemory> {
  if (evidenceHash) {
    const conflict = await hasEvidenceConflict(userId, evidenceHash);
    if (conflict) {
      throw new Error(
        'EvidenceConflict: memory with this evidence was previously deleted',
      );
    }
  }

  const input = CreateCoachMemoryInputSchema.parse({
    userId,
    type,
    title,
    description,
    metadata,
    evidenceHash: evidenceHash ?? null,
  });
  const row = mapInputToRow(input);

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
 * Get all active (non-deleted) memories for a user
 */
export async function getMemoriesByUser(
  userId: string,
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from('coach_memories')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories:', error);
    throw new Error(`Failed to get memories: ${error.message}`);
  }

  return (data ?? []).map(mapRowToMemory);
}
