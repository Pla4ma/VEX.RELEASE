import React from 'react';
import { View } from 'react-native';
import type { NotificationSettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { createSheet } from '@/shared/ui/create-sheet';


interface SettingsNotificationsSectionProps {
  notifications: NotificationSettings | undefined;
}

export function SettingsNotificationsSection({
  notifications,
}: SettingsNotificationsSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <ToggleSetting
        label="Push Notifications"
        value={notifications?.channels?.push?.enabled ?? true}
        onToggle={() => {}}
      />
      <ToggleSetting
        label="Email Notifications"
        value={notifications?.channels?.email?.enabled ?? true}
        onToggle={() => {}}
      />
      <ToggleSetting
        label="In-App Notifications"
        value={notifications?.channels?.inApp?.enabled ?? true}
        onToggle={() => {}}
      />
      <SettingItem
        label="Quiet Hours"
        value={`${notifications?.channels?.push?.quietHoursStart ?? 22}:00 - ${notifications?.channels?.push?.quietHoursEnd ?? 8}:00`}
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
