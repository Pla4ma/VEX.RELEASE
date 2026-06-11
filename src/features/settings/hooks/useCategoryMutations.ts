import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { useToast } from '../../../shared/ui/components/Toast';
import * as service from '../service';
import {
  type NotificationSettings,
  type CoachSettings,
  type AppearanceSettings,
  type PrivacySettings,
  type SettingCategory,
  type SettingsExport,
} from '../types';
import { settingsKeys } from './queryKeys';

export function useUpdateNotificationSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<
      NotificationSettings,
      Error,
      Partial<NotificationSettings>
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (settings) =>
      service.updateNotificationSettings(userId, settings) as Promise<NotificationSettings>,
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'updateNotificationSettings' } });
      show({ type: 'error', title: 'Settings not saved', message: 'Try again when connection returns.' });
    },
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
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (settings) => service.updateCoachSettings(userId, settings),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'updateCoachSettings' } });
      show({ type: 'error', title: 'Settings not saved', message: 'Try again when connection returns.' });
    },
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
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (settings) =>
      service.updateAppearanceSettings(userId, settings),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'updateAppearanceSettings' } });
      show({ type: 'error', title: 'Settings not saved', message: 'Try again when connection returns.' });
    },
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
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (settings) => service.updatePrivacySettings(userId, settings),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'updatePrivacySettings' } });
      show({ type: 'error', title: 'Settings not saved', message: 'Try again when connection returns.' });
    },
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
  options?: Omit<UseMutationOptions<SettingsExport, Error, void>, 'mutationFn'>,
) {
  const { show } = useToast();
  return useMutation({
    mutationFn: () => service.exportSettings(userId),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'exportSettings' } });
      show({ type: 'error', title: 'Export failed', message: 'Try again when connection returns.' });
    },
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
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (exportData) => service.importSettings(userId, exportData),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'importSettings' } });
      show({ type: 'error', title: 'Import failed', message: 'Try again when connection returns.' });
    },
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
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  const { show } = useToast();
  return useMutation({
    mutationFn: (params) => service.resetSettings(userId, params.category),
    onError: (error) => {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'resetSettings' } });
      show({ type: 'error', title: 'Reset failed', message: 'Try again when connection returns.' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(userId) });
    },
    ...options,
  });
}
