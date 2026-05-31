import React from 'react';
import { View } from 'react-native';
import type { PrivacySettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { createSheet } from '@/shared/ui/create-sheet';
import { launchColors } from '@theme/tokens/launch-colors';

interface SettingsPrivacySectionProps {
  privacy: PrivacySettings | undefined;
}

export function SettingsPrivacySection({
  privacy,
}: SettingsPrivacySectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <SettingItem
        label="Profile Visibility"
        value={privacy?.profileVisibility ?? 'friends'}
        onPress={() => {}}
      />
      <ToggleSetting
        label="Show Online Status"
        value={privacy?.showOnlineStatus ?? true}
        onToggle={() => {}}
      />
      <ToggleSetting
        label="Allow Data Analysis"
        value={privacy?.allowDataAnalysis ?? true}
        onToggle={() => {}}
      />
      <ToggleSetting
        label="Opt Out of Analytics"
        value={privacy?.analyticsOptOut ?? false}
        onToggle={() => {}}
      />
    </View>
  );
}

const styles = createSheet({
  settingsGroup: {
    backgroundColor: launchColors.hex_ffffff,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
