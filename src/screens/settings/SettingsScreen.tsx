import React from 'react';
import { ScrollView, Pressable, Linking } from 'react-native';

const openPrivacyPolicy = () => Linking.openURL('https://pla4ma.github.io/VEX.RELEASE/privacy');
const openTerms = () => Linking.openURL('https://pla4ma.github.io/VEX.RELEASE/terms');
const openSupport = () => Linking.openURL('https://pla4ma.github.io/VEX.RELEASE/support');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, ThemeMode } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box'
import { Text } from '../../components/primitives/Text';
import { useAuthStore } from '../../store';
import type { SettingsStackParams } from '../../navigation';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParams } from '../../navigation';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { isFeatureHidden } from '../../features/liveops-config/FeatureFlagService';
import { useSettingsStore } from '../../features/settings/store';
import { SettingsProfileRow } from './SettingsProfileRow';
import { SettingsSectionGroup } from './SettingsSectionGroup';
import { buildSettingsGroups } from './buildSettingsGroups';
import {
  LiquidGlassHeader,
  liquidGlassSpacing,
} from '../../shared/ui/liquid-glass/LiquidGlassHeader';
import { LiquidGlassScreen } from '../../shared/ui/liquid-glass/LiquidGlassScreen';
import { navigateToRootScreen, navigateToSettingsStackScreen } from '../../navigation/navigation-helpers';

type Props = NativeStackScreenProps<SettingsStackParams, 'SettingsMain'>;

export const SettingsScreen = withScreenErrorBoundary(function SettingsScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const {
    streakReminders,
    bossAlerts,
    squadNotifications,
    rivalNotifications,
    coachMessages,
    achievementUnlocks,
    soundEffects,
    haptics,
    analyticsEnabled,
    setPreference,
  } = useSettingsStore();
  const showEconomyToggles =
    !isFeatureHidden('boss_tab') &&
    !isFeatureHidden('challenges') &&
    !isFeatureHidden('wagers');

  const handleThemeChange = (newMode: ThemeMode) => setMode(newMode);

  const settingGroups = buildSettingsGroups({
    streakReminders, setStreakReminders: (v) => setPreference('streakReminders', v),
    bossAlerts, setBossAlerts: (v) => setPreference('bossAlerts', v),
    squadNotifications, setSquadNotifications: (v) => setPreference('squadNotifications', v),
    rivalNotifications, setRivalNotifications: (v) => setPreference('rivalNotifications', v),
    coachMessages, setCoachMessages: (v) => setPreference('coachMessages', v),
    achievementUnlocks, setAchievementUnlocks: (v) => setPreference('achievementUnlocks', v),
    soundEffects, setSoundEffects: (v) => setPreference('soundEffects', v),
    haptics, setHaptics: (v) => setPreference('haptics', v),
    analyticsEnabled, setAnalyticsEnabled: (v) => setPreference('analyticsEnabled', v),
    mode, handleThemeChange, navigation,
    openSupport, openPrivacyPolicy, openTerms,
    navigateToCoach: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'CoachSettings'),
    navigateToNotifications: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'NotificationSettings'),
    navigateToAppearance: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'AppearanceSettings'),
    navigateToPrivacy: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'PrivacySettings'),
    navigateToAccount: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'AccountSettings'),
    navigateToLaneMode: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'LaneMode'),
    navigateToDataExport: () => navigateToSettingsStackScreen(navigation as NavigationProp<RootStackParams>, 'DataExport'),
  });

  const filteredGroups = settingGroups
    .filter(
      (g) =>
        g.title !== 'Notifications' ||
        showEconomyToggles ||
        g.items.length > 1,
    )
    .map((g) => ({
      ...g,
      items:
        g.title === 'Notifications'
          ? g.items.filter(
              (i) =>
                (i.id !== 'boss-alerts' &&
                  i.id !== 'squad-notifications' &&
                  i.id !== 'rival-notifications') ||
                showEconomyToggles,
            )
          : g.items,
    }));

  return (
    <LiquidGlassScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={liquidGlassSpacing.screenX}
          pb={16}
          pt={insets.top + liquidGlassSpacing.screenTop}
        >
          <LiquidGlassHeader
            eyebrow="Control room"
            title="Settings"
            body="Tune VEX without leaving the focus record."
          />
        </Box>

        <SettingsProfileRow
          displayName={user?.displayName || 'User'}
          userId={user?.id || ''}
          theme={theme}
          onPress={() => navigateToRootScreen(navigation as NavigationProp<RootStackParams>, 'Main', { screen: 'Profile' })}
        />

        <Box px={16}>
          {filteredGroups.map((group) => (
            <SettingsSectionGroup
              key={group.title}
              group={group}
              theme={theme}
            />
          ))}
        </Box>

        <Box alignItems="center" mt={8} mb={24}>
          <Text variant="caption" color="text.tertiary">
            Made with care by the VEX Team
          </Text>
        </Box>

        <Pressable
          style={{
            marginHorizontal: 16,
            paddingVertical: 16,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: theme.colors.error.light,
            marginBottom: 16,
          }}
          onPress={logout}
          accessibilityLabel="Log out"
          accessibilityRole="button"
          accessibilityHint="Signs out of your VEX account"
        >
          <Text
            style={{ color: theme.colors.error.DEFAULT, fontWeight: '600' }}
          >
            Log Out
          </Text>
        </Pressable>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </LiquidGlassScreen>
  );
}, 'Settings');
