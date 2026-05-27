/**
 * Coach Memories Repository
 *
 * Supabase-backed storage for coach memories.
 * Replaces the in-memory Map that reset on app close.
 */

import { supabase } from "../../../config/supabase";
import { createDebugger } from "../../../utils/debug";
import {
  CreateCoachMemoryInputSchema,
  type CoachMemory,
  type MemoryType,
} from "../memory-schemas";
import { mapInputToRow, mapRowToMemory } from "./memory-mapper";

const debug = createDebugger("ai-coach:memory-repo");

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
  if (!evidenceHash) return false;
  const { data, error } = await supabase
    .from("coach_memories")
    .select("id")
    .eq("user_id", userId)
    .eq("evidence_hash", evidenceHash)
    .not("deleted_at", "is", null)
    .limit(1);

  if (error) {
    debug.warn("Failed to check evidence conflict:", error);
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
        "EvidenceConflict: memory with this evidence was previously deleted",
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
    .from("coach_memories")
    .insert(row)
    .select()
    .single();

  if (error) {
    debug.error("Failed to create memory:", error);
    throw new Error(`Failed to create memory: ${error.message}`);
  }

  debug.info("Created memory: %s for user %s", type, userId);
  return mapRowToMemory(data);
}

/**
 * Get all active (non-deleted) memories for a user
 */
export async function getMemoriesByUser(
  userId: string,
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from("coach_memories")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false });

  if (error) {
    debug.error("Failed to get memories:", error);
    throw new Error(`Failed to get memories: ${error.message}`);
  }

  return (data ?? []).map(mapRowToMemory);
}

/**
 * Get active memories by type for a user
 */
export async function getMemoriesByType(
  userId: string,
  type: MemoryType,
): Promise<CoachMemory[]> {
  const { data, error } = await supabase
    .from("coach_memories")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false });

  if (error) {
    debug.error("Failed to get memories by type:", error);
    throw new Error(`Failed to get memories by type: ${error.message}`);
  }

  return (data ?? []).map(mapRowToMemory);
}

/**
 * Mark a memory as referenced
 */
export async function markMemoryReferenced(memoryId: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("coach_memories")
    .select("*")
    .eq("id", memoryId)
    .single();

  if (fetchError) {
    debug.warn("Failed to fetch memory before reference update:", fetchError);
    return;
  }

  const memory = mapRowToMemory(existing);
  const { error } = await supabase
    .from("coach_memories")
    .update({
      referenced_count: memory.referencedCount + 1,
      last_referenced_at: new Date().toISOString(),
    })
    .eq("id", memoryId);

  if (error) {
    // Don't throw - this is not critical
    debug.warn("Failed to mark memory referenced:", error);
  }
}

/**
 * Soft delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  const { error } = await supabase
    .from("coach_memories")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", memoryId);

  if (error) {
    debug.error("Failed to delete memory:", error);
    throw new Error(`Failed to delete memory: ${error.message}`);
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
    .from("coach_memories")
    .select("*")
    .eq("user_id", userId)
    .in("type", types)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false });

  if (error) {
    debug.error("Failed to get memories by types:", error);
    throw new Error(`Failed to get memories by types: ${error.message}`);
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
    .from("coach_memories")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .is("deleted_at", null)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    debug.error("Failed to get most recent memory:", error);
    throw new Error(`Failed to get most recent memory: ${error.message}`);
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
    .from("coach_memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", type)
    .is("deleted_at", null);

  if (error) {
    debug.error("Failed to check memory existence:", error);
    return false;
  }

  return (count ?? 0) > 0;
}
