import React from 'react';
import { View } from 'react-native';
import type { CoachSettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import type { SettingChangeHandler } from './setting-change';


interface SettingsCoachSectionProps {
  coach: CoachSettings | undefined;
  onChange: SettingChangeHandler;
}

export function SettingsCoachSection({
  coach,
  onChange,
}: SettingsCoachSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <ToggleSetting
        label="Enable Coach"
        value={coach?.enabled ?? true}
        onToggle={(value) => onChange('coach.enabled', value, 'coach')}
      />
      <SettingItem
        label="Personality"
        value={coach?.personality ?? 'supportive'}
      />
      <SettingItem
        label="Frequency"
        value={coach?.frequency ?? 'moderate'}
      />
      <ToggleSetting
        label="Streak Reminders"
        value={coach?.messageTypes?.streakReminders ?? true}
        onToggle={(value) => onChange('coach.messageTypes.streakReminders', value, 'coach')}
      />
      <ToggleSetting
        label="Session Tips"
        value={coach?.messageTypes?.sessionTips ?? true}
        onToggle={(value) => onChange('coach.messageTypes.sessionTips', value, 'coach')}
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
