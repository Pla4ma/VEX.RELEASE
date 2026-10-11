import React from 'react';
import { View } from 'react-native';
import type { PrivacySettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import type { SettingChangeHandler } from './setting-change';


interface SettingsPrivacySectionProps {
  privacy: PrivacySettings | undefined;
  onChange: SettingChangeHandler;
}

export function SettingsPrivacySection({
  privacy,
  onChange,
}: SettingsPrivacySectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <SettingItem
        label="Profile Visibility"
        value={privacy?.profileVisibility ?? 'friends'}
      />
      <ToggleSetting
        label="Show Online Status"
        value={privacy?.showOnlineStatus ?? true}
        onToggle={(value) => onChange('privacy.showOnlineStatus', value, 'privacy')}
      />
      <ToggleSetting
        label="Allow Data Analysis"
        value={privacy?.allowDataAnalysis ?? true}
        onToggle={(value) => onChange('privacy.allowDataAnalysis', value, 'privacy')}
      />
      <ToggleSetting
        label="Opt Out of Analytics"
        value={privacy?.analyticsOptOut ?? false}
        onToggle={(value) => onChange('privacy.analyticsOptOut', value, 'privacy')}
      />
    </View>
  );
}

const styles = createSheet({
  settingsGroup: {
    backgroundColor: lightColors.text.inverse,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
