import React from "react";
import { ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme, ThemeMode } from "../../theme";
import { Box, Text } from "../../components/primitives";
import { useAuthStore } from "../../store";
import type { SettingsStackParams } from "../../navigation";
import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import { isFeatureHidden } from "../../features/liveops-config/final-release-feature-map";
import { useSettingsStore } from "../../features/settings/store";
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
    !isFeatureHidden("boss_tab") &&
    !isFeatureHidden("challenges") &&
    !isFeatureHidden("wagers");

  const handleThemeChange = (newMode: ThemeMode) => setMode(newMode);
  const openPrivacyPolicy = () => Linking.openURL("https://vex.app/privacy");
  const openTerms = () => Linking.openURL("https://vex.app/terms");
  const openSupport = () => Linking.openURL("mailto:support@vex.app");

  const settingGroups = buildSettingsGroups({
    streakReminders, setStreakReminders: (v) => setPreference("streakReminders", v),
    bossAlerts, setBossAlerts: (v) => setPreference("bossAlerts", v),
    squadNotifications, setSquadNotifications: (v) => setPreference("squadNotifications", v),
    rivalNotifications, setRivalNotifications: (v) => setPreference("rivalNotifications", v),
    coachMessages, setCoachMessages: (v) => setPreference("coachMessages", v),
    achievementUnlocks, setAchievementUnlocks: (v) => setPreference("achievementUnlocks", v),
    soundEffects, setSoundEffects: (v) => setPreference("soundEffects", v),
    haptics, setHaptics: (v) => setPreference("haptics", v),
    analyticsEnabled, setAnalyticsEnabled: (v) => setPreference("analyticsEnabled", v),
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
            backgroundColor: theme.colors.error.light,
            marginBottom: 16,
          }}
          onPress={logout}
          accessibilityLabel="Log out"
          accessibilityRole="button"
          accessibilityHint="Double tap to change setting"
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
