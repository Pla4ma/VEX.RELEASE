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
import { notificationGroups } from "./notification-groups";

type Props = NativeStackScreenProps<
  SettingsStackParams,
  "NotificationSettings"
>;

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
