import React from 'react';
import { View } from 'react-native';
import type { UserPreferences } from '../types';
import { SettingItem } from './SettingItem';
import { createSheet } from '@/shared/ui/create-sheet';


interface SettingsGeneralSectionProps {
  preferences: UserPreferences | undefined;
}

export function SettingsGeneralSection({
  preferences,
}: SettingsGeneralSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <SettingItem
        label="Language"
        value={preferences?.settings?.['general.language']?.value ?? 'en'}
        onPress={() => {}}
      />
      <SettingItem
        label="Timezone"
        value={
          preferences?.settings?.['general.timezone']?.value ??
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }
        onPress={() => {}}
      />
    </View>
  );
}

const styles = createSheet({
  settingsGroup: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
