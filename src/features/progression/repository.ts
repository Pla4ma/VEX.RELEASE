import { getSupabaseClient } from "../../config/supabase";
import {
  ProgressionSchema,
  XpEntrySchema,
  type Progression,
  type XpEntry,
} from "./schemas";
import { v4 } from "../../utils/uuid";
import { withResilience } from "../../utils/supabase-resilience";
class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown,
  ) {
    super(
      `Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : "Unknown error"}`,
    );
    this.name = "RepositoryError";
  }
}
const supabase = getSupabaseClient();
export async function fetchProgression(
  userId: string,
): Promise<Progression | null> {
  const { data, error } = await withResilience(
    supabase.from("progression").select("*").eq("user_id", userId).single(),
    { operation: "fetchProgression" },
  );
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new RepositoryError("fetchProgression", error);
  }
  if (!data) {
    return null;
  }
  return ProgressionSchema.parse(data);
}
export async function createProgression(userId: string): Promise<Progression> {
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
    supabase.from("progression").insert(newProgression).select().single(),
    { operation: "createProgression", fallbackValue: newProgression },
  );
  if (error) {
    throw new RepositoryError("createProgression", error);
  }
  return ProgressionSchema.parse(data);
}
export async function updateProgression(
  userId: string,
  updates: Partial<{
    level: number;
    xp: number;
    total_xp: number;
    next_level_threshold: number;
    last_level_up_at: number | null;
  }>,
): Promise<Progression> {
  const { data, error } = await withResilience(
    supabase
      .from("progression")
      .update({ ...updates, updated_at: Date.now() })
      .eq("user_id", userId)
      .select()
      .single(),
    { operation: "updateProgression" },
  );
  if (error) {
    throw new RepositoryError("updateProgression", error);
  }
  return ProgressionSchema.parse(data);
}
export async function fetchXpHistory(
  userId: string,
  options?: { limit?: number; since?: number },
): Promise<XpEntry[]> {
  let query = supabase
    .from("xp_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (options?.since) {
    query = query.gte("created_at", options.since);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  const { data, error } = await query;
  if (error) {
    throw new RepositoryError("fetchXpHistory", error);
  }
  return XpEntrySchema.array().parse(data);
}
export async function recordXpEntry(
  userId: string,
  entry: Omit<XpEntry, "id" | "userId">,
): Promise<XpEntry> {
  const newEntry = {
    id: v4(),
    user_id: userId,
    amount: entry.amount,
    source: entry.source,
    session_id: entry.sessionId,
    metadata: entry.metadata,
    created_at: entry.createdAt,
  };
  const { data, error } = await withResilience(
    supabase.from("xp_history").insert(newEntry).select().single(),
    { operation: "recordXpEntry", fallbackValue: newEntry },
  );
  if (error) {
    throw new RepositoryError("recordXpEntry", error);
  }
  return XpEntrySchema.parse(data);
}
export async function fetchXpForPeriod(
  userId: string,
  startTime: number,
  endTime: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("xp_history")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", startTime)
    .lte("created_at", endTime);
  if (error) {
    throw new RepositoryError("fetchXpForPeriod", error);
  }
  if (!data) {
    return 0;
  }
  return data.reduce(
    (sum: number, entry: { amount: number | null }) =>
      sum + (entry.amount || 0),
    0,
  );
}
export async function recordLevelUp(
  userId: string,
  level: number,
  xpAtLevel: number,
): Promise<void> {
  const { error } = await supabase
    .from("level_up_history")
    .insert({
      id: v4(),
      user_id: userId,
      level,
      achieved_at: Date.now(),
      xp_at_level: xpAtLevel,
    });
  if (error) {
    throw new RepositoryError("recordLevelUp", error);
  }
}
export async function fetchLevelUpHistory(
  userId: string,
): Promise<Array<{ level: number; achievedAt: number; xpAtLevel: number }>> {
  const { data, error } = await supabase
    .from("level_up_history")
    .select("level, achieved_at, xp_at_level")
    .eq("user_id", userId)
    .order("level", { ascending: true });
  if (error) {
    throw new RepositoryError("fetchLevelUpHistory", error);
  }
  return (data || []).map(
    (row: { level: number; achieved_at: number; xp_at_level: number }) => ({
      level: row.level,
      achievedAt: row.achieved_at,
      xpAtLevel: row.xp_at_level,
    }),
  );
}
