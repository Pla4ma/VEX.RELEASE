import React from "react";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Box, Text } from "@/components/primitives";
import type { SharedValue } from "react-native-reanimated";

interface NearMissProgressBarProps {
  progressPercent: number;
  progressStyle: ReturnType<typeof useAnimatedStyle>;
  pulseStyle: ReturnType<typeof useAnimatedStyle>;
  errorColor: string;
  tertiaryBg: string;
  tertiaryText: string;
}

export const NearMissProgressBar: React.FC<NearMissProgressBarProps> = ({
  progressPercent,
  progressStyle,
  pulseStyle,
  errorColor,
  tertiaryBg,
  tertiaryText,
}) => (
  <Box mb={5}>
    <Box
      height={12}
      borderRadius={6}
      bg={tertiaryBg}
      style={{ overflow: "hidden" }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={tertiaryBg}
      />

      <Animated.View
        style={[
          {
            height: "100%",
            backgroundColor: errorColor,
            borderRadius: 6,
          },
          progressStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            position: "absolute",
            right: 0,
            top: -2,
            bottom: -2,
            width: 4,
            backgroundColor: errorColor,
            borderRadius: 2,
          },
          pulseStyle,
        ]}
      />
    </Box>

    <Box flexDirection="row" justifyContent="space-between" mt={2}>
      <Text variant="caption" color={tertiaryText}>
        0%
      </Text>
      <Text
        variant="caption"
        color={errorColor}
        fontWeight="bold"
      >
        {Math.round(progressPercent)}%
      </Text>
      <Text variant="caption" color={tertiaryText}>
        100%
      </Text>
    </Box>
  </Box>
);
