import * as repository from "./repository";
import { withRetry, TTLCache } from "../../shared/hardening";
import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import type { Setting, SettingCategory, SettingsExport } from "./types";
import { validateSettingValue, SettingsValidationError } from "./settings-validation";
import { syncSettings } from "./settings-sync";
import {
  getSetting,
  getAllSettings,
  updateSetting,
  batchUpdateSettings,
  getUserPreferences,
  settingsCache,
  preferencesCache,
} from "./settings-core";

export { getSetting, getAllSettings, updateSetting, batchUpdateSettings, getUserPreferences };

export async function deleteSetting(userId: string, key: string): Promise<boolean> {
  try {
    await withRetry(() => repository.deleteSetting(userId, key), SYNC_RETRY_CONFIG);
    settingsCache.delete(`${userId}:${key}`);
    eventBus.publish("settings:change", { key, value: null, previousValue: null });
    return true;
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: "deleteSetting" }, extra: { userId, key } });
    throw error;
  }
}

export async function resetSettings(userId: string, category?: SettingCategory): Promise<void> {
  try {
    await withRetry(() => repository.resetSettings(userId, category), SYNC_RETRY_CONFIG);
    if (category) {
      const all = await getAllSettings(userId);
      for (const s of all.filter((s) => s.category === category)) settingsCache.delete(`${userId}:${s.key}`);
    } else { settingsCache.clear(); preferencesCache.delete(userId); }
    eventBus.publish("settings:reset", { category });
  } catch (error) {
    Sentry.captureException(error, { tags: { operation: "resetSettings" }, extra: { userId, category } });
    throw error;
  }
}

export async function exportSettings(userId: string): Promise<SettingsExport> {
  const { getNotificationSettings, getCoachSettings, getAppearanceSettings, getPrivacySettings } = await import("./settings-domain");
  const [prefs, ns, cs, as, ps] = await Promise.all([
    getUserPreferences(userId), getNotificationSettings(userId), getCoachSettings(userId), getAppearanceSettings(userId), getPrivacySettings(userId),
  ]);
  return {
    version: 1, exportedAt: Date.now(), userId, preferences: prefs,
    notificationSettings: ns, coachSettings: cs, appearanceSettings: as, privacySettings: ps,
    dataControlSettings: { userId, retentionPolicy: "standard", autoExport: { enabled: false, frequency: "never", format: "json" }, backupEnabled: false },
  };
}

export async function importSettings(userId: string, data: SettingsExport): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  if (data.version !== 1) throw new SettingsValidationError(`Unsupported export version: ${data.version}`, "version", ["Invalid export format"]);
  try {
    const settings = Object.values(data.preferences.settings);
    await batchUpdateSettings(userId, settings.map((s) => ({ key: s.key, value: s.value, category: s.category })));
    Sentry.addBreadcrumb({ category: "settings", message: `Settings imported: ${settings.length}`, level: "info", data: { userId } });
    return { imported: settings.length, errors };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Import failed";
    errors.push(msg);
    Sentry.captureException(error, { tags: { operation: "importSettings" }, extra: { userId } });
    return { imported: 0, errors };
  }
}

const SYNC_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  retryableErrors: ["network_error", "timeout", "server_error"],
};

export { SettingsValidationError };
export { syncSettings };
export {
  getNotificationSettings, updateNotificationSettings,
  getCoachSettings, updateCoachSettings,
  getAppearanceSettings, updateAppearanceSettings,
  getPrivacySettings, updatePrivacySettings,
} from "./settings-domain";
