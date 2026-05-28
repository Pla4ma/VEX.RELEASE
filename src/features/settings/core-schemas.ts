import { z } from "zod";
import {
  SettingCategorySchema,
  SettingValueSchema,
  ThemeModeSchema,
  DataRetentionPolicySchema,
  ExportFormatSchema,
  SyncStatusSchema,
} from "./enums";

/** DB row shape from `user_settings` table */
export const SettingRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  key: z.string(),
  value: z.unknown(),
  category: SettingCategorySchema,
  is_default: z.boolean(),
  last_modified: z.number(),
  last_synced: z.number().optional(),
  device_id: z.string().optional(),
});
export type SettingRow = z.infer<typeof SettingRowSchema>;

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
    profileVisibility: z.enum(["public", "friends", "private"]),
    showOnlineStatus: z.boolean(),
    showActivityStatus: z.boolean(),
    allowDataAnalysis: z.boolean(),
    allowPersonalization: z.boolean(),
    thirdPartySharing: z.boolean(),
    analyticsOptOut: z.boolean(),
  })
  .strict();

export const DataControlSettingsSchema = z
  .object({
    userId: z.string().uuid(),
    retentionPolicy: DataRetentionPolicySchema,
    autoExport: z
      .object({
        enabled: z.boolean(),
        frequency: z.enum(["weekly", "monthly", "never"]),
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
          resolution: z.enum(["local", "remote", "merge"]).optional(),
        })
        .strict(),
    ),
    errorMessage: z.string().optional(),
  })
  .strict();

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type AppearanceSettings = z.infer<typeof AppearanceSettingsSchema>;
export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;
export type DataControlSettings = z.infer<typeof DataControlSettingsSchema>;
