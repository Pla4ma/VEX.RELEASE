import type { z } from "zod";
import type {
  SettingCategorySchema,
  NotificationChannelSchema,
  NotificationPrioritySchema,
  CoachPersonalitySchema,
  CoachFrequencySchema,
  ThemeModeSchema,
  DataRetentionPolicySchema,
  ExportFormatSchema,
  SyncStatusSchema,
} from "./schemas";
export type SettingCategory = z.infer<typeof SettingCategorySchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type CoachPersonality = z.infer<typeof CoachPersonalitySchema>;
export type CoachFrequency = z.infer<typeof CoachFrequencySchema>;
export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type DataRetentionPolicy = z.infer<typeof DataRetentionPolicySchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
export type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>
  | null;
export interface Setting {
  id: string;
  userId: string;
  key: string;
  value: SettingValue;
  category: SettingCategory;
  isDefault: boolean;
  lastModified: number;
  lastSynced?: number;
  deviceId?: string;
}
export interface UserPreferences {
  userId: string;
  version: number;
  settings: Record<string, Setting>;
  createdAt: number;
  updatedAt: number;
}
export interface NotificationSettings {
  userId: string;
  channels: {
    push: {
      enabled: boolean;
      deviceTokens: string[];
      quietHoursStart?: number;
      quietHoursEnd?: number;
      timezone: string;
    };
    email: {
      enabled: boolean;
      email: string;
      digestFrequency: "immediate" | "daily" | "weekly" | "never";
    };
    inApp: {
      enabled: boolean;
      soundEnabled: boolean;
      vibrationEnabled: boolean;
    };
  };
  preferences: {
    [key in NotificationPriority]: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
  customRules: NotificationRule[];
}
export interface NotificationRule {
  id: string;
  userId: string;
  name: string;
  condition: {
    type: "time" | "location" | "activity" | "streak";
    params: Record<string, unknown>;
  };
  action: {
    enabled: boolean;
    channels: NotificationChannel[];
    message?: string;
  };
  priority: NotificationPriority;
  isActive: boolean;
}
export interface CoachSettings {
  userId: string;
  enabled: boolean;
  personality: CoachPersonality;
  frequency: CoachFrequency;
  messageTypes: {
    streakReminders: boolean;
    sessionTips: boolean;
    milestoneCelebrations: boolean;
    encouragement: boolean;
    challenges: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  customTriggers: CoachTrigger[];
}
export interface CoachTrigger {
  id: string;
  userId: string;
  eventType: string;
  condition: "before" | "after" | "during";
  threshold?: number;
  messageTemplate: string;
  isActive: boolean;
}
export interface AppearanceSettings {
  userId: string;
  theme: ThemeMode;
  accentColor: string;
  fontScale: number;
  useSystemFont: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  compactMode: boolean;
}
export interface PrivacySettings {
  userId: string;
  profileVisibility: "public" | "friends" | "private";
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
  allowDataAnalysis: boolean;
  allowPersonalization: boolean;
  thirdPartySharing: boolean;
  analyticsOptOut: boolean;
}
export interface DataControlSettings {
  userId: string;
  retentionPolicy: DataRetentionPolicy;
  autoExport: {
    enabled: boolean;
    frequency: "weekly" | "monthly" | "never";
    format: ExportFormat;
    lastExport?: number;
  };
  backupEnabled: boolean;
  lastBackup?: number;
}
export interface SyncState {
  userId: string;
  status: SyncStatus;
  lastSyncAttempt: number;
  lastSuccessfulSync?: number;
  pendingChanges: number;
  conflicts: SyncConflict[];
  errorMessage?: string;
}
export interface SyncConflict {
  id: string;
  settingKey: string;
  localValue: SettingValue;
  remoteValue: SettingValue;
  localTimestamp: number;
  remoteTimestamp: number;
  resolution?: "local" | "remote" | "merge";
}
export interface SettingsExport {
  version: number;
  exportedAt: number;
  userId: string;
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  coachSettings: CoachSettings;
  appearanceSettings: AppearanceSettings;
  privacySettings: PrivacySettings;
  dataControlSettings: DataControlSettings;
}
export interface SettingsUIState {
  isLoading: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  error: string | null;
  unsavedChanges: string[];
  activeCategory: SettingCategory;
  showResetConfirmation: boolean;
  showDangerousActionConfirmation: boolean;
  pendingAction: string | null;
}
export interface SettingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
export interface SettingsChangeEvent {
  userId: string;
  key: string;
  oldValue: SettingValue;
  newValue: SettingValue;
  category: SettingCategory;
  timestamp: number;
}
