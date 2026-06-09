import { supabase } from '../../supabase/client';
import type {
  Setting,
  SettingCategory,
} from './types';
import { SettingRowSchema } from './schemas';
import {
  trackPendingChange,
  clearPendingChange,
} from './repository-sync';

const TABLE_SETTINGS = 'user_settings';
const TABLE_SYNC_STATE = 'settings_sync_state';

export async function fetchSetting(
  userId: string,
  key: string,
): Promise<Setting | null> {
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .select('id,user_id,key,value,category,is_default,last_modified,last_synced,device_id')
    .eq('user_id', userId)
    .eq('key', key)
    .single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch setting: ${error.message}`);
  }
  return data ? mapFromDb(data) : null;
}

export async function fetchAllSettings(userId: string): Promise<Setting[]> {
  const { data, error } = await supabase
    .from(TABLE_SETTINGS)
    .select('id,user_id,key,value,category,is_default,last_modified,last_synced,device_id')
    .eq('user_id', userId)
    .order('key', { ascending: true });
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
    .select('id,user_id,key,value,category,is_default,last_modified,last_synced,device_id')
    .eq('user_id', userId)
    .eq('category', category)
    .order('key', { ascending: true });
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
    .upsert(dbRecord, { onConflict: 'user_id,key' })
    .select('id,user_id,key,value,category,is_default,last_modified,last_synced,device_id')
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
    .upsert(dbRecords, { onConflict: 'user_id,key' })
    .select('id,user_id,key,value,category,is_default,last_modified,last_synced,device_id');
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
    .eq('user_id', userId)
    .eq('key', key);
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
    .eq('user_id', userId)
    .eq('is_default', false);
  if (category) {
    query = query.eq('category', category);
  }
  const { error } = await query;
  if (error) {
    throw new Error(`Failed to reset settings: ${error.message}`);
  }
}

export async function getSettingsVersion(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from(TABLE_SYNC_STATE)
    .select('version')
    .eq('user_id', userId)
    .single();
  if (error) {
    return 0;
  }
  return data?.version || 0;
}

function mapFromDb(row: unknown): Setting {
  const parsed = SettingRowSchema.parse(row);
  return {
    id: parsed.id,
    userId: parsed.user_id,
    key: parsed.key,
    value: parsed.value as import('./types').SettingValue,
    category: parsed.category,
    isDefault: parsed.is_default,
    lastModified: parsed.last_modified,
    lastSynced: parsed.last_synced,
    deviceId: parsed.device_id,
  };
}

export { mapFromDb };
