/**
 * Settings Feature Schemas
 * Zod schemas for validation at all boundaries
 */

import { z } from 'zod';

// Enum schemas
export const SettingCategorySchema = z.enum([
  'general',
  'notifications',
  'coach',
  'appearance',
  'privacy',
  'data',
  'advanced',
]);

export const NotificationChannelSchema = z.enum(['push', 'email', 'in_app', 'sms']);
export const NotificationPrioritySchema = z.enum(['critical', 'high', 'normal', 'low']);
export const CoachPersonalitySchema = z.enum(['supportive', 'tough', 'neutral', 'funny']);
export const CoachFrequencySchema = z.enum(['minimal', 'moderate', 'frequent', 'constant']);
export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);
export const DataRetentionPolicySchema = z.enum(['minimal', 'standard', 'comprehensive', 'forever']);
export const ExportFormatSchema = z.enum(['json', 'csv', 'pdf']);
export const SyncStatusSchema = z.enum(['idle', 'syncing', 'error', 'conflict']);

// Export types
export type SettingCategory = z.infer<typeof SettingCategorySchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type CoachPersonality = z.infer<typeof CoachPersonalitySchema>;
export type CoachFrequency = z.infer<typeof CoachFrequencySchema>;
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type DataRetentionPolicy = z.infer<typeof DataRetentionPolicySchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

// Setting value schema
export const SettingValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.record(z.unknown()),
  z.null(),
]);

// Setting schema
export const SettingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: SettingValueSchema,
  category: SettingCategorySchema,
  isDefault: z.boolean(),
  lastModified: z.number().int().positive(),
  lastSynced: z.number().int().positive().optional(),
  deviceId: z.string().optional(),
}).strict();

// User preferences schema
export const UserPreferencesSchema = z.object({
  userId: z.string().uuid(),
  version: z.number().int().min(1),
  settings: z.record(SettingSchema),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
}).strict();

// Notification settings schema
export const NotificationSettingsSchema = z.object({
  userId: z.string().uuid(),
  channels: z.object({
    push: z.object({
      enabled: z.boolean(),
      deviceTokens: z.array(z.string()),
      quietHoursStart: z.number().int().min(0).max(23).optional(),
      quietHoursEnd: z.number().int().min(0).max(23).optional(),
      timezone: z.string(),
    }).strict(),
    email: z.object({
      enabled: z.boolean(),
      email: z.string().email(),
      digestFrequency: z.enum(['immediate', 'daily', 'weekly', 'never']),
    }).strict(),
    inApp: z.object({
      enabled: z.boolean(),
      soundEnabled: z.boolean(),
      vibrationEnabled: z.boolean(),
    }).strict(),
  }).strict(),
  preferences: z.record(
    z.object({
      enabled: z.boolean(),
      channels: z.array(NotificationChannelSchema),
    }).strict()
  ),
  customRules: z.array(z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100),
    condition: z.object({
      type: z.enum(['time', 'location', 'activity', 'streak']),
      params: z.record(z.unknown()),
    }).strict(),
    action: z.object({
      enabled: z.boolean(),
      channels: z.array(NotificationChannelSchema),
      message: z.string().optional(),
    }).strict(),
    priority: NotificationPrioritySchema,
    isActive: z.boolean(),
  }).strict()),
}).strict();

// Coach settings schema
export const CoachSettingsSchema = z.object({
  userId: z.string().uuid(),
  enabled: z.boolean(),
  personality: CoachPersonalitySchema,
  frequency: CoachFrequencySchema,
  messageTypes: z.object({
    streakReminders: z.boolean(),
    sessionTips: z.boolean(),
    milestoneCelebrations: z.boolean(),
    encouragement: z.boolean(),
    challenges: z.boolean(),
  }).strict(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    timezone: z.string(),
  }).strict(),
  customTriggers: z.array(z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    eventType: z.string(),
    condition: z.enum(['before', 'after', 'during']),
    threshold: z.number().optional(),
    messageTemplate: z.string(),
    isActive: z.boolean(),
  }).strict()),
}).strict();

// Appearance settings schema
export const AppearanceSettingsSchema = z.object({
  userId: z.string().uuid(),
  theme: ThemeModeSchema,
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontScale: z.number().min(0.75).max(1.5),
  useSystemFont: z.boolean(),
  reduceMotion: z.boolean(),
  highContrast: z.boolean(),
  compactMode: z.boolean(),
}).strict();

// Privacy settings schema
export const PrivacySettingsSchema = z.object({
  userId: z.string().uuid(),
  profileVisibility: z.enum(['public', 'friends', 'private']),
  showOnlineStatus: z.boolean(),
  showActivityStatus: z.boolean(),
  allowDataAnalysis: z.boolean(),
  allowPersonalization: z.boolean(),
  thirdPartySharing: z.boolean(),
  analyticsOptOut: z.boolean(),
}).strict();

// Data control settings schema
export const DataControlSettingsSchema = z.object({
  userId: z.string().uuid(),
  retentionPolicy: DataRetentionPolicySchema,
  autoExport: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['weekly', 'monthly', 'never']),
    format: ExportFormatSchema,
    lastExport: z.number().int().positive().optional(),
  }).strict(),
  backupEnabled: z.boolean(),
  lastBackup: z.number().int().positive().optional(),
}).strict();

// Sync state schema
export const SyncStateSchema = z.object({
  userId: z.string().uuid(),
  status: SyncStatusSchema,
  lastSyncAttempt: z.number().int().positive(),
  lastSuccessfulSync: z.number().int().positive().optional(),
  pendingChanges: z.number().int().min(0),
  conflicts: z.array(z.object({
    id: z.string().uuid(),
    settingKey: z.string(),
    localValue: SettingValueSchema,
    remoteValue: SettingValueSchema,
    localTimestamp: z.number().int().positive(),
    remoteTimestamp: z.number().int().positive(),
    resolution: z.enum(['local', 'remote', 'merge']).optional(),
  }).strict()),
  errorMessage: z.string().optional(),
}).strict();

// Settings export schema
export const SettingsExportSchema = z.object({
  version: z.number().int().min(1),
  exportedAt: z.number().int().positive(),
  userId: z.string().uuid(),
  preferences: UserPreferencesSchema,
  notificationSettings: NotificationSettingsSchema,
  coachSettings: CoachSettingsSchema,
  appearanceSettings: AppearanceSettingsSchema,
  privacySettings: PrivacySettingsSchema,
  dataControlSettings: DataControlSettingsSchema,
}).strict();

// Input schemas
export const UpdateSettingInputSchema = z.object({
  userId: z.string().uuid(),
  key: z.string().min(1).max(100),
  value: SettingValueSchema,
  category: SettingCategorySchema,
}).strict();

export const ResetSettingsInputSchema = z.object({
  userId: z.string().uuid(),
  category: SettingCategorySchema.optional(),
  preserveCustomRules: z.boolean().default(true),
}).strict();

export const ImportSettingsInputSchema = z.object({
  userId: z.string().uuid(),
  settingsJson: z.string(),
  mergeStrategy: z.enum(['merge', 'replace', 'local_wins', 'remote_wins']).default('merge'),
}).strict();

// Return type imports (using z.infer to avoid circular deps)
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type CoachSettings = z.infer<typeof CoachSettingsSchema>;
export type AppearanceSettings = z.infer<typeof AppearanceSettingsSchema>;
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
export type DataControlSettings = z.infer<typeof DataControlSettingsSchema>;

// Default settings factory
export function createDefaultSettings(userId: string): z.infer<typeof UserPreferencesSchema> {
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

// Default notification settings
export function createDefaultNotificationSettings(userId: string): z.infer<typeof NotificationSettingsSchema> {
  return NotificationSettingsSchema.parse({
    userId,
    channels: {
      push: {
        enabled: true,
        deviceTokens: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      email: {
        enabled: true,
        email: '',
        digestFrequency: 'daily',
      },
      inApp: {
        enabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
      },
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

// Default coach settings
export function createDefaultCoachSettings(userId: string): z.infer<typeof CoachSettingsSchema> {
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

// Default appearance settings
export function createDefaultAppearanceSettings(userId: string): AppearanceSettings {
  return AppearanceSettingsSchema.parse({
    userId,
    theme: 'system',
    accentColor: '#6366f1',
    fontScale: 1,
    useSystemFont: true,
    reduceMotion: false,
    highContrast: false,
    compactMode: false,
  });
}

// Default privacy settings
export function createDefaultPrivacySettings(userId: string): z.infer<typeof PrivacySettingsSchema> {
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

// Default data control settings
export function createDefaultDataControlSettings(userId: string): z.infer<typeof DataControlSettingsSchema> {
  return DataControlSettingsSchema.parse({
    userId,
    retentionPolicy: 'standard',
    autoExport: {
      enabled: false,
      frequency: 'never',
      format: 'json',
    },
    backupEnabled: true,
  });
}
