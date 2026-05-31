import { z } from 'zod';
import { SettingCategorySchema, SettingValueSchema } from './enums';
import { UserPreferencesSchema } from './core-schemas';
import { NotificationSettingsSchema } from './notification-schemas';
import { CoachSettingsSchema } from './coach-schemas';
import {
  AppearanceSettingsSchema,
  PrivacySettingsSchema,
  DataControlSettingsSchema,
} from './core-schemas';

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
    mergeStrategy: z
      .enum(['merge', 'replace', 'local_wins', 'remote_wins'])
      .default('merge'),
  })
  .strict();
