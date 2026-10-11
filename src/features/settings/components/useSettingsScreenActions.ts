import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { eventBus } from '../../../events/EventBus';
import { useResetSettings } from '../hooks/useCategoryMutations';
import { useSyncSettings, useUpdateSetting } from '../hooks/useSettingMutations';
import type { SettingCategory, SettingValue } from '../types';

export type SettingsScreenState = 'idle' | 'loading' | 'error' | 'saving' | 'syncing';

export function useSettingsScreenActions(input: {
  activeCategory: SettingCategory;
  onCategoryChange?: (category: SettingCategory) => void;
  onRefetch: () => Promise<void>;
  setActiveCategory: (category: SettingCategory) => void;
  userId: string;
}): {
  handleCategoryChange: (category: SettingCategory) => void;
  handleRefresh: () => Promise<void>;
  handleReset: () => void;
  handleSettingChange: (key: string, value: SettingValue, category: SettingCategory) => void;
  handleSync: () => Promise<void>;
  settingsState: SettingsScreenState;
} {
  const [settingsState, setSettingsState] = useState<SettingsScreenState>('idle');
  const mountedRef = useRef(true);
  const syncMutation = useSyncSettings(input.userId);
  const resetMutation = useResetSettings(input.userId);
  const updateMutation = useUpdateSetting(input.userId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSettingChange = useCallback(
    (key: string, value: SettingValue, category: SettingCategory): void => {
      updateMutation.mutate({ key, value, category });
    },
    [updateMutation],
  );

  const handleRefresh = useCallback(async (): Promise<void> => {
    setSettingsState('loading');
    try {
      await input.onRefetch();
      if (mountedRef.current) {setSettingsState('idle');}
    } catch (error: unknown) {
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'refresh' } });
      if (mountedRef.current) {setSettingsState('error');}
    }
  }, [input]);

  const handleSync = useCallback(async (): Promise<void> => {
    setSettingsState('syncing');
    try {
      await syncMutation.mutateAsync({});
      if (mountedRef.current) {setSettingsState('idle');}
      Sentry.addBreadcrumb({ category: 'settings', message: 'Settings synced successfully', level: 'info' });
    } catch (error: unknown) {
      if (mountedRef.current) {setSettingsState('error');}
      Sentry.captureException(error, { tags: { feature: 'settings', operation: 'sync' } });
    }
  }, [syncMutation]);

  const handleReset = useCallback((): void => {
    Alert.alert('Reset Settings', `Are you sure you want to reset ${input.activeCategory} settings to defaults?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          setSettingsState('saving');
          try {
            await resetMutation.mutateAsync({ category: input.activeCategory });
            if (!mountedRef.current) {return;}
            setSettingsState('idle');
            eventBus.publish('settings:reset', { category: input.activeCategory });
          } catch (error: unknown) {
            Sentry.captureException(error, { tags: { feature: 'settings', operation: 'reset' } });
            if (mountedRef.current) {setSettingsState('error');}
          }
        },
      },
    ]);
  }, [input, resetMutation]);

  const handleCategoryChange = useCallback(
    (category: SettingCategory): void => {
      input.setActiveCategory(category);
      input.onCategoryChange?.(category);
    },
    [input],
  );

  return {
    handleCategoryChange,
    handleRefresh,
    handleReset,
    handleSettingChange,
    handleSync,
    settingsState,
  };
}
