import React from 'react';
import { View } from 'react-native';
import type { AppearanceSettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { SliderSetting } from './SliderSetting';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import type { SettingChangeHandler } from './setting-change';


interface SettingsAppearanceSectionProps {
  appearance: AppearanceSettings | undefined;
  onChange: SettingChangeHandler;
}

export function SettingsAppearanceSection({
  appearance,
  onChange,
}: SettingsAppearanceSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <SettingItem
        label="Theme"
        value={appearance?.theme ?? 'system'}
      />
      <SettingItem
        label="Accent Color"
        value={appearance?.accentColor ?? lightColors.semantic.primary}
      />
      <SliderSetting
        label="Font Scale"
        value={appearance?.fontScale ?? 1}
        min={0.5}
        max={2}
        onChange={(value) => onChange('appearance.fontScale', value, 'appearance')}
      />
      <ToggleSetting
        label="Reduce Motion"
        value={appearance?.reduceMotion ?? false}
        onToggle={(value) => onChange('appearance.reduceMotion', value, 'appearance')}
      />
      <ToggleSetting
        label="High Contrast"
        value={appearance?.highContrast ?? false}
        onToggle={(value) => onChange('appearance.highContrast', value, 'appearance')}
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
