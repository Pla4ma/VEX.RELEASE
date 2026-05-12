/**
 * Settings Screen
 *
 * Premium settings screen with grouped preferences and toggles.
 * Phase 14.1 - Complete Settings Layout
 *
 * Sections: Profile, Coach, Notifications, Appearance, Privacy, Account, About
 */

import React, { useState } from 'react';
import {
  ScrollView,
  Pressable,
  Switch,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme, ThemeMode } from '../../theme';
import { Box, Text, Card } from '../../components/primitives';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Icon } from '../../icons';
import { useAuthStore } from '../../store';
import type { SettingsStackParams } from '../../navigation';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

type Props = NativeStackScreenProps<SettingsStackParams, 'SettingsMain'>;

type SettingItemType = 'toggle' | 'link' | 'button' | 'select' | 'value';

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: SettingItemType;
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

export const SettingsScreen = withScreenErrorBoundary(function _SettingsScreen({ navigation }: Props): React.JSX.Element {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  // Notification toggles
  const [streakReminders, setStreakReminders] = useState(true);
  const [bossAlerts, setBossAlerts] = useState(true);
  const [squadNotifications, setSquadNotifications] = useState(true);
  const [rivalNotifications, setRivalNotifications] = useState(true);
  const [weeklyReport] = useState(true);
  const [coachMessages, setCoachMessages] = useState(true);
  const [achievementUnlocks, setAchievementUnlocks] = useState(true);

  // Preference toggles
  const [soundEffects, setSoundEffects] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://vex.app/privacy');
  };

  const openTerms = () => {
    Linking.openURL('https://vex.app/terms');
  };

  const openSupport = () => {
    Linking.openURL('mailto:support@vex.app');
  };

  const navigateToNotifications = () => {
    navigation.navigate('NotificationSettings');
  };

  const navigateToAppearance = () => {
    navigation.navigate('AppearanceSettings');
  };

  const navigateToCoach = () => {
    navigation.navigate('CoachSettings');
  };

  const navigateToPrivacy = () => {
    navigation.navigate('PrivacySettings');
  };

  const navigateToAccount = () => {
    navigation.navigate('AccountSettings');
  };

  const settingGroups: SettingGroup[] = [
    {
      title: 'Profile',
      items: [
        {
          id: 'edit-profile',
          icon: 'user',
          title: 'Edit Profile',
          subtitle: 'Name, photo, bio',
          type: 'link',
          onPress: () => navigation.navigate('Main', { screen: 'Profile' }),
        },
        {
          id: 'account',
          icon: 'shield',
          title: 'Account',
          subtitle: 'Password, 2FA, email',
          type: 'link',
          onPress: navigateToAccount,
        },
      ],
    },
    {
      title: 'Coach',
      items: [
        {
          id: 'coach-settings',
          icon: 'message-circle',
          title: 'AI Coach',
          subtitle: 'Persona, frequency, memory',
          type: 'link',
          onPress: navigateToCoach,
        },
        {
          id: 'coach-messages-toggle',
          icon: 'bell',
          title: 'Coach Messages',
          subtitle: 'Get tips and encouragement',
          type: 'toggle',
          value: coachMessages,
          onToggle: setCoachMessages,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notification-settings',
          icon: 'bell',
          title: 'Notification Settings',
          subtitle: 'Customize all alerts',
          type: 'link',
          onPress: navigateToNotifications,
        },
        {
          id: 'streak-reminders',
          icon: 'flame',
          title: 'Streak Reminders',
          subtitle: 'Alert when streak at risk',
          type: 'toggle',
          value: streakReminders,
          onToggle: setStreakReminders,
        },
        {
          id: 'boss-alerts',
          icon: 'target',
          title: 'Boss Alerts',
          subtitle: 'Boss spawn and timeout',
          type: 'toggle',
          value: bossAlerts,
          onToggle: setBossAlerts,
        },
        {
          id: 'squad-notifications',
          icon: 'users',
          title: 'Squad Notifications',
          subtitle: 'Squad activity and wars',
          type: 'toggle',
          value: squadNotifications,
          onToggle: setSquadNotifications,
        },
        {
          id: 'rival-notifications',
          icon: 'zap',
          title: 'Rival Notifications',
          subtitle: 'Challenges and updates',
          type: 'toggle',
          value: rivalNotifications,
          onToggle: setRivalNotifications,
        },
        {
          id: 'achievement-unlocks',
          icon: 'award',
          title: 'Achievement Unlocks',
          subtitle: 'Celebrate milestones',
          type: 'toggle',
          value: achievementUnlocks,
          onToggle: setAchievementUnlocks,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'appearance-settings',
          icon: 'palette',
          title: 'Appearance',
          subtitle: 'Theme, colors, font size',
          type: 'link',
          onPress: navigateToAppearance,
        },
        {
          id: 'theme-quick',
          icon: 'moon',
          title: 'Theme',
          type: 'select',
          value: mode === 'dark' ? 'Dark' : mode === 'system' ? 'System' : 'Light',
          onPress: () => {
            const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
            handleThemeChange(next as ThemeMode);
          },
        },
        {
          id: 'sound',
          icon: 'volume-2',
          title: 'Sound Effects',
          type: 'toggle',
          value: soundEffects,
          onToggle: setSoundEffects,
        },
        {
          id: 'haptics',
          icon: 'vibrate',
          title: 'Haptic Feedback',
          type: 'toggle',
          value: haptics,
          onToggle: setHaptics,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'privacy-settings',
          icon: 'lock',
          title: 'Privacy Settings',
          subtitle: 'Visibility, data, analytics',
          type: 'link',
          onPress: navigateToPrivacy,
        },
        {
          id: 'analytics',
          icon: 'bar-chart-2',
          title: 'Anonymous Analytics',
          subtitle: 'Help improve VEX',
          type: 'toggle',
          value: analyticsEnabled,
          onToggle: setAnalyticsEnabled,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'help',
          icon: 'help-circle',
          title: 'Help Center',
          type: 'link',
          onPress: openSupport,
        },
        {
          id: 'feedback',
          icon: 'message-square',
          title: 'Send Feedback',
          type: 'link',
          onPress: openSupport,
        },
        {
          id: 'privacy',
          icon: 'file-text',
          title: 'Privacy Policy',
          type: 'link',
          onPress: openPrivacyPolicy,
        },
        {
          id: 'terms',
          icon: 'file',
          title: 'Terms of Service',
          type: 'link',
          onPress: openTerms,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const iconColor = item.danger ? theme.colors.error.DEFAULT : theme.colors.primary[500];

    return (
      <Pressable
        key={item.id}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
        onPress={item.type === 'toggle' ? undefined : item.onPress}
        disabled={item.type === 'toggle'}

      accessibilityLabel="Interactive control"
      accessibilityRole="button"
      accessibilityHint="Activates this control">
        <Box width={36} height={36} borderRadius={10} justifyContent="center" alignItems="center" style={{ backgroundColor: theme.colors.background.secondary }}>
          <Icon name={item.icon} size={20} color={iconColor} />
        </Box>

        <Box flex={1} ml={12}>
          <Text
            variant="body"
            style={{
              fontWeight: '500',
              color: item.danger ? theme.colors.error.DEFAULT : theme.colors.text.primary,
            }}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text variant="caption" color="text.secondary" style={{ marginTop: 2 }}>
              {item.subtitle}
            </Text>
          )}
        </Box>

        <Box flexDirection="row" alignItems="center">
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.colors.background.tertiary, true: theme.colors.primary[500] + '80' }}
              thumbColor={item.value ? theme.colors.primary[500] : '#FFF'}
            />
          )}
          {item.type === 'link' && (
            <Icon name="arrow-right" size={20} color={theme.colors.text.tertiary} />
          )}
          {item.type === 'select' && (
            <Box flexDirection="row" alignItems="center">
              <Text variant="caption" color="text.secondary">
                {item.value}
              </Text>
              <Icon name="arrow-right" size={16} color={theme.colors.text.tertiary} style={{ marginLeft: 4 }} />
            </Box>
          )}
          {item.type === 'value' && (
            <Text variant="caption" color="text.secondary">
              {item.value}
            </Text>
          )}
        </Box>
      </Pressable>
    );
  };

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Box px={20} pb={16} pt={insets.top + 16}>
          <Text variant="h1">Settings</Text>
        </Box>

        {/* User Card */}
        <Card style={{ marginHorizontal: 16, marginBottom: 24 }} size="lg" onPress={() => navigation.navigate('Main', { screen: 'Profile' })}>
          <Box flexDirection="row" alignItems="center" flex={1}>
            <Avatar
              name={user?.displayName || 'User'}
              size="lg"
            />
            <Box ml={16} flex={1}>
              <Text variant="h3">
                {user?.displayName || 'User'}
              </Text>
              <Text variant="body" color="text.secondary">
                {user?.id || 'user@example.com'}
              </Text>
              <Box flexDirection="row" mt={8}>
                <Badge variant="primary" size="sm" leftIcon="star">
                  Pro
                </Badge>
              </Box>
            </Box>
          </Box>
          <Icon name="arrow-right" size={20} color={theme.colors.text.tertiary} />
        </Card>

        {/* Settings Groups */}
        <Box px={16}>
          {settingGroups.map((group) => (
            <Box key={group.title} mb={24}>
              <Text variant="caption" color="text.secondary" style={{ marginLeft: 12, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5 }}>
                {group.title.toUpperCase()}
              </Text>
              <Card size="sm" style={{ overflow: 'hidden' }}>
                {group.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {renderSettingItem(item)}
                    {index < group.items.length - 1 && (
                      <Box height={1} ml={64} style={{ backgroundColor: theme.colors.border.light }} />
                    )}
                  </React.Fragment>
                ))}
              </Card>
            </Box>
          ))}
        </Box>

        {/* Version Info */}
        <Box alignItems="center" mt={8} mb={24}>
          <Text variant="caption" color="text.tertiary">
            VEX v1.0.0 (Build 100)
          </Text>
          <Text variant="caption" color="text.tertiary" style={{ marginTop: 4 }}>
            Made with ♥ by the VEX Team
          </Text>
        </Box>

        {/* Logout Button */}
        <Pressable style={{ marginHorizontal: 16, paddingVertical: 16, alignItems: 'center', borderRadius: 12, backgroundColor: '#FEE2E2', marginBottom: 16 }} onPress={handleLogout}
  accessibilityLabel="Log Out button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <Text style={{ color: theme.colors.error.DEFAULT, fontWeight: '600' }}>
            Log Out
          </Text>
        </Pressable>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
}, 'Settings');

export default SettingsScreen;
