import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import * as service from '../service';
import {
  type Setting,
  type SyncState,
  type SettingCategory,
  type SettingValue,
} from '../types';
import { settingsKeys } from './queryKeys';

export function useUpdateSetting(
  userId: string,
  options?: Omit<
    UseMutationOptions<
      Setting,
      Error,
      { key: string; value: SettingValue; category: SettingCategory }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value, category }) =>
      service.updateSetting(userId, key, value, category),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.setting(userId, variables.key),
      });
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(userId),
      });
      queryClient.setQueryData(
        settingsKeys.setting(userId, variables.key),
        data,
      );
    },
    ...options,
  });
}

export function useBatchUpdateSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<
      Setting[],
      Error,
      Array<{ key: string; value: SettingValue; category: SettingCategory }>
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates) => service.batchUpdateSettings(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(userId) });
    },
    ...options,
  });
}

export function useDeleteSetting(
  userId: string,
  options?: Omit<UseMutationOptions<boolean, Error, string>, 'mutationFn'>,
) {
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

export function useSyncSettings(
  userId: string,
  options?: Omit<
    UseMutationOptions<
      SyncState,
      Error,
      { force?: boolean; direction?: 'up' | 'down' | 'both' }
    >,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) =>
      service.syncSettings(userId, {
        force: params.force,
        direction: params.direction,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.user(userId) });
    },
    ...options,
  });
}
