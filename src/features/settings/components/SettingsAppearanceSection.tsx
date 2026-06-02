import React from 'react';
import { View } from 'react-native';
import type { AppearanceSettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { SliderSetting } from './SliderSetting';
import { createSheet } from '@/shared/ui/create-sheet';


interface SettingsAppearanceSectionProps {
  appearance: AppearanceSettings | undefined;
}

export function SettingsAppearanceSection({
  appearance,
}: SettingsAppearanceSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <SettingItem
        label="Theme"
        value={appearance?.theme ?? 'system'}
        onPress={() => {}}
      />
      <SettingItem
        label="Accent Color"
        value={appearance?.accentColor ?? '#6366f1'}
        onPress={() => {}}
      />
      <SliderSetting
        label="Font Scale"
        value={appearance?.fontScale ?? 1}
        min={0.5}
        max={2}
        onChange={() => {}}
      />
      <ToggleSetting
        label="Reduce Motion"
        value={appearance?.reduceMotion ?? false}
        onToggle={() => {}}
      />
      <ToggleSetting
        label="High Contrast"
        value={appearance?.highContrast ?? false}
        onToggle={() => {}}
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
