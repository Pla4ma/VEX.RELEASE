/**
 * Settings Feature
 * User preferences, notifications, appearance, and privacy controls
 */

// Types
export type {
  Setting,
  SettingValue,
  SettingCategory,
  UserPreferences,
  NotificationSettings,
  NotificationChannel,
  NotificationPriority,
  CoachSettings,
  CoachPersonality,
  CoachFrequency,
  AppearanceSettings,
  ThemeMode,
  PrivacySettings,
  DataControlSettings,
  DataRetentionPolicy,
  ExportFormat,
  SyncState,
  SyncConflict,
  SettingsExport,
  SettingValidationResult,
  SettingsChangeEvent,
} from "./types";

// Schemas
export {
  SettingCategorySchema,
  NotificationChannelSchema,
  NotificationPrioritySchema,
  CoachPersonalitySchema,
  CoachFrequencySchema,
  ThemeModeSchema,
  DataRetentionPolicySchema,
  ExportFormatSchema,
  SyncStatusSchema,
  SettingSchema,
  UserPreferencesSchema,
  NotificationSettingsSchema,
  CoachSettingsSchema,
  AppearanceSettingsSchema,
  PrivacySettingsSchema,
  DataControlSettingsSchema,
  SyncStateSchema,
  SettingsExportSchema,
  UpdateSettingInputSchema,
  ResetSettingsInputSchema,
  ImportSettingsInputSchema,
  createDefaultSettings,
  createDefaultNotificationSettings,
  createDefaultCoachSettings,
  createDefaultAppearanceSettings,
  createDefaultPrivacySettings,
  createDefaultDataControlSettings,
} from "./schemas";

// Service
export {
  getSetting,
  getAllSettings,
  updateSetting,
  batchUpdateSettings,
  deleteSetting,
  getUserPreferences,
  syncSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getCoachSettings,
  updateCoachSettings,
  getAppearanceSettings,
  updateAppearanceSettings,
  getPrivacySettings,
  updatePrivacySettings,
  exportSettings,
  importSettings,
  resetSettings,
  SettingsValidationError,
} from "./service";

// Repository – CRUD
export {
  fetchSetting,
  fetchAllSettings,
  fetchSettingsByCategory,
  upsertSetting,
  batchUpsertSettings,
  deleteSetting as deleteSettingFromRepo,
  resetSettings as resetSettingsInRepo,
} from "./repository";

// Repository – Sync
export {
  fetchSyncState,
  updateSyncState,
  fetchPendingChanges,
  pushChanges,
  fetchRemoteChanges,
  applyRemoteChanges,
  resolveConflict,
} from "./repository-sync";

// Hooks
export {
  useSetting,
  useAllSettings,
  useUserPreferences,
  useUpdateSetting,
  useBatchUpdateSettings,
  useDeleteSetting,
  useSyncSettings,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useCoachSettings,
  useUpdateCoachSettings,
  useAppearanceSettings,
  useUpdateAppearanceSettings,
  usePrivacySettings,
  useUpdatePrivacySettings,
  useExportSettings,
  useImportSettings,
  useResetSettings,
  useSettingsUIState,
  settingsKeys,
} from "./hooks";

// Events
export {
  initializeSettingsEventHandlers,
  emitSettingChange,
  emitSettingsReset,
  trackSettingsAnalytics,
} from "./events";

// Validation
export {
  validateSettingValue,
  validateSettingsExport,
  batchValidateSettings,
  formatValidationErrors,
} from "./validation";
export type { ValidationResult, ValidationError } from "./validation";

// Components
export { SettingsScreen } from "./components";
