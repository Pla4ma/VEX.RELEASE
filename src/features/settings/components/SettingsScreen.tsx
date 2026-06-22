import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { useSettingsUIState, useSyncSettings, useResetSettings, type SettingCategory } from '../hooks/useSettingsUIState';
import { eventBus } from '../../../events/EventBus';
import * as Sentry from '@sentry/react-native';
import { SettingsSectionHeader } from './SettingsSectionHeader';
import { SettingsCategoryTabs } from './SettingsCategoryTabs';
import { SettingsActions } from './SettingsActions';
import { SettingsLoadingState, SettingsErrorState } from './SettingsStates';
import { SettingsGeneralSection } from './SettingsGeneralSection';
import { SettingsCoachSection } from './SettingsCoachSection';
import { SettingsNotificationsSection } from './SettingsNotificationsSection';
import { SettingsAppearanceSection } from './SettingsAppearanceSection';
import { SettingsPrivacySection } from './SettingsPrivacySection';
import { SettingsDataControlSection } from './SettingsDataControlSection';
import { settingsStyles as styles } from './settings-screen-styles';

type SettingsState = 'idle' | 'loading' | 'error' | 'saving' | 'syncing';

interface SettingsScreenProps {
  userId: string;
  initialCategory?: SettingCategory;
  onBackPress?: () => void;
  onCategoryChange?: (category: SettingCategory) => void;
}

const CATEGORIES: Array<{ key: SettingCategory; label: string; icon: string }> =
  [
    { key: 'general', label: 'General', icon: '\u2699\uFE0F' },
    { key: 'notifications', label: 'Notifications', icon: '\uD83D\uDD14' },
    { key: 'coach', label: 'Coach', icon: '\uD83C\uDFAF' },
    { key: 'appearance', label: 'Appearance', icon: '\uD83C\uDFA8' },
    { key: 'privacy', label: 'Privacy', icon: '\uD83D\uDD12' },
    { key: 'data', label: 'Data', icon: '\uD83D\uDCBE' },
  ];

export function SettingsScreen({
  userId,
  initialCategory = 'general',
  onBackPress: _onBackPress,
  onCategoryChange,
}: SettingsScreenProps) {
  const [activeCategory, setActiveCategory] =
    useState<SettingCategory>(initialCategory);
  const [settingsState, setSettingsState] = useState<SettingsState>('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const {
    isLoading,
    isError,
    error,
    preferences,
    notifications,
    coach,
    appearance,
    privacy,
    refetch,
  } = useSettingsUIState(userId);
  const syncMutation = useSyncSettings(userId);
  const resetMutation = useResetSettings(userId);

  const handleRefresh = useCallback(async () => {
    setSettingsState('loading');
    try {
      await refetch();
      if (mountedRef.current) {
        setSettingsState('idle');
      }
    } catch (err) {
      captureSilentFailure(err, {
        feature: 'settings',
        operation: 'ui-fallback',
        type: 'ui',
      });
      if (mountedRef.current) {
        setSettingsState('error');
      }
    }
  }, [refetch]);

  const handleSync = useCallback(async () => {
    setSettingsState('syncing');
    try {
      await syncMutation.mutateAsync({});
      if (mountedRef.current) {
        setSettingsState('idle');
      }
      Sentry.addBreadcrumb({
        category: 'settings',
        message: 'Settings synced successfully',
        level: 'info',
      });
    } catch (err) {
      if (mountedRef.current) {
        setSettingsState('error');
      }
      Sentry.captureException(err, { tags: { operation: 'settingsSync' } });
    }
  }, [syncMutation]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Settings',
      `Are you sure you want to reset ${activeCategory} settings to defaults?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setSettingsState('saving');
            try {
              await resetMutation.mutateAsync({ category: activeCategory });
              if (!mountedRef.current) {
                return;
              }
              setSettingsState('idle');
              eventBus.publish('settings:reset', { category: activeCategory });
            } catch (err) {
              if (mountedRef.current) {
                setSettingsState('error');
              }
            }
          },
        },
      ],
    );
  }, [activeCategory, resetMutation]);

  const handleCategoryChange = useCallback(
    (category: SettingCategory) => {
      setActiveCategory(category);
      onCategoryChange?.(category);
    },
    [onCategoryChange],
  );

  if (isLoading || settingsState === 'loading') {
    return <SettingsLoadingState />;
  }

  if (isError || settingsState === 'error') {
    return <SettingsErrorState error={error} onRetry={handleRefresh} />;
  }

  const activeLabel =
    CATEGORIES.find((c) => c.key === activeCategory)?.label ?? '';

  return (
    <View style={styles.container}>
      <SettingsCategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <ScrollView
        style={styles.contentScroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <SettingsSectionHeader
          title={activeLabel}
          isSyncing={settingsState === 'syncing'}
        />
        {activeCategory === 'general' && (
          <SettingsGeneralSection preferences={preferences} />
        )}
        {activeCategory === 'coach' && <SettingsCoachSection coach={coach} />}
        {activeCategory === 'notifications' && (
          <SettingsNotificationsSection notifications={notifications} />
        )}
        {activeCategory === 'appearance' && (
          <SettingsAppearanceSection appearance={appearance} />
        )}
        {activeCategory === 'privacy' && (
          <SettingsPrivacySection privacy={privacy} />
        )}
        {activeCategory === 'data' && (
          <SettingsDataControlSection userId={userId} />
        )}
        <SettingsActions
          settingsState={settingsState}
          onSync={handleSync}
          onReset={handleReset}
        />
      </ScrollView>
    </View>
  );
}
