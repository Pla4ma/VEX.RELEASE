import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import * as service from "../service";
import { type Setting, type UserPreferences, type NotificationSettings, type CoachSettings, type AppearanceSettings, type PrivacySettings, type SyncState, type SettingCategory, type SettingValue, type SettingsExport } from "../types";


export const settingsKeys = {
  all: ['settings'] as const,
  user: (userId: string) => [...settingsKeys.all, userId] as const,
  setting: (userId: string, key: string) => [...settingsKeys.user(userId), 'setting', key] as const,
  preferences: (userId: string) => [...settingsKeys.user(userId), 'preferences'] as const,
  notifications: (userId: string) => [...settingsKeys.user(userId), 'notifications'] as const,
  coach: (userId: string) => [...settingsKeys.user(userId), 'coach'] as const,
  appearance: (userId: string) => [...settingsKeys.user(userId), 'appearance'] as const,
  privacy: (userId: string) => [...settingsKeys.user(userId), 'privacy'] as const,
  sync: (userId: string) => [...settingsKeys.user(userId), 'sync'] as const,
};

export function useSetting(userId: string, key: string, options?: Omit<UseQueryOptions<Setting | null>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.setting(userId, key),
    queryFn: () => service.getSetting(userId, key),
    enabled: !!userId && !!key,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useAllSettings(userId: string, options?: Omit<UseQueryOptions<Setting[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.user(userId),
    queryFn: () => service.getAllSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUserPreferences(userId: string, options?: Omit<UseQueryOptions<UserPreferences>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.preferences(userId),
    queryFn: () => service.getUserPreferences(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateSetting(userId: string, options?: Omit<UseMutationOptions<Setting, Error, { key: string; value: SettingValue; category: SettingCategory }>, 'mutationFn'>) {
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

export function useBatchUpdateSettings(userId: string, options?: Omit<UseMutationOptions<Setting[], Error, Array<{ key: string; value: SettingValue; category: SettingCategory }>>, 'mutationFn'>) {
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

export function useDeleteSetting(userId: string, options?: Omit<UseMutationOptions<boolean, Error, string>, 'mutationFn'>) {
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

export function useSyncSettings(userId: string, options?: Omit<UseMutationOptions<SyncState, Error, { force?: boolean; direction?: 'up' | 'down' | 'both' }>, 'mutationFn'>) {
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

export function useNotificationSettings(userId: string, options?: Omit<UseQueryOptions<NotificationSettings>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.notifications(userId),
    queryFn: () => service.getNotificationSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateNotificationSettings(userId: string, options?: Omit<UseMutationOptions<NotificationSettings, Error, Partial<NotificationSettings>>, 'mutationFn'>) {
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

export function useCoachSettings(userId: string, options?: Omit<UseQueryOptions<CoachSettings>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: settingsKeys.coach(userId),
    queryFn: () => service.getCoachSettings(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateCoachSettings(userId: string, options?: Omit<UseMutationOptions<CoachSettings, Error, Partial<CoachSettings>>, 'mutationFn'>) {
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