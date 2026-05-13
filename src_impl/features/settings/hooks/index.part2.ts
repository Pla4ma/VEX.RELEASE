import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import * as service from "../service";
import { type Setting, type UserPreferences, type NotificationSettings, type CoachSettings, type AppearanceSettings, type PrivacySettings, type SyncState, type SettingCategory, type SettingValue, type SettingsExport } from "../types";


export function useAppearanceSettings(userId: string, options?: Omit<UseQueryOptions<AppearanceSettings>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.appearance(userId),
    queryFn: () => service.getAppearanceSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateAppearanceSettings(userId: string, options?: Omit<UseMutationOptions<AppearanceSettings, Error, Partial<AppearanceSettings>>, 'mutationFn'>) {
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

export function usePrivacySettings(userId: string, options?: Omit<UseQueryOptions<PrivacySettings>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.privacy(userId),
    queryFn: () => service.getPrivacySettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdatePrivacySettings(userId: string, options?: Omit<UseMutationOptions<PrivacySettings, Error, Partial<PrivacySettings>>, 'mutationFn'>) {
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

export function useExportSettings(userId: string, options?: Omit<UseMutationOptions<SettingsExport, Error, void>, 'mutationFn'>) {
  return useMutation({
    mutationFn: () => service.exportSettings(userId),
    ...options,
  });
}

export function useImportSettings(userId: string, options?: Omit<UseMutationOptions<{ imported: number; errors: string[] }, Error, SettingsExport>, 'mutationFn'>) {
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

export function useResetSettings(userId: string, options?: Omit<UseMutationOptions<void, Error, { category?: SettingCategory }>, 'mutationFn'>) {
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