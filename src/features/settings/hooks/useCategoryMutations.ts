import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import * as service from "../service";
import {
  type NotificationSettings,
  type CoachSettings,
  type AppearanceSettings,
  type PrivacySettings,
  type SettingCategory,
  type SettingsExport,
} from "../types";
import { settingsKeys } from "./queryKeys";

export function useUpdateNotificationSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<
      NotificationSettings,
      Error,
      Partial<NotificationSettings>
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) =>
      service.updateNotificationSettings(userId, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.notifications(userId), data);
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

export function useUpdateCoachSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<CoachSettings, Error, Partial<CoachSettings>>,
    "mutationFn"
  >,
) {
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

export function useUpdateAppearanceSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<AppearanceSettings, Error, Partial<AppearanceSettings>>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings) =>
      service.updateAppearanceSettings(userId, settings),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.appearance(userId), data);
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
    },
    ...options,
  });
}

export function useUpdatePrivacySettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<PrivacySettings, Error, Partial<PrivacySettings>>,
    "mutationFn"
  >,
) {
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

export function useExportSettings(
  userId: string,
  options?: Omit<UseMutationOptions<SettingsExport, Error, void>, "mutationFn">,
) {
  return useMutation({
    mutationFn: () => service.exportSettings(userId),
    ...options,
  });
}

export function useImportSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<
      { imported: number; errors: string[] },
      Error,
      SettingsExport
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exportData) => service.importSettings(userId, exportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(userId) });
    },
    ...options,
  });
}

export function useResetSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<void, Error, { category?: SettingCategory }>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => service.resetSettings(userId, params.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(userId) });
    },
    ...options,
  });
}
