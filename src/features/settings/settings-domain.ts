import type { SettingValue, SettingCategory, NotificationSettings, CoachSettings, AppearanceSettings, PrivacySettings, Setting, UserPreferences } from "./types";
import { batchUpdateSettings, getAllSettings, getUserPreferences } from "./settings-core";

export async function getNotificationSettings(userId: string): Promise<NotificationSettings> {
  const settings = await getAllSettings(userId);
  return (await import("./settings-builders")).buildNotificationSettings(userId, settings);
}

export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  const updates: Array<{ key: string; value: SettingValue; category: SettingCategory }> = [];
  if (settings.channels?.push) {
    updates.push(
      { key: "notifications.push.enabled", value: settings.channels.push.enabled, category: "notifications" },
      { key: "notifications.push.quietHoursStart", value: settings.channels.push.quietHoursStart ?? null, category: "notifications" },
      { key: "notifications.push.quietHoursEnd", value: settings.channels.push.quietHoursEnd ?? null, category: "notifications" },
      { key: "notifications.push.timezone", value: settings.channels.push.timezone, category: "notifications" },
    );
  }
  if (settings.channels?.email) {
    updates.push(
      { key: "notifications.email.enabled", value: settings.channels.email.enabled, category: "notifications" },
      { key: "notifications.email.digestFrequency", value: settings.channels.email.digestFrequency, category: "notifications" },
    );
  }
  await batchUpdateSettings(userId, updates);
  return getNotificationSettings(userId);
}

export async function getCoachSettings(userId: string): Promise<CoachSettings> {
  const settings = await getAllSettings(userId);
  return (await import("./settings-builders")).buildCoachSettings(userId, settings);
}

export async function updateCoachSettings(
  userId: string,
  settings: Partial<CoachSettings>,
): Promise<CoachSettings> {
  const updates: Array<{ key: string; value: SettingValue; category: SettingCategory }> = [];
  if (settings.enabled !== undefined) updates.push({ key: "coach.enabled", value: settings.enabled, category: "coach" });
  if (settings.personality) updates.push({ key: "coach.personality", value: settings.personality, category: "coach" });
  if (settings.frequency) updates.push({ key: "coach.frequency", value: settings.frequency, category: "coach" });
  await batchUpdateSettings(userId, updates);
  return getCoachSettings(userId);
}

export async function getAppearanceSettings(userId: string): Promise<AppearanceSettings> {
  const settings = await getAllSettings(userId);
  return (await import("./settings-builders")).buildAppearanceSettings(userId, settings);
}

export async function updateAppearanceSettings(
  userId: string,
  settings: Partial<AppearanceSettings>,
): Promise<AppearanceSettings> {
  const updates: Array<{ key: string; value: SettingValue; category: SettingCategory }> = [];
  if (settings.theme) updates.push({ key: "appearance.theme", value: settings.theme, category: "appearance" });
  if (settings.accentColor) updates.push({ key: "appearance.accentColor", value: settings.accentColor, category: "appearance" });
  if (settings.fontScale !== undefined) updates.push({ key: "appearance.fontScale", value: settings.fontScale, category: "appearance" });
  await batchUpdateSettings(userId, updates);
  return getAppearanceSettings(userId);
}

export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  const settings = await getAllSettings(userId);
  return (await import("./settings-builders")).buildPrivacySettings(userId, settings);
}

export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>,
): Promise<PrivacySettings> {
  const updates: Array<{ key: string; value: SettingValue; category: SettingCategory }> = [];
  if (settings.profileVisibility) updates.push({ key: "privacy.profileVisibility", value: settings.profileVisibility, category: "privacy" });
  if (settings.showOnlineStatus !== undefined) updates.push({ key: "privacy.showOnlineStatus", value: settings.showOnlineStatus, category: "privacy" });
  if (settings.analyticsOptOut !== undefined) updates.push({ key: "privacy.analyticsOptOut", value: settings.analyticsOptOut, category: "privacy" });
  await batchUpdateSettings(userId, updates);
  return getPrivacySettings(userId);
}
