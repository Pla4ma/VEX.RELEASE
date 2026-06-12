/**
 * Coach Memories Repository — Core Operations
 *
 * Create, conflict-check, and primary user query.
 */

import { supabase } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';
import { RepositoryError } from '../../../lib/repository/error-handling';
import {
  CreateCoachMemoryInputSchema,
  type CoachMemory,
  type MemoryType,
} from '../memory/memory-schemas';
import { mapInputToRow, mapRowToMemory } from './memory-mapper';
import { tableColumns } from '../../../lib/repository/tableColumns';

const debug = createDebugger('ai-coach:memory-repo');

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
      throw new RepositoryError(
        'createMemory',
        new Error('EvidenceConflict: memory with this evidence was previously deleted'),
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
    .select(tableColumns('coach_memories'))
    .single();

  if (error) {
    debug.error('Failed to create memory:', error);
    throw new RepositoryError('createMemory', error);
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
    .select('id,user_id,type,title,description,occurred_at,metadata,referenced_count,last_referenced_at,deleted_at,evidence_hash,created_at,updated_at')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false });

  if (error) {
    debug.error('Failed to get memories:', error);
    throw new RepositoryError('getMemoriesByUser', error);
  }

  return (data ?? []).map(mapRowToMemory);
}
