/**
 * Settings Hooks
 * TanStack Query hooks for settings data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import * as service from "./service";
import { type Setting, type UserPreferences, type NotificationSettings, type CoachSettings, type AppearanceSettings, type PrivacySettings, type SyncState, type SettingCategory, type SettingValue, type SettingsExport } from "./types";

// Query keys
export const settingsKeys = {
  all: ["settings"] as const,
  user: (userId: string) => [...settingsKeys.all, userId] as const,
  setting: (userId: string, key: string) => [...settingsKeys.user(userId), "setting", key] as const,
  preferences: (userId: string) => [...settingsKeys.user(userId), "preferences"] as const,
  notifications: (userId: string) => [...settingsKeys.user(userId), "notifications"] as const,
  coach: (userId: string) => [...settingsKeys.user(userId), "coach"] as const,
  appearance: (userId: string) => [...settingsKeys.user(userId), "appearance"] as const,
  privacy: (userId: string) => [...settingsKeys.user(userId), "privacy"] as const,
  sync: (userId: string) => [...settingsKeys.user(userId), "sync"] as const,
};

// Hook: Get a single setting
export function useSetting(userId: string, key: string, options?: Omit<UseQueryOptions<Setting | null>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.setting(userId, key),
    queryFn: () => service.getSetting(userId, key),
    enabled: !!userId && !!key,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook: Get all settings
export function useAllSettings(userId: string, options?: Omit<UseQueryOptions<Setting[]>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.user(userId),
    queryFn: () => service.getAllSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook: Get user preferences
export function useUserPreferences(userId: string, options?: Omit<UseQueryOptions<UserPreferences>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.preferences(userId),
    queryFn: () => service.getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook: Update a setting
export function useUpdateSetting(userId: string, options?: Omit<UseMutationOptions<Setting, Error, { key: string; value: SettingValue; category: SettingCategory }>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value, category }) => service.updateSetting(userId, key, value, category),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: settingsKeys.setting(userId, variables.key),
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });

      // Update cache optimistically
      queryClient.setQueryData(settingsKeys.setting(userId, variables.key), data);
    },
    ...options,
  });
}

// Hook: Batch update settings
export function useBatchUpdateSettings(userId: string, options?: Omit<UseMutationOptions<Setting[], Error, Array<{ key: string; value: SettingValue; category: SettingCategory }>>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates) => service.batchUpdateSettings(userId, updates),
    onSuccess: () => {
      // Invalidate all settings queries
      queryClient.invalidateQueries({
        queryKey: settingsKeys.user(userId),
      });
    },
    ...options,
  });
}

// Hook: Delete a setting
export function useDeleteSetting(userId: string, options?: Omit<UseMutationOptions<boolean, Error, string>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key) => service.deleteSetting(userId, key),
    onSuccess: (_, key) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.setting(userId, key),
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

// Hook: Sync settings
export function useSyncSettings(userId: string, options?: Omit<UseMutationOptions<SyncState, Error, { force?: boolean; direction?: "up" | "down" | "both" }>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) =>
      service.syncSettings(userId, {
        force: params.force,
        direction: params.direction,
      }),
    onSuccess: () => {
      // Invalidate all settings after sync
      queryClient.invalidateQueries({
        queryKey: settingsKeys.user(userId),
      });
    },
    ...options,
  });
}

// Hook: Get notification settings
export function useNotificationSettings(userId: string, options?: Omit<UseQueryOptions<NotificationSettings>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.notifications(userId),
    queryFn: () => service.getNotificationSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook: Update notification settings
export function useUpdateNotificationSettings(userId: string, options?: Omit<UseMutationOptions<NotificationSettings, Error, Partial<NotificationSettings>>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => service.updateNotificationSettings(userId, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.notifications(userId), data);
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

// Hook: Get coach settings
export function useCoachSettings(userId: string, options?: Omit<UseQueryOptions<CoachSettings>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.coach(userId),
    queryFn: () => service.getCoachSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook: Update coach settings
export function useUpdateCoachSettings(userId: string, options?: Omit<UseMutationOptions<CoachSettings, Error, Partial<CoachSettings>>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => service.updateCoachSettings(userId, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.coach(userId), data);
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

// Hook: Get appearance settings
export function useAppearanceSettings(userId: string, options?: Omit<UseQueryOptions<AppearanceSettings>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.appearance(userId),
    queryFn: () => service.getAppearanceSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook: Update appearance settings
export function useUpdateAppearanceSettings(userId: string, options?: Omit<UseMutationOptions<AppearanceSettings, Error, Partial<AppearanceSettings>>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => service.updateAppearanceSettings(userId, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.appearance(userId), data);
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

// Hook: Get privacy settings
export function usePrivacySettings(userId: string, options?: Omit<UseQueryOptions<import("./types").PrivacySettings>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: settingsKeys.privacy(userId),
    queryFn: () => service.getPrivacySettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook: Update privacy settings
export function useUpdatePrivacySettings(userId: string, options?: Omit<UseMutationOptions<import("./types").PrivacySettings, Error, Partial<import("./types").PrivacySettings>>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => service.updatePrivacySettings(userId, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.privacy(userId), data);
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

// Hook: Export settings
export function useExportSettings(userId: string, options?: Omit<UseMutationOptions<SettingsExport, Error, void>, "mutationFn">) {
  return useMutation({
    mutationFn: () => service.exportSettings(userId),
    ...options,
  });
}

// Hook: Import settings
export function useImportSettings(userId: string, options?: Omit<UseMutationOptions<{ imported: number; errors: string[] }, Error, SettingsExport>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exportData) => service.importSettings(userId, exportData),
    onSuccess: () => {
      // Invalidate all settings after import
      queryClient.invalidateQueries({
        queryKey: settingsKeys.user(userId),
      });
    },
    ...options,
  });
}

// Hook: Reset settings
export function useResetSettings(userId: string, options?: Omit<UseMutationOptions<void, Error, { category?: SettingCategory }>, "mutationFn">) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => service.resetSettings(userId, params.category),
    onSuccess: () => {
      // Clear all settings queries
      queryClient.invalidateQueries({
        queryKey: settingsKeys.user(userId),
      });
    },
    ...options,
  });
}

// Hook: Combined settings UI state
export function useSettingsUIState(userId: string) {
  const preferencesQuery = useUserPreferences(userId);
  const notificationsQuery = useNotificationSettings(userId);
  const coachQuery = useCoachSettings(userId);
  const appearanceQuery = useAppearanceSettings(userId);
  const privacyQuery = usePrivacySettings(userId);

  const isLoading = preferencesQuery.isLoading || notificationsQuery.isLoading || coachQuery.isLoading || appearanceQuery.isLoading || privacyQuery.isLoading;

  const isError = preferencesQuery.isError || notificationsQuery.isError || coachQuery.isError || appearanceQuery.isError || privacyQuery.isError;

  const error = preferencesQuery.error || notificationsQuery.error || coachQuery.error || appearanceQuery.error || privacyQuery.error;

  return {
    isLoading,
    isError,
    error,
    preferences: preferencesQuery.data,
    notifications: notificationsQuery.data,
    coach: coachQuery.data,
    appearance: appearanceQuery.data,
    privacy: privacyQuery.data,
    refetch: () => {
      preferencesQuery.refetch();
      notificationsQuery.refetch();
      coachQuery.refetch();
      appearanceQuery.refetch();
      privacyQuery.refetch();
    },
  };
}
