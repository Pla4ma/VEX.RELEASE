import { supabase } from "../../supabase/client";
import {
  type Setting,
  type SyncState,
  type SyncConflict,
  type SettingCategory,
} from "./types";
const TABLE_SETTINGS = "user_settings";
const TABLE_SYNC_STATE = "settings_sync_state";
const TABLE_PENDING_CHANGES = "settings_pending_changes";
const TABLE_SYNC_CONFLICTS = "settings_sync_conflicts";
export async function fetchSetting(
  userId: string,
  key: string,
): Promise<Setting | null> {
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .select("*")
    .eq("user_id", userId)
    .eq("key", key)
    .single();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch setting: ${error.message}`);
  }
  return data ? mapFromDb(data) : null;
}
export async function fetchAllSettings(userId: string): Promise<Setting[]> {
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .select("*")
    .eq("user_id", userId)
    .order("key", { ascending: true });
  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }
  return (data || []).map(mapFromDb);
}
export async function fetchSettingsByCategory(
  userId: string,
  category: SettingCategory,
): Promise<Setting[]> {
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .order("key", { ascending: true });
  if (error) {
    throw new Error(`Failed to fetch settings by category: ${error.message}`);
  }
  return (data || []).map(mapFromDb);
}
export async function upsertSetting(setting: {
  userId: string;
  key: string;
  value: unknown;
  category: SettingCategory;
  lastModified: number;
  deviceId?: string;
}): Promise<Setting> {
  const dbRecord = {
    user_id: setting.userId,
    key: setting.key,
    value: setting.value,
    category: setting.category,
    last_modified: setting.lastModified,
    device_id: setting.deviceId || null,
    is_default: false,
  };
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .upsert(dbRecord, { onConflict: "user_id,key" })
    .select()
    .single();
  if (error) {
    throw new Error(`Failed to upsert setting: ${error.message}`);
  }
  await trackPendingChange(setting.userId, setting.key, setting.value);
  return mapFromDb(data);
}
export async function batchUpsertSettings(
  settings: Array<{
    userId: string;
    key: string;
    value: unknown;
    category: SettingCategory;
    lastModified: number;
    deviceId?: string;
  }>,
): Promise<Setting[]> {
  if (settings.length === 0) {
    return [];
  }
  const dbRecords = settings.map((s) => ({
    user_id: s.userId,
    key: s.key,
    value: s.value,
    category: s.category,
    last_modified: s.lastModified,
    device_id: s.deviceId || null,
    is_default: false,
  }));
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .upsert(dbRecords, { onConflict: "user_id,key" })
    .select();
  if (error) {
    throw new Error(`Failed to batch upsert settings: ${error.message}`);
  }
  for (const setting of settings) {
    await trackPendingChange(setting.userId, setting.key, setting.value);
  }
  return (data || []).map(mapFromDb);
}
export async function deleteSetting(
  userId: string,
  key: string,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_SETTINGS)
    .delete()
    .eq("user_id", userId)
    .eq("key", key);
  if (error) {
    throw new Error(`Failed to delete setting: ${error.message}`);
  }
  await clearPendingChange(userId, key);
}
export async function resetSettings(
  userId: string,
  category?: SettingCategory,
): Promise<void> {
  let query = supabase
    .from(TABLE_SETTINGS)
    .delete()
    .eq("user_id", userId)
    .eq("is_default", false);
  if (category) {
    query = query.eq("category", category);
  }
  const { error } = await query;
  if (error) {
    throw new Error(`Failed to reset settings: ${error.message}`);
  }
}
export async function fetchSyncState(
  userId: string,
): Promise<SyncState | null> {
  const { data, error } = await supabase
    .from(TABLE_SYNC_STATE)
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch sync state: ${error.message}`);
  }
  return data ? mapSyncStateFromDb(data) : null;
}
export async function updateSyncState(
  userId: string,
  state: Partial<SyncState>,
): Promise<void> {
  const dbRecord = {
    user_id: userId,
    status: state.status,
    last_sync_attempt: state.lastSyncAttempt,
    last_successful_sync: state.lastSuccessfulSync,
    pending_changes: state.pendingChanges || 0,
    error_message: state.errorMessage || null,
  };
  const { error } = await supabase
    .from(TABLE_SYNC_STATE)
    .upsert(dbRecord, { onConflict: "user_id" });
  if (error) {
    throw new Error(`Failed to update sync state: ${error.message}`);
  }
}
async function trackPendingChange(
  userId: string,
  key: string,
  value: unknown,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_PENDING_CHANGES)
    .upsert(
      { user_id: userId, key, value, timestamp: Date.now() },
      { onConflict: "user_id,key" },
    );
  if (error) {
    void error;
  }
}
async function clearPendingChange(userId: string, key: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_PENDING_CHANGES)
    .delete()
    .eq("user_id", userId)
    .eq("key", key);
  if (error) {
    void error;
  }
}
export async function fetchPendingChanges(
  userId: string,
): Promise<Array<{ key: string; value: unknown; timestamp: number }>> {
  const { data, error } = await supabase
    .from(TABLE_PENDING_CHANGES)
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true });
  if (error) {
    throw new Error(`Failed to fetch pending changes: ${error.message}`);
  }
  return (data || []).map(
    (row: { key: string; value: unknown; timestamp: number }) => ({
      key: row.key,
      value: row.value,
      timestamp: row.timestamp,
    }),
  );
}
export async function pushChanges(
  userId: string,
  changes: Array<{ key: string; value: unknown; timestamp: number }>,
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
export async function fetchRemoteChanges(
  userId: string,
  sinceTimestamp?: number,
): Promise<
  Array<{
    key: string;
    value: unknown;
    category: SettingCategory;
    timestamp: number;
  }>
> {
  let query = supabase.from(TABLE_SETTINGS).select("*").eq("user_id", userId);
  if (sinceTimestamp) {
    query = query.gt("last_modified", sinceTimestamp);
  }
  const { data, error } = await query.order("last_modified", {
    ascending: true,
  });
  if (error) {
    throw new Error(`Failed to fetch remote changes: ${error.message}`);
  }
  return (data || []).map(
    (row: {
      key: string;
      value: unknown;
      category: SettingCategory;
      last_modified: number;
    }) => ({
      key: row.key,
      value: row.value,
      category: row.category,
      timestamp: row.last_modified,
    }),
  );
}
export async function applyRemoteChanges(
  userId: string,
  changes: Array<{
    key: string;
    value: unknown;
    category: SettingCategory;
    timestamp: number;
  }>,
): Promise<void> {
  if (changes.length === 0) {
    return;
  }
  const dbRecords = changes.map((c) => ({
    user_id: userId,
    key: c.key,
    value: c.value,
    category: c.category,
    last_modified: c.timestamp,
    is_default: false,
  }));
  const { error } = await supabase
    .from(TABLE_SETTINGS)
    .upsert(dbRecords, { onConflict: "user_id,key" });
  if (error) {
    throw new Error(`Failed to apply remote changes: ${error.message}`);
  }
}
export async function resolveConflict(
  userId: string,
  conflictId: string,
  resolution: "local" | "remote" | "merge",
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_SYNC_CONFLICTS)
    .upsert(
      { id: conflictId, user_id: userId, resolution, resolved_at: Date.now() },
      { onConflict: "id" },
    );
  if (error) {
    throw new Error(`Failed to resolve conflict: ${error.message}`);
  }
}
export async function getSettingsVersion(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLE_SYNC_STATE)
    .select("version")
    .eq("user_id", userId)
    .single();
  if (error) {
    return 0;
  }
  return data?.version || 0;
}
function mapFromDb(row: { [key: string]: unknown }): Setting {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    key: row.key as string,
    value: row.value as import("./types").SettingValue,
    category: row.category as SettingCategory,
    isDefault: row.is_default as boolean,
    lastModified: row.last_modified as number,
    lastSynced: row.last_synced as number | undefined,
    deviceId: row.device_id as string | undefined,
  };
}
function mapSyncStateFromDb(row: { [key: string]: unknown }): SyncState {
  return {
    userId: row.user_id as string,
    status: row.status as "idle" | "syncing" | "error" | "conflict",
    lastSyncAttempt: row.last_sync_attempt as number,
    lastSuccessfulSync: row.last_successful_sync as number | undefined,
    pendingChanges: row.pending_changes as number,
    conflicts: [],
    errorMessage: row.error_message as string | undefined,
  };
}
