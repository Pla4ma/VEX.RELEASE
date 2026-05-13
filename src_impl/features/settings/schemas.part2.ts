import { z } from "zod";


export const DataControlSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    retentionPolicy: DataRetentionPolicySchema,
    autoExport: z
      .object({
        enabled: z.boolean(),
        frequency: z.enum(['weekly', 'monthly', 'never']),
        format: ExportFormatSchema,
        lastExport: z.number().int().positive().optional(),
      })
      .strict(),
    backupEnabled: z.boolean(),
    lastBackup: z.number().int().positive().optional(),
  })
  .strict();

export const SyncStateSchema = z
  .object({
    userId: z.string().uuid(),
    status: SyncStatusSchema,
    lastSyncAttempt: z.number().int().positive(),
    lastSuccessfulSync: z.number().int().positive().optional(),
    pendingChanges: z.number().int().min(0),
    conflicts: z.array(
      z
        .object({
          id: z.string().uuid(),
          settingKey: z.string(),
          localValue: SettingValueSchema,
          remoteValue: SettingValueSchema,
          localTimestamp: z.number().int().positive(),
          remoteTimestamp: z.number().int().positive(),
          resolution: z.enum(['local', 'remote', 'merge']).optional(),
        })
        .strict(),
    ),
    errorMessage: z.string().optional(),
  })
  .strict();

export const SettingsExportSchema = z
  .object({
    version: z.number().int().min(1),
    exportedAt: z.number().int().positive(),
    userId: z.string().uuid(),
    preferences: UserPreferencesSchema,
    notificationSettings: NotificationSettingsSchema,
    coachSettings: CoachSettingsSchema,
    appearanceSettings: AppearanceSettingsSchema,
    privacySettings: PrivacySettingsSchema,
    dataControlSettings: DataControlSettingsSchema,
  })
  .strict();

export const UpdateSettingInputSchema = z
  .object({
    userId: z.string().uuid(),
    key: z.string().min(1).max(100),
    value: SettingValueSchema,
    category: SettingCategorySchema,
  })
  .strict();

export const ResetSettingsInputSchema = z
  .object({
    userId: z.string().uuid(),
    category: SettingCategorySchema.optional(),
    preserveCustomRules: z.boolean().default(true),
  })
  .strict();

export const ImportSettingsInputSchema = z
  .object({
    userId: z.string().uuid(),
    settingsJson: z.string(),
    mergeStrategy: z.enum(['merge', 'replace', 'local_wins', 'remote_wins']).default('merge'),
  })
  .strict();

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