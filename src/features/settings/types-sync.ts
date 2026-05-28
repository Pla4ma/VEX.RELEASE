import type {
  DataRetentionPolicy,
  ExportFormat,
  SettingCategory,
  SettingValue,
  SyncStatus,
  UserPreferences,
  NotificationSettings,
  CoachSettings,
  AppearanceSettings,
  PrivacySettings,
  DataControlSettings,
} from "./types";

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
