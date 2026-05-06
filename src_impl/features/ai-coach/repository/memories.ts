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

/**
 * Create a new memory
 */
export async function createMemory(userId: string, type: MemoryType, title: string, description: string, metadata: Record<string, unknown> = {}): Promise<CoachMemory> {
  const input = CreateCoachMemoryInputSchema.parse({
    userId,
    type,
    title,
    description,
    metadata,
  });
  const row = mapInputToRow(input);

  const { data, error } = await supabase.from("coach_memories").insert(row).select().single();

  if (error) {
    debug.error("Failed to create memory:", error);
    throw new Error(`Failed to create memory: ${error.message}`);
  }

  debug.info("Created memory: %s for user %s", type, userId);
  return mapRowToMemory(data);
}

/**
 * Get all memories for a user
 */
export async function getMemoriesByUser(userId: string): Promise<CoachMemory[]> {
  const { data, error } = await supabase.from("coach_memories").select("*").eq("user_id", userId).order("occurred_at", { ascending: false });

  if (error) {
    debug.error("Failed to get memories:", error);
    throw new Error(`Failed to get memories: ${error.message}`);
  }

  return (data ?? []).map(mapRowToMemory);
}

/**
 * Get memories by type for a user
 */
export async function getMemoriesByType(userId: string, type: MemoryType): Promise<CoachMemory[]> {
  const { data, error } = await supabase.from("coach_memories").select("*").eq("user_id", userId).eq("type", type).order("occurred_at", { ascending: false });

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
 * Delete a memory
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  const { error } = await supabase.from("coach_memories").delete().eq("id", memoryId);

  if (error) {
    debug.error("Failed to delete memory:", error);
    throw new Error(`Failed to delete memory: ${error.message}`);
  }
}

/**
 * Get memories for multiple types
 */
export async function getMemoriesByTypes(userId: string, types: MemoryType[]): Promise<CoachMemory[]> {
  const { data, error } = await supabase.from("coach_memories").select("*").eq("user_id", userId).in("type", types).order("occurred_at", { ascending: false });

  if (error) {
    debug.error("Failed to get memories by types:", error);
    throw new Error(`Failed to get memories by types: ${error.message}`);
  }

  return (data ?? []).map(mapRowToMemory);
}

/**
 * Get most recent memory of a specific type
 */
export async function getMostRecentMemoryByType(userId: string, type: MemoryType): Promise<CoachMemory | null> {
  const { data, error } = await supabase.from("coach_memories").select("*").eq("user_id", userId).eq("type", type).order("occurred_at", { ascending: false }).limit(1).single();

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
 * Check if user has memory of a specific type
 */
export async function hasMemoryOfType(userId: string, type: MemoryType): Promise<boolean> {
  const { count, error } = await supabase.from("coach_memories").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("type", type);

  if (error) {
    debug.error("Failed to check memory existence:", error);
    return false;
  }

  return (count ?? 0) > 0;
}
