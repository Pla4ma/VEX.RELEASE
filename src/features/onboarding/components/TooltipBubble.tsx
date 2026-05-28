import React from "react";
import { Pressable, Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface Tooltip {
  id: number;
  title: string;
  message: string;
  target: "streak" | "boss" | "challenges";
  position: {
    x: number;
    y: number;
  };
  arrowDirection: "up" | "down" | "left" | "right";
}

export function TooltipBubble({
  tooltip,
  isActive,
  onDismiss,
}: {
  tooltip: Tooltip;
  isActive: boolean;
  onDismiss: () => void;
}): JSX.Element | null {
  const { theme } = useTheme();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(
          withTiming(0.8, { duration: 100 }),
          withSpring(1, { damping: 12, stiffness: 200 }),
        ),
      },
    ],
  }));

  if (!isActive) {
    return <></>;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[
        {
          position: "absolute",
          left: Math.min(tooltip.position.x, SCREEN_WIDTH - 280),
          top: tooltip.position.y,
          width: 260,
          zIndex: 1001,
        },
        bounceStyle,
      ]}
    >
      <Pressable
        onPress={onDismiss}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <Box
          p="lg"
          borderRadius="xl"
          bg="background.elevated"
          borderWidth={2}
          borderColor="primary.500"
          style={{
            shadowColor: theme.colors.background.elevated,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mb="sm"
          >
            <Text variant="caption" color="primary.500" fontWeight="700">
              Tip {tooltip.id} of 3
            </Text>
            <Text variant="caption" color="text.tertiary">
              Tap to continue ›
            </Text>
          </Box>

          <Text variant="h4" color="text.primary" mb="xs">
            {tooltip.title}
          </Text>

          <Text variant="body" color="text.secondary">
            {tooltip.message}
          </Text>
        </Box>

        <Box
          style={{
            position: "absolute",
            [tooltip.arrowDirection === "up" ? "bottom" : "top"]: -10,
            left: "50%",
            marginLeft: -10,
            width: 0,
            height: 0,
            backgroundColor: "transparent",
            borderStyle: "solid",
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: tooltip.arrowDirection === "up" ? 0 : 10,
            borderBottomWidth: tooltip.arrowDirection === "up" ? 10 : 0,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor:
              tooltip.arrowDirection === "up"
                ? theme.colors.primary[500]
                : "transparent",
            borderBottomColor:
              tooltip.arrowDirection === "up"
                ? "transparent"
                : theme.colors.primary[500],
          }}
        />
      </Pressable>
    </Animated.View>
  );
}

export function TooltipOverlay({
  isVisible,
  onPress,
}: {
  isVisible: boolean;
  onPress: () => void;
}): JSX.Element {
  const { theme } = useTheme();

  if (!isVisible) {
    return <></>;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${theme.colors.background.primary}80`,
        zIndex: 1000,
      }}
    >
      <Pressable
        onPress={onPress}
        style={{ flex: 1 }}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      />
    </Animated.View>
  );
}
