import { z } from "zod";
import { storage } from "../../store/mmkv-storage";
import { supabase } from "../../config/supabase";
import { FocusMemorySchema, type FocusMemory } from "./schemas";

const KEY_PREFIX = "focus-memory:";

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

function marshallForUpsert(
  userId: string,
  memories: FocusMemory[],
): Record<string, unknown>[] {
  return memories.map((m) => ({
    id: m.id,
    user_id: userId,
    type: m.type,
    summary: m.summary,
    source: m.source,
    confidence: m.confidence,
    accepted: m.accepted,
    deleted_at: m.deletedAt ? new Date(m.deletedAt).toISOString() : null,
    expires_at: m.expiresAt ? new Date(m.expiresAt).toISOString() : null,
    evidence_hash: m.evidenceHash,
    created_at: new Date(m.createdAt).toISOString(),
    updated_at: new Date(m.updatedAt).toISOString(),
  }));
}

export async function readMemories(userId: string): Promise<FocusMemory[]> {
  const raw = storage.getString(keyFor(userId));
  if (!raw) return [];
  return FocusMemorySchema.array().parse(JSON.parse(raw));
}

export async function writeMemories(
  userId: string,
  memories: FocusMemory[],
): Promise<FocusMemory[]> {
  const parsed = FocusMemorySchema.array().parse(memories);
  storage.set(keyFor(userId), JSON.stringify(parsed));
  return parsed;
}

export async function syncMemoriesToSupabase(userId: string): Promise<void> {
  try {
    const memories = await readMemories(userId);
    if (memories.length === 0) return;
    const rows = marshallForUpsert(userId, memories);
    const { error } = await supabase.from("focus_memories").upsert(rows, {
      onConflict: "id",
      ignoreDuplicates: false,
    });
    if (error && error.code !== "42P01") throw error;
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") return;
    throw error;
  }
}

export async function fetchMemoriesFromSupabase(
  userId: string,
): Promise<FocusMemory[]> {
  try {
    const { data, error } = await supabase
      .from("focus_memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      if (error.code === "42P01") return [];
      throw error;
    }
    const rowSchema = z.object({
      id: z.string(),
      user_id: z.string(),
      type: z.string(),
      summary: z.string(),
      source: z.string(),
      confidence: z.number(),
      accepted: z.boolean(),
      deleted_at: z.string().nullable(),
      expires_at: z.string().nullable(),
      evidence_hash: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
    });
    return z
      .array(rowSchema)
      .parse(data ?? [])
      .map((row) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type as FocusMemory["type"],
        summary: row.summary,
        source: row.source as FocusMemory["source"],
        confidence: row.confidence,
        accepted: row.accepted,
        deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
        expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
        evidenceHash: row.evidence_hash,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }));
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "42P01") return [];
    throw error;
  }
}
