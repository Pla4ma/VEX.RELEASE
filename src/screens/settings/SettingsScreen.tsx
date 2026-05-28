import React, { useState } from "react";
import { ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme, ThemeMode } from "../../theme";
import { Box, Text } from "../../components/primitives";
import { Icon } from "../../icons";
import { useAuthStore } from "../../store";
import type { SettingsStackParams } from "../../navigation";
import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import { launchColors } from "@theme/tokens/launch-colors";
import { isFeatureHidden } from "../../features/liveops-config/final-release-feature-map";
import { SettingsProfileRow } from "./SettingsProfileRow";
import { SettingsSectionGroup } from "./SettingsSectionGroup";
import { buildSettingsGroups } from "./buildSettingsGroups";

type Props = NativeStackScreenProps<SettingsStackParams, "SettingsMain">;

export const SettingsScreen = withScreenErrorBoundary(function _SettingsScreen({
  navigation,
}: Props): React.JSX.Element {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [streakReminders, setStreakReminders] = useState(true);
  const [bossAlerts, setBossAlerts] = useState(true);
  const [squadNotifications, setSquadNotifications] = useState(true);
  const [rivalNotifications, setRivalNotifications] = useState(true);
  const showEconomyToggles =
    !isFeatureHidden("boss_tab") &&
    !isFeatureHidden("challenges") &&
    !isFeatureHidden("wagers");
  const [coachMessages, setCoachMessages] = useState(true);
  const [achievementUnlocks, setAchievementUnlocks] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleThemeChange = (newMode: ThemeMode) => setMode(newMode);
  const openPrivacyPolicy = () => Linking.openURL("https://vex.app/privacy");
  const openTerms = () => Linking.openURL("https://vex.app/terms");
  const openSupport = () => Linking.openURL("mailto:support@vex.app");

  const settingGroups = buildSettingsGroups({
    streakReminders, setStreakReminders,
    bossAlerts, setBossAlerts,
    squadNotifications, setSquadNotifications,
    rivalNotifications, setRivalNotifications,
    coachMessages, setCoachMessages,
    achievementUnlocks, setAchievementUnlocks,
    soundEffects, setSoundEffects,
    haptics, setHaptics,
    analyticsEnabled, setAnalyticsEnabled,
    mode, handleThemeChange, navigation,
    openSupport, openPrivacyPolicy, openTerms,
    navigateToCoach: () => navigation.navigate("CoachSettings"),
    navigateToNotifications: () => navigation.navigate("NotificationSettings"),
    navigateToAppearance: () => navigation.navigate("AppearanceSettings"),
    navigateToPrivacy: () => navigation.navigate("PrivacySettings"),
    navigateToAccount: () => navigation.navigate("AccountSettings"),
    navigateToLaneMode: () => navigation.navigate("LaneMode"),
  });

  const filteredGroups = settingGroups
    .filter(
      (g) =>
        g.title !== "Notifications" ||
        showEconomyToggles ||
        g.items.length > 1,
    )
    .map((g) => ({
      ...g,
      items:
        g.title === "Notifications"
          ? g.items.filter(
              (i) =>
                (i.id !== "boss-alerts" &&
                  i.id !== "squad-notifications" &&
                  i.id !== "rival-notifications") ||
                showEconomyToggles,
            )
          : g.items,
    }));

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box px={20} pb={16} pt={insets.top + 16}>
          <Text variant="h1">Settings</Text>
        </Box>

        <SettingsProfileRow
          displayName={user?.displayName || "User"}
          userId={user?.id || "user@example.com"}
          theme={theme}
          onPress={() => navigation.navigate("Main", { screen: "Profile" })}
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
            VEX v1.0.0 (Build 100)
          </Text>
          <Text
            variant="caption"
            color="text.tertiary"
            style={{ marginTop: 4 }}
          >
            Made with ♥ by the VEX Team
          </Text>
        </Box>

        <Pressable
          style={{
            marginHorizontal: 16,
            paddingVertical: 16,
            alignItems: "center",
            borderRadius: 12,
            backgroundColor: launchColors.hex_fee2e2,
            marginBottom: 16,
          }}
          onPress={logout}
          accessibilityLabel="Log Out button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text
            style={{ color: theme.colors.error.DEFAULT, fontWeight: "600" }}
          >
            Log Out
          </Text>
        </Pressable>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
}, "Settings");

export default SettingsScreen;
