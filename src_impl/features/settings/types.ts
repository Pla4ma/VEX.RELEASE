/**
 * Settings Feature Types
 * Domain types for user preferences, notification settings, and data controls
 */

import type { z } from 'zod';
import type { SettingCategorySchema, NotificationChannelSchema, NotificationPrioritySchema, CoachPersonalitySchema, CoachFrequencySchema, ThemeModeSchema, DataRetentionPolicySchema, ExportFormatSchema, SyncStatusSchema } from './schemas';

// Enums from schemas
export type SettingCategory = z.infer<typeof SettingCategorySchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type CoachPersonality = z.infer<typeof CoachPersonalitySchema>;
export type CoachFrequency = z.infer<typeof CoachFrequencySchema>;
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type DataRetentionPolicy = z.infer<typeof DataRetentionPolicySchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

// Base setting value type
export type SettingValue = string | number | boolean | string[] | Record<string, unknown> | null;

// Individual setting
// User preferences container
// Notification settings
// Notification rule
// Coach settings
// Coach trigger
// Appearance settings
// Privacy settings
// Data control settings
// Sync state
// Sync conflict
// Settings export data
// Settings UI state
// Validation result
// Settings change event
export * from "./types.types";
