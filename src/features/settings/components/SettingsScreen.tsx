import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useSettingsUIState } from '../hooks/useSettingsUIState';
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
import { SETTINGS_CATEGORIES } from './settings-categories';
import { useSettingsScreenActions } from './useSettingsScreenActions';
import type { SettingCategory } from '../types';

interface SettingsScreenProps {
  userId: string;
  initialCategory?: SettingCategory;
  onBackPress?: () => void;
  onCategoryChange?: (category: SettingCategory) => void;
}


export function SettingsScreen({
  userId,
  initialCategory = 'general',
  onCategoryChange,
}: SettingsScreenProps) {
  const [activeCategory, setActiveCategory] =
    useState<SettingCategory>(initialCategory);
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
  const {
    handleCategoryChange,
    handleRefresh,
    handleReset,
    handleSettingChange,
    handleSync,
    settingsState,
  } = useSettingsScreenActions({
    activeCategory,
    onCategoryChange,
    onRefetch: refetch,
    setActiveCategory,
    userId,
  });

  if (isLoading || settingsState === 'loading') {
    return <SettingsLoadingState />;
  }

  if (isError || settingsState === 'error') {
    return <SettingsErrorState error={error} onRetry={handleRefresh} />;
  }

  const activeLabel =
    SETTINGS_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? '';

  return (
    <View style={styles.container}>
      <SettingsCategoryTabs
        categories={SETTINGS_CATEGORIES}
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
        {activeCategory === 'coach' && (
          <SettingsCoachSection coach={coach} onChange={handleSettingChange} />
        )}
        {activeCategory === 'notifications' && (
          <SettingsNotificationsSection
            notifications={notifications}
            onChange={handleSettingChange}
          />
        )}
        {activeCategory === 'appearance' && (
          <SettingsAppearanceSection
            appearance={appearance}
            onChange={handleSettingChange}
          />
        )}
        {activeCategory === 'privacy' && (
          <SettingsPrivacySection
            privacy={privacy}
            onChange={handleSettingChange}
          />
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
