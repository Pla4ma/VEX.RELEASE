import React from "react";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
} from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export function LightningBolt({ delay }: { delay: number }): JSX.Element {
  const boltStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withDelay(delay, withTiming(1, { duration: 100 })),
        withTiming(0.3, { duration: 100 }),
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 500 }),
      ),
      2,
      false,
    ),
    transform: [
      {
        scale: withSequence(
          withDelay(delay, withSpring(1.5, { damping: 5 })),
          withTiming(1, { duration: 300 }),
        ),
      },
    ],
  }));
  return (
    <Animated.View style={[{ position: "absolute" }, boltStyle]}>
      <Text fontSize={40}>⚡</Text>
    </Animated.View>
  );
}

export function EnergyBurst(): JSX.Element {
  const { theme } = useTheme();
  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(3, { damping: 5, stiffness: 100 }) }],
    opacity: withSequence(
      withTiming(0.8, { duration: 200 }),
      withTiming(0, { duration: 600 }),
    ),
  }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: `${theme.colors.accent.purple}60`,
        },
        burstStyle,
      ]}
    />
  );
}
