import React, { useCallback, useState } from "react";
import { Alert, Pressable, Switch } from "react-native";
import { useTheme } from "../../theme";
import { Box, Text, Card } from "../../components/primitives";
import { Icon } from "../../icons";
import { launchColors } from "@theme/tokens/launch-colors";

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export const NotificationScheduleSection: React.FC = () => {
  const { theme } = useTheme();
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: false,
    start: "22:00",
    end: "08:00",
  });

  const handleQuietHoursToggle = useCallback(() => {
    setQuietHours((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const updateQuietTime = (type: "start" | "end", time: string) => {
    setQuietHours((prev) => ({ ...prev, [type]: time }));
  };

  const handleSetQuietHours = useCallback((type: "start" | "end") => {
    Alert.alert(
      `Set ${type === "start" ? "Start" : "End"} Time`,
      "Choose a time",
      [
        { text: "20:00", onPress: () => updateQuietTime(type, "20:00") },
        { text: "21:00", onPress: () => updateQuietTime(type, "21:00") },
        { text: "22:00", onPress: () => updateQuietTime(type, "22:00") },
        { text: "23:00", onPress: () => updateQuietTime(type, "23:00") },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }, []);

  return (
    <Box px={16} mb={24}>
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
        QUIET HOURS
      </Text>
      <Card size="sm" style={{ overflow: "hidden" }}>
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
          onPress={handleQuietHoursToggle}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Box
            width={40}
            height={40}
            borderRadius={10}
            justifyContent="center"
            alignItems="center"
            style={{
              backgroundColor: quietHours.enabled
                ? theme.colors.primary[50]
                : theme.colors.background.secondary,
            }}
          >
            <Icon
              name="moon"
              size={20}
              color={
                quietHours.enabled
                  ? theme.colors.primary[500]
                  : theme.colors.text.tertiary
              }
            />
          </Box>
          <Box flex={1} ml={12}>
            <Text
              variant="body"
              style={{
                fontWeight: "500",
                color: theme.colors.text.primary,
              }}
            >
              Quiet Hours
            </Text>
            <Text
              variant="caption"
              color="text.secondary"
              style={{ marginTop: 2 }}
            >
              No notifications during this time
            </Text>
          </Box>
          <Switch
            value={quietHours.enabled}
            onValueChange={handleQuietHoursToggle}
            trackColor={{
              false: theme.colors.background.tertiary,
              true: theme.colors.primary[500] + "80",
            }}
            thumbColor={
              quietHours.enabled
                ? theme.colors.primary[500]
                : launchColors.hex_fff
            }
          />
        </Pressable>
        {quietHours.enabled && (
          <>
            <Box
              height={1}
              style={{ backgroundColor: theme.colors.border.light }}
            />
            <Box flexDirection="row" px={16} py={12}>
              <Pressable
                style={{ flex: 1, marginRight: 8 }}
                onPress={() => handleSetQuietHours("start")}
                accessibilityLabel="Start button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Box
                  p={12}
                  borderRadius={8}
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderWidth: 1,
                    borderColor: theme.colors.border.light,
                  }}
                >
                  <Text variant="caption" color="text.secondary">
                    Start
                  </Text>
                  <Text
                    variant="body"
                    style={{ fontWeight: "600", marginTop: 4 }}
                  >
                    {quietHours.start}
                  </Text>
                </Box>
              </Pressable>
              <Box justifyContent="center">
                <Icon
                  name="arrow-right"
                  size={16}
                  color={theme.colors.text.tertiary}
                />
              </Box>
              <Pressable
                style={{ flex: 1, marginLeft: 8 }}
                onPress={() => handleSetQuietHours("end")}
                accessibilityLabel="End button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                <Box
                  p={12}
                  borderRadius={8}
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderWidth: 1,
                    borderColor: theme.colors.border.light,
                  }}
                >
                  <Text variant="caption" color="text.secondary">
                    End
                  </Text>
                  <Text
                    variant="body"
                    style={{ fontWeight: "600", marginTop: 4 }}
                  >
                    {quietHours.end}
                  </Text>
                </Box>
              </Pressable>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};
