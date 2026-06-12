import { z } from 'zod';
import { lightColors } from '@/theme/tokens/colors';

import { UserPreferencesSchema, AppearanceSettingsSchema } from './core-schemas';
import type { AppearanceSettings } from './core-schemas';
import { NotificationSettingsSchema } from './notification-schemas';
import { CoachSettingsSchema } from './coach-schemas';
import { PrivacySettingsSchema, DataControlSettingsSchema } from './core-schemas';

export function createDefaultSettings(
  userId: string,
): z.infer<typeof UserPreferencesSchema> {
  const now = Date.now();
  return UserPreferencesSchema.parse({
    userId,
    version: 1,
    settings: {
      'general.language': {
        id: crypto.randomUUID(),
        userId,
        key: 'general.language',
        value: 'en',
        category: 'general',
        isDefault: true,
        lastModified: now,
      },
      'general.timezone': {
        id: crypto.randomUUID(),
        userId,
        key: 'general.timezone',
        value: Intl.DateTimeFormat().resolvedOptions().timeZone,
        category: 'general',
        isDefault: true,
        lastModified: now,
      },
    },
    createdAt: now,
    updatedAt: now,
  });
}

export function createDefaultNotificationSettings(
  userId: string,
): z.infer<typeof NotificationSettingsSchema> {
  return NotificationSettingsSchema.parse({
    userId,
    channels: {
      push: {
        enabled: true,
        deviceTokens: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      email: { enabled: true, email: '', digestFrequency: 'daily' },
      inApp: { enabled: true, soundEnabled: true, vibrationEnabled: true },
    },
    preferences: {
      critical: { enabled: true, channels: ['push', 'email', 'in_app'] },
      high: { enabled: true, channels: ['push', 'in_app'] },
      normal: { enabled: true, channels: ['in_app'] },
      low: { enabled: false, channels: [] },
    },
    customRules: [],
  });
}

export function createDefaultCoachSettings(
  userId: string,
): z.infer<typeof CoachSettingsSchema> {
  return CoachSettingsSchema.parse({
    userId,
    enabled: true,
    personality: 'supportive',
    frequency: 'moderate',
    messageTypes: {
      streakReminders: true,
      sessionTips: true,
      milestoneCelebrations: true,
      encouragement: true,
      challenges: false,
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    customTriggers: [],
  });
}

export function createDefaultAppearanceSettings(
  userId: string,
): AppearanceSettings {
  return AppearanceSettingsSchema.parse({
    userId,
    theme: 'system',
    accentColor: lightColors.semantic.primary,
    fontScale: 1,
    useSystemFont: true,
    reduceMotion: false,
    highContrast: false,
    compactMode: false,
  });
}

export function createDefaultPrivacySettings(
  userId: string,
): z.infer<typeof PrivacySettingsSchema> {
  return PrivacySettingsSchema.parse({
    userId,
    profileVisibility: 'friends',
    showOnlineStatus: true,
    showActivityStatus: true,
    allowDataAnalysis: true,
    allowPersonalization: true,
    thirdPartySharing: false,
    analyticsOptOut: false,
  });
}

export function createDefaultDataControlSettings(
  userId: string,
): z.infer<typeof DataControlSettingsSchema> {
  return DataControlSettingsSchema.parse({
    userId,
    retentionPolicy: 'standard',
    autoExport: { enabled: false, frequency: 'never', format: 'json' },
    backupEnabled: true,
  });
}
