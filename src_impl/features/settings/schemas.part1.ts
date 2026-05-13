import { z } from "zod";


export const SettingCategorySchema = z.enum(['general', 'notifications', 'coach', 'appearance', 'privacy', 'data', 'advanced']);

export const NotificationChannelSchema = z.enum(['push', 'email', 'in_app', 'sms']);

export const NotificationPrioritySchema = z.enum(['critical', 'high', 'normal', 'low']);

export const CoachPersonalitySchema = z.enum(['supportive', 'tough', 'neutral', 'funny']);

export const CoachFrequencySchema = z.enum(['minimal', 'moderate', 'frequent', 'constant']);

export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);

export const DataRetentionPolicySchema = z.enum(['minimal', 'standard', 'comprehensive', 'forever']);

export const ExportFormatSchema = z.enum(['json', 'csv', 'pdf']);

export const SyncStatusSchema = z.enum(['idle', 'syncing', 'error', 'conflict']);

export const SettingValueSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.record(z.unknown()), z.null()]);

export const SettingSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    key: z.string().min(1).max(100),
    value: SettingValueSchema,
    category: SettingCategorySchema,
    isDefault: z.boolean(),
    lastModified: z.number().int().positive(),
    lastSynced: z.number().int().positive().optional(),
    deviceId: z.string().optional(),
  })
  .strict();

export const UserPreferencesSchema = z
  .object({
    userId: z.string().uuid(),
    version: z.number().int().min(1),
    settings: z.record(SettingSchema),
    createdAt: z.number().int().positive(),
    updatedAt: z.number().int().positive(),
  })
  .strict();

export const NotificationSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    channels: z
      .object({
        push: z
          .object({
            enabled: z.boolean(),
            deviceTokens: z.array(z.string()),
            quietHoursStart: z.number().int().min(0).max(23).optional(),
            quietHoursEnd: z.number().int().min(0).max(23).optional(),
            timezone: z.string(),
          })
          .strict(),
        email: z
          .object({
            enabled: z.boolean(),
            email: z.string().email(),
            digestFrequency: z.enum(['immediate', 'daily', 'weekly', 'never']),
          })
          .strict(),
        inApp: z
          .object({
            enabled: z.boolean(),
            soundEnabled: z.boolean(),
            vibrationEnabled: z.boolean(),
          })
          .strict(),
      })
      .strict(),
    preferences: z.record(
      z
        .object({
          enabled: z.boolean(),
          channels: z.array(NotificationChannelSchema),
        })
        .strict(),
    ),
    customRules: z.array(
      z
        .object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          name: z.string().min(1).max(100),
          condition: z
            .object({
              type: z.enum(['time', 'location', 'activity', 'streak']),
              params: z.record(z.unknown()),
            })
            .strict(),
          action: z
            .object({
              enabled: z.boolean(),
              channels: z.array(NotificationChannelSchema),
              message: z.string().optional(),
            })
            .strict(),
          priority: NotificationPrioritySchema,
          isActive: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export const CoachSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    enabled: z.boolean(),
    personality: CoachPersonalitySchema,
    frequency: CoachFrequencySchema,
    messageTypes: z
      .object({
        streakReminders: z.boolean(),
        sessionTips: z.boolean(),
        milestoneCelebrations: z.boolean(),
        encouragement: z.boolean(),
        challenges: z.boolean(),
      })
      .strict(),
    quietHours: z
      .object({
        enabled: z.boolean(),
        start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        timezone: z.string(),
      })
      .strict(),
    customTriggers: z.array(
      z
        .object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          eventType: z.string(),
          condition: z.enum(['before', 'after', 'during']),
          threshold: z.number().optional(),
          messageTemplate: z.string(),
          isActive: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

export const AppearanceSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    theme: ThemeModeSchema,
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    fontScale: z.number().min(0.75).max(1.5),
    useSystemFont: z.boolean(),
    reduceMotion: z.boolean(),
    highContrast: z.boolean(),
    compactMode: z.boolean(),
  })
  .strict();

export const PrivacySettingsSchema = z
  .object({
    userId: z.string().uuid(),
    profileVisibility: z.enum(['public', 'friends', 'private']),
    showOnlineStatus: z.boolean(),
    showActivityStatus: z.boolean(),
    allowDataAnalysis: z.boolean(),
    allowPersonalization: z.boolean(),
    thirdPartySharing: z.boolean(),
    analyticsOptOut: z.boolean(),
  })
  .strict();