import * as repository from './repository';
import { withRetry, TTLCache } from '../../shared/hardening';
import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import type { Setting, UserPreferences, SettingCategory, SettingValue, SettingsExport } from './types';
import { validateSettingValue, SettingsValidationError } from './settings-validation';
import { syncSettings } from './settings-sync';

const settingsCache = new TTLCache<Setting>(300000);
const preferencesCache = new TTLCache<UserPreferences>(300000);

const SYNC_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  retryableErrors: ['network_error', 'timeout', 'server_error'],
};

export async function getSetting(userId: string, key: string): Promise<Setting | null> {
  const cacheKey = `${userId}:${key}`;
  const cached = settingsCache.get(cacheKey);
  if (cached) {return cached;}
  try {
    const setting = await withRetry(() => repository.fetchSetting(userId, key), SYNC_RETRY_CONFIG);
    if (setting) {settingsCache.set(cacheKey, setting);}
    return setting;
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: 'getSetting' }, extra: { userId, key } });
    throw error;
  }
}

export async function getAllSettings(userId: string): Promise<Setting[]> {
  try {
    const settings = await withRetry(() => repository.fetchAllSettings(userId), SYNC_RETRY_CONFIG);
    for (const s of settings) {settingsCache.set(`${userId}:${s.key}`, s);}
    return settings;
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: 'getAllSettings' }, extra: { userId } });
    throw error;
  }
}

export async function updateSetting(
  userId: string,
  key: string,
  value: SettingValue,
  category: SettingCategory,
  options: { skipSync?: boolean; deviceId?: string } = {},
): Promise<Setting> {
  const { skipSync = false, deviceId } = options;
  try {
    const oldSetting = await getSetting(userId, key);
    const oldValue = oldSetting?.value ?? null;
    const v = validateSettingValue(key, value, category);
    if (!v.valid) {throw new SettingsValidationError(`Invalid setting value: ${v.errors.join(', ')}`, key, v.errors);}
    const sanitized = v.sanitized ?? value;
    const updated = await withRetry(
      () => repository.upsertSetting({ userId, key, value: sanitized, category, lastModified: Date.now(), deviceId }),
      SYNC_RETRY_CONFIG,
    );
    settingsCache.set(`${userId}:${key}`, updated);
    eventBus.publish('settings:change', { key, value: sanitized, previousValue: oldValue });
    Sentry.addBreadcrumb({ category: 'settings', message: `Setting updated: ${key}`, level: 'info', data: { userId, key, category } });
    if (!skipSync) {backgroundSync(userId);}
    return updated;
  } catch (error) {
    if (error instanceof SettingsValidationError) {throw error;}
    Sentry.captureException(error, { tags: { operation: 'updateSetting' }, extra: { userId, key, category } });
    throw error;
  }
}

export async function batchUpdateSettings(
  userId: string,
  updates: Array<{ key: string; value: SettingValue; category: SettingCategory }>,
  options: { skipSync?: boolean } = {},
): Promise<Setting[]> {
  const { skipSync = false } = options;
  const ve: Array<{ key: string; error: string }> = [];
  for (const u of updates) {
    const r = validateSettingValue(u.key, u.value, u.category);
    if (!r.valid) {ve.push({ key: u.key, error: r.errors.join(', ') });}
  }
  if (ve.length > 0) {throw new SettingsValidationError(`Batch validation failed: ${ve.map((e) => `${e.key}: ${e.error}`).join('; ')}`, 'batch', ve.map((e) => e.error));}
  try {
    const result = await withRetry(
      () => repository.batchUpsertSettings(updates.map((u) => ({ userId, key: u.key, value: u.value, category: u.category, lastModified: Date.now() }))),
      SYNC_RETRY_CONFIG,
    );
    for (const s of result) {settingsCache.set(`${userId}:${s.key}`, s);}
    for (const u of updates) {eventBus.publish('settings:change', { key: u.key, value: u.value, previousValue: null });}
    if (!skipSync) {backgroundSync(userId);}
    return result;
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: 'batchUpdateSettings' }, extra: { userId, count: updates.length } });
    throw error;
  }
}

export async function deleteSetting(userId: string, key: string): Promise<boolean> {
  try {
    await withRetry(() => repository.deleteSetting(userId, key), SYNC_RETRY_CONFIG);
    settingsCache.delete(`${userId}:${key}`);
    eventBus.publish('settings:change', { key, value: null, previousValue: null });
    return true;
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: 'deleteSetting' }, extra: { userId, key } });
    throw error;
  }
}

export async function resetSettings(userId: string, category?: SettingCategory): Promise<void> {
  try {
    await withRetry(() => repository.resetSettings(userId, category), SYNC_RETRY_CONFIG);
    if (category) {
      const all = await getAllSettings(userId);
      for (const s of all.filter((s) => s.category === category)) {settingsCache.delete(`${userId}:${s.key}`);}
    } else { settingsCache.clear(); preferencesCache.delete(userId); }
    eventBus.publish('settings:reset', { category });
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: 'resetSettings' }, extra: { userId, category } });
    throw error;
  }
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const cached = preferencesCache.get(userId);
  if (cached) {return cached;}
  try {
    const settings = await getAllSettings(userId);
    const prefs: UserPreferences = { userId, version: 1, settings: {}, createdAt: Date.now(), updatedAt: Date.now() };
    for (const s of settings) {prefs.settings[s.key] = s;}
    preferencesCache.set(userId, prefs);
    return prefs;
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: 'getUserPreferences' }, extra: { userId } });
    throw error;
  }
}

export async function exportSettings(userId: string): Promise<SettingsExport> {
  const { getNotificationSettings, getCoachSettings, getAppearanceSettings, getPrivacySettings } = await import('./settings-domain');
  const [prefs, ns, cs, as, ps] = await Promise.all([
    getUserPreferences(userId), getNotificationSettings(userId), getCoachSettings(userId), getAppearanceSettings(userId), getPrivacySettings(userId),
  ]);
  return {
    version: 1, exportedAt: Date.now(), userId, preferences: prefs,
    notificationSettings: ns, coachSettings: cs, appearanceSettings: as, privacySettings: ps,
    dataControlSettings: { userId, retentionPolicy: 'standard', autoExport: { enabled: false, frequency: 'never', format: 'json' }, backupEnabled: false },
  };
}

export async function importSettings(userId: string, data: SettingsExport): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  if (data.version !== 1) {throw new SettingsValidationError(`Unsupported export version: ${data.version}`, 'version', ['Invalid export format']);}
  try {
    const settings = Object.values(data.preferences.settings);
    await batchUpdateSettings(userId, settings.map((s) => ({ key: s.key, value: s.value, category: s.category })));
    Sentry.addBreadcrumb({ category: 'settings', message: `Settings imported: ${settings.length}`, level: 'info', data: { userId } });
    return { imported: settings.length, errors };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Import failed';
    errors.push(msg);
    Sentry.captureException(error, { tags: { operation: 'importSettings' }, extra: { userId } });
    return { imported: 0, errors };
  }
}

function backgroundSync(userId: string): void {
  syncSettings(userId).catch((err) => {
    Sentry.captureException(err, { tags: { operation: 'backgroundSync' }, extra: { userId } });
  });
}

export { SettingsValidationError };
export { syncSettings };
export {
  getNotificationSettings, updateNotificationSettings,
  getCoachSettings, updateCoachSettings,
  getAppearanceSettings, updateAppearanceSettings,
  getPrivacySettings, updatePrivacySettings,
} from './settings-domain';
