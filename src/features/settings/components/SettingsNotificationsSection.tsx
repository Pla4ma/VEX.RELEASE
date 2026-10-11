import React from 'react';
import { View } from 'react-native';
import type { NotificationSettings } from '../types';
import { ToggleSetting } from './ToggleSetting';
import { SettingItem } from './SettingItem';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';
import type { SettingChangeHandler } from './setting-change';


interface SettingsNotificationsSectionProps {
  notifications: NotificationSettings | undefined;
  onChange: SettingChangeHandler;
}

export function SettingsNotificationsSection({
  notifications,
  onChange,
}: SettingsNotificationsSectionProps) {
  return (
    <View style={styles.settingsGroup}>
      <ToggleSetting
        label="Push Notifications"
        value={notifications?.channels?.push?.enabled ?? true}
        onToggle={(value) => onChange('notifications.push.enabled', value, 'notifications')}
      />
      <ToggleSetting
        label="Email Notifications"
        value={notifications?.channels?.email?.enabled ?? true}
        onToggle={(value) => onChange('notifications.email.enabled', value, 'notifications')}
      />
      <ToggleSetting
        label="In-App Notifications"
        value={notifications?.channels?.inApp?.enabled ?? true}
        onToggle={(value) => onChange('notifications.inApp.enabled', value, 'notifications')}
      />
      <SettingItem
        label="Quiet Hours"
        value={`${notifications?.channels?.push?.quietHoursStart ?? 22}:00 - ${notifications?.channels?.push?.quietHoursEnd ?? 8}:00`}
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
