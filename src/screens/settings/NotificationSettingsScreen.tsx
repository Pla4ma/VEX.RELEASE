import { withScreenErrorBoundary } from "../../shared/ui/components/ScreenErrorBoundary";
import React, { useCallback, useState } from "react";
import { ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../../theme";
import { Box, Text, Card } from "../../components/primitives";
import { Icon } from "../../icons";
import { useUIStore } from "../../store/index";
import type { SettingsStackParams } from "../../navigation";
import { launchColors } from "@theme/tokens/launch-colors";
import { NotificationCategoryToggle } from "./NotificationCategoryToggle";
import { NotificationScheduleSection } from "./NotificationScheduleSection";

type Props = NativeStackScreenProps<
  SettingsStackParams,
  "NotificationSettings"
>;

const notificationGroups = [
  {
    title: "Streaks & Progress",
    items: [
      {
        id: "streakReminders",
        icon: "flame",
        title: "Streak Reminders",
        description: "Get reminded before your streak resets",
      },
      {
        id: "weeklyReport",
        icon: "bar-chart",
        title: "Weekly Report",
        description: "Summary of your focus stats every Sunday",
      },
      {
        id: "achievementUnlocks",
        icon: "trophy",
        title: "Achievement Unlocks",
        description: "When you earn a new achievement",
      },
    ],
  },
  {
    title: "Battles & Social",
    items: [
      {
        id: "bossAlerts",
        icon: "sword",
        title: "Boss Alerts",
        description: "When a new boss appears or is about to escape",
      },
      {
        id: "squadNotifications",
        icon: "users",
        title: "Squad Updates",
        description: "Squad challenges, messages, and invites",
      },
      {
        id: "rivalNotifications",
        icon: "crosshair",
        title: "Rival Activity",
        description: "When rivals complete a session or pass you",
      },
    ],
  },
  {
    title: "Sessions & Coach",
    items: [
      {
        id: "sessionReminders",
        icon: "clock",
        title: "Session Reminders",
        description: "Reminders to complete your daily session",
      },
      {
        id: "coachMessages",
        icon: "message-circle",
        title: "Coach Messages",
        description: "Tips and encouragement from your AI Coach",
      },
      {
        id: "dailyChallenge",
        icon: "target",
        title: "Daily Challenge",
        description: "New challenges available each day",
      },
    ],
  },
];

export const NotificationSettingsScreen: React.FC<Props> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useUIStore();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    streakReminders: true,
    bossAlerts: true,
    squadNotifications: true,
    rivalNotifications: true,
    weeklyReport: true,
    coachMessages: true,
    achievementUnlocks: true,
    sessionReminders: true,
    dailyChallenge: true,
  });

  const handleToggle = useCallback((id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSendTestNotification = useCallback(() => {
    Alert.alert(
      "Test Notification",
      "A test notification has been scheduled.",
      [{ text: "OK" }],
    );
  }, []);

  return (
    <Box flex={1} style={{ backgroundColor: theme.colors.background.primary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box
          px={20}
          pb={16}
          pt={insets.top + 16}
          flexDirection="row"
          alignItems="center"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Icon
              name="arrow-left"
              size={24}
              color={theme.colors.text.primary}
            />
          </Pressable>
          <Text variant="h2">Notifications</Text>
        </Box>

        <NotificationScheduleSection />

        {notificationGroups.map((group) => (
          <Box key={group.title} px={16} mb={24}>
            <Text
              variant="caption"
              color="text.secondary"
              style={{
                marginLeft: 12,
                marginBottom: 8,
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              {group.title.toUpperCase()}
            </Text>
            <Card size="sm" style={{ overflow: "hidden" }}>
              {group.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <NotificationCategoryToggle
                    item={item}
                    value={toggles[item.id] ?? false}
                    onToggle={handleToggle}
                  />
                  {index < group.items.length - 1 && (
                    <Box
                      height={1}
                      ml={68}
                      style={{ backgroundColor: theme.colors.border.light }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Card>
          </Box>
        ))}

        <Box px={16} mb={24}>
          <Pressable
            onPress={handleSendTestNotification}
            style={{
              backgroundColor: theme.colors.primary[500],
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
            accessibilityLabel="Send Test Notification button"
            accessibilityRole="button"
            accessibilityHint="Activates this control"
          >
            <Box flexDirection="row" alignItems="center">
              <Icon name="bell" size={18} color={launchColors.hex_fff} />
              <Text
                style={{
                  color: launchColors.hex_fff,
                  fontWeight: "600",
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                Send Test Notification
              </Text>
            </Box>
          </Pressable>
        </Box>

        <Box height={insets.bottom + 20} />
      </ScrollView>
    </Box>
  );
};

export default withScreenErrorBoundary(
  NotificationSettingsScreen,
  "NotificationSettings",
);
