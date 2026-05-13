/**
 * Settings Hooks
 * TanStack Query hooks for settings data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as service from '../service';
import { type Setting, type UserPreferences, type NotificationSettings, type CoachSettings, type AppearanceSettings, type PrivacySettings, type SyncState, type SettingCategory, type SettingValue, type SettingsExport } from '../types';

// Query keys
// Hook: Get a single setting
// Hook: Get all settings
// Hook: Get user preferences
// Hook: Update a setting
// Hook: Batch update settings
// Hook: Delete a setting
// Hook: Sync settings
// Hook: Get notification settings
// Hook: Update notification settings
// Hook: Get coach settings
// Hook: Update coach settings
// Hook: Get appearance settings
// Hook: Update appearance settings
// Hook: Get privacy settings
// Hook: Update privacy settings
// Hook: Export settings
// Hook: Import settings
// Hook: Reset settings
// Hook: Combined settings UI state
export * from "./index.part1";
export * from "./index.part2";
