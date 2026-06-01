import type { ThemeMode } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParams } from '../../navigation';
import type { SettingGroup } from './SettingsSectionGroup';

type Nav = NativeStackNavigationProp<SettingsStackParams, 'SettingsMain'>;

export interface BuildSettingsGroupsParams {
  streakReminders: boolean;
  setStreakReminders: (v: boolean) => void;
  bossAlerts: boolean;
  setBossAlerts: (v: boolean) => void;
  squadNotifications: boolean;
  setSquadNotifications: (v: boolean) => void;
  rivalNotifications: boolean;
  setRivalNotifications: (v: boolean) => void;
  coachMessages: boolean;
  setCoachMessages: (v: boolean) => void;
  achievementUnlocks: boolean;
  setAchievementUnlocks: (v: boolean) => void;
  soundEffects: boolean;
  setSoundEffects: (v: boolean) => void;
  haptics: boolean;
  setHaptics: (v: boolean) => void;
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (v: boolean) => void;
  mode: ThemeMode;
  handleThemeChange: (mode: ThemeMode) => void;
  navigation: Nav;
  openSupport: () => void;
  openPrivacyPolicy: () => void;
  openTerms: () => void;
  navigateToCoach: () => void;
  navigateToNotifications: () => void;
  navigateToAppearance: () => void;
  navigateToPrivacy: () => void;
  navigateToAccount: () => void;
  navigateToLaneMode: () => void;
  navigateToDataExport: () => void;
}

export function buildSettingsGroups(p: BuildSettingsGroupsParams): SettingGroup[] {
  return [
    {
      title: 'Profile',
      items: [
        { id: 'edit-profile', icon: 'user', title: 'Edit Profile', subtitle: 'Name, photo, bio', type: 'link',
          onPress: () => p.navigation.navigate('Main', { screen: 'Profile' }) },
        { id: 'focus-mode', icon: 'target', title: 'Focus Mode', subtitle: 'Study, Run, Project, or Clean', type: 'link',
          onPress: p.navigateToLaneMode },
        { id: 'account', icon: 'shield', title: 'Account', subtitle: 'Password, 2FA, email', type: 'link',
          onPress: p.navigateToAccount },
      ],
    },
    {
      title: 'Coach',
      items: [
        { id: 'coach-settings', icon: 'message-circle', title: 'AI Coach', subtitle: 'Persona, frequency, memory', type: 'link',
          onPress: p.navigateToCoach },
        { id: 'coach-messages-toggle', icon: 'bell', title: 'Coach Messages', subtitle: 'Get tips and encouragement', type: 'toggle',
          value: p.coachMessages, onToggle: p.setCoachMessages },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { id: 'notification-settings', icon: 'bell', title: 'Notification Settings', subtitle: 'Customize all alerts', type: 'link',
          onPress: p.navigateToNotifications },
        { id: 'streak-reminders', icon: 'flame', title: 'Streak Reminders', subtitle: 'Alert when streak at risk', type: 'toggle',
          value: p.streakReminders, onToggle: p.setStreakReminders },
        { id: 'boss-alerts', icon: 'target', title: 'Boss Alerts', subtitle: 'Boss spawn and timeout', type: 'toggle',
          value: p.bossAlerts, onToggle: p.setBossAlerts },
        { id: 'squad-notifications', icon: 'users', title: 'Squad Notifications', subtitle: 'Squad activity and wars', type: 'toggle',
          value: p.squadNotifications, onToggle: p.setSquadNotifications },
        { id: 'rival-notifications', icon: 'zap', title: 'Rival Notifications', subtitle: 'Challenges and updates', type: 'toggle',
          value: p.rivalNotifications, onToggle: p.setRivalNotifications },
        { id: 'achievement-unlocks', icon: 'award', title: 'Achievement Unlocks', subtitle: 'Celebrate milestones', type: 'toggle',
          value: p.achievementUnlocks, onToggle: p.setAchievementUnlocks },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { id: 'appearance-settings', icon: 'palette', title: 'Appearance', subtitle: 'Theme, colors, font size', type: 'link',
          onPress: p.navigateToAppearance },
        { id: 'theme-quick', icon: 'moon', title: 'Theme', type: 'select',
          value: p.mode === 'dark' ? 'Dark' : p.mode === 'system' ? 'System' : 'Light',
          onPress: () => { p.handleThemeChange(p.mode === 'light' ? 'dark' : p.mode === 'dark' ? 'system' : 'light' as ThemeMode); } },
        { id: 'sound', icon: 'volume-2', title: 'Sound Effects', type: 'toggle',
          value: p.soundEffects, onToggle: p.setSoundEffects },
        { id: 'haptics', icon: 'vibrate', title: 'Haptic Feedback', type: 'toggle',
          value: p.haptics, onToggle: p.setHaptics },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { id: 'privacy-settings', icon: 'lock', title: 'Privacy Settings', subtitle: 'Visibility, data, analytics', type: 'link',
          onPress: p.navigateToPrivacy },
        { id: 'analytics', icon: 'bar-chart-2', title: 'Anonymous Analytics', subtitle: 'Help improve VEX', type: 'toggle',
          value: p.analyticsEnabled, onToggle: p.setAnalyticsEnabled },
      ],
    },
    {
      title: 'Data',
      items: [
        { id: 'data-export', icon: 'download', title: 'Export My Data', subtitle: 'Download sessions, achievements, progression', type: 'link',
          onPress: p.navigateToDataExport },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 'help', icon: 'help-circle', title: 'Help Center', type: 'link', onPress: p.openSupport },
        { id: 'feedback', icon: 'message-square', title: 'Send Feedback', type: 'link', onPress: p.openSupport },
        { id: 'privacy', icon: 'file-text', title: 'Privacy Policy', type: 'link', onPress: p.openPrivacyPolicy },
        { id: 'terms', icon: 'file', title: 'Terms of Service', type: 'link', onPress: p.openTerms },
      ],
    },
  ];
}
