import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Icon } from "../../../icons";
import { useTheme } from "../../../theme";
import type { PresetWithIcon } from "../utils/session-setup";

type SessionAdvancedOptionsProps = {
  onToggle: () => void;
  selectedDurationSeconds: number;
  selectedPreset: PresetWithIcon;
  showAdvanced: boolean;
};

export function SessionAdvancedOptions({
  onToggle,
  selectedDurationSeconds,
  selectedPreset,
  showAdvanced,
}: SessionAdvancedOptionsProps) {
  const { theme } = useTheme();

  return (
    <Box px="lg" mt="lg">
      <Pressable
        onPress={onToggle}
        accessibilityLabel="Advanced options button"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <Box flexDirection="row" alignItems="center" py="md">
          <Text variant="label" color="text.secondary">
            Advanced options
          </Text>
          <Box ml="sm">
            <Icon
              name={showAdvanced ? "chevron-up" : "chevron-down"}
              size="sm"
              color={theme.colors.text.secondary}
            />
          </Box>
        </Box>
      </Pressable>

      {showAdvanced ? (
        <Animated.View entering={FadeInDown.duration(250)}>
          <Box p="lg" bg="background.secondary" borderRadius="lg" mb="lg">
            <Text variant="label" mb="md">
              SESSION DETAILS
            </Text>
            <Box flexDirection="row" justifyContent="space-between" mb="md">
              <Text variant="body">Duration</Text>
              <Text
                variant="body"
                fontWeight="600"
              >{`${Math.round(selectedDurationSeconds / 60)} min`}</Text>
            </Box>
            <Box flexDirection="row" justifyContent="space-between" mb="md">
              <Text variant="body">Intervals</Text>
              <Text variant="body" fontWeight="600">
                {selectedPreset.intervals}
              </Text>
            </Box>
            <Box flexDirection="row" justifyContent="space-between" mb="md">
              <Text variant="body">Break Duration</Text>
              <Text
                variant="body"
                fontWeight="600"
              >{`${Math.round(selectedPreset.breakDuration / 60)} min`}</Text>
            </Box>
            <Box flexDirection="row" justifyContent="space-between">
              <Text variant="body">Strict Mode</Text>
              <Text variant="body" fontWeight="600">
                {selectedPreset.strictMode ? "On" : "Off"}
              </Text>
            </Box>
          </Box>
        </Animated.View>
      ) : null}
    </Box>
  );
}
