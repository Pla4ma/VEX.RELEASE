import { z } from 'zod';

export const SettingCategorySchema = z.enum([
  'general',
  'notifications',
  'coach',
  'appearance',
  'privacy',
  'data',
  'advanced',
]);
export const NotificationChannelSchema = z.enum([
  'push',
  'email',
  'in_app',
  'sms',
]);
export const NotificationPrioritySchema = z.enum([
  'critical',
  'high',
  'normal',
  'low',
]);
export const CoachPersonalitySchema = z.enum([
  'supportive',
  'tough',
  'neutral',
  'funny',
]);
export const CoachFrequencySchema = z.enum([
  'minimal',
  'moderate',
  'frequent',
  'constant',
]);
export const ThemeModeSchema = z.enum(['light', 'dark', 'system']);
export const DataRetentionPolicySchema = z.enum([
  'minimal',
  'standard',
  'comprehensive',
  'forever',
]);
export const ExportFormatSchema = z.enum(['json', 'csv', 'pdf']);
export const SyncStatusSchema = z.enum([
  'idle',
  'syncing',
  'error',
  'conflict',
]);

export type SettingCategory = z.infer<typeof SettingCategorySchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type CoachPersonality = z.infer<typeof CoachPersonalitySchema>;
export type CoachFrequency = z.infer<typeof CoachFrequencySchema>;
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type DataRetentionPolicy = z.infer<typeof DataRetentionPolicySchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const SettingValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.record(z.string(), z.unknown()),
  z.null(),
]);
