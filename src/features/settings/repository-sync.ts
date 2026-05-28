import { supabase } from "../../supabase/client";
import type { SyncState, SyncConflict, SettingCategory } from "./types";

const TABLE_SYNC_STATE = "settings_sync_state";
const TABLE_PENDING_CHANGES = "settings_pending_changes";
const TABLE_SYNC_CONFLICTS = "settings_sync_conflicts";
const TABLE_SETTINGS = "user_settings";

type PendingChange = { key: string; value: unknown; timestamp: number };
type RemoteChange = { key: string; value: unknown; category: SettingCategory; timestamp: number };

export async function fetchSyncState(userId: string): Promise<SyncState | null> {
  const { data, error } = await supabase
    .from(TABLE_SYNC_STATE)
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch sync state: ${error.message}`);
  }
  return data
    ? {
        userId: data.user_id as string,
        status: data.status as "idle" | "syncing" | "error" | "conflict",
        lastSyncAttempt: data.last_sync_attempt as number,
        lastSuccessfulSync: data.last_successful_sync as number | undefined,
        pendingChanges: data.pending_changes as number,
        conflicts: [],
        errorMessage: data.error_message as string | undefined,
      }
    : null;
}

export async function updateSyncState(userId: string, state: Partial<SyncState>): Promise<void> {
  const { error } = await supabase.from(TABLE_SYNC_STATE).upsert(
    {
      user_id: userId,
      status: state.status,
      last_sync_attempt: state.lastSyncAttempt,
      last_successful_sync: state.lastSuccessfulSync,
      pending_changes: state.pendingChanges || 0,
      error_message: state.errorMessage || null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(`Failed to update sync state: ${error.message}`);
}

export async function trackPendingChange(userId: string, key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from(TABLE_PENDING_CHANGES)
    .upsert({ user_id: userId, key, value, timestamp: Date.now() }, { onConflict: "user_id,key" });
  if (error) void error;
}

export async function clearPendingChange(userId: string, key: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_PENDING_CHANGES)
    .delete()
    .eq("user_id", userId)
    .eq("key", key);
  if (error) void error;
}

export async function fetchPendingChanges(userId: string): Promise<PendingChange[]> {
  const { data, error } = await supabase
    .from(TABLE_PENDING_CHANGES)
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true });
  if (error) throw new Error(`Failed to fetch pending changes: ${error.message}`);
  return (data || []).map((row: PendingChange) => ({
    key: row.key, value: row.value, timestamp: row.timestamp,
  }));
}

export async function pushChanges(
  userId: string,
  changes: PendingChange[],
): Promise<{ success: boolean; conflicts: SyncConflict[] }> {
  const conflicts: SyncConflict[] = [];
  for (const change of changes) {
    const { data: remote } = await supabase
      .from(TABLE_SETTINGS)
      .select("last_modified")
      .eq("user_id", userId)
      .eq("key", change.key)
      .single();
    if (remote && remote.last_modified > change.timestamp) {
      conflicts.push({
        id: `${userId}:${change.key}`,
        settingKey: change.key,
        localValue: change.value as import("./types").SettingValue,
        remoteValue: null as import("./types").SettingValue,
        localTimestamp: change.timestamp,
        remoteTimestamp: remote.last_modified,
      });
    } else {
      await clearPendingChange(userId, change.key);
    }
  }
  return { success: conflicts.length === 0, conflicts };
}

export async function fetchRemoteChanges(userId: string, sinceTimestamp?: number): Promise<RemoteChange[]> {
  let query = supabase.from(TABLE_SETTINGS).select("*").eq("user_id", userId);
  if (sinceTimestamp) query = query.gt("last_modified", sinceTimestamp);
  const { data, error } = await query.order("last_modified", { ascending: true });
  if (error) throw new Error(`Failed to fetch remote changes: ${error.message}`);
  return (data || []).map((row: RemoteChange & { last_modified: number }) => ({
    key: row.key, value: row.value, category: row.category, timestamp: row.last_modified,
  }));
}

export async function applyRemoteChanges(userId: string, changes: RemoteChange[]): Promise<void> {
  if (changes.length === 0) return;
  const { error } = await supabase.from(TABLE_SETTINGS).upsert(
    changes.map((c) => ({
      user_id: userId, key: c.key, value: c.value,
      category: c.category, last_modified: c.timestamp, is_default: false,
    })),
    { onConflict: "user_id,key" },
  );
  if (error) throw new Error(`Failed to apply remote changes: ${error.message}`);
}

export async function resolveConflict(
  userId: string, conflictId: string, resolution: "local" | "remote" | "merge",
): Promise<void> {
  const { error } = await supabase.from(TABLE_SYNC_CONFLICTS).upsert(
    { id: conflictId, user_id: userId, resolution, resolved_at: Date.now() },
    { onConflict: "id" },
  );
  if (error) throw new Error(`Failed to resolve conflict: ${error.message}`);
}
