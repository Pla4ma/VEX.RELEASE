import React, { useEffect, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../../../components/primitives";
import { useTheme } from "../../../theme";

type Props = { label: string; value: number; max?: 25; color: string };

export function TechniqueBar({
  label,
  value,
  max = 25,
  color,
}: Props): JSX.Element {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, value / max)), {
      duration: 700,
    });
  }, [max, progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: trackWidth * progress.value,
  }));
  const onLayout = (event: LayoutChangeEvent) =>
    setTrackWidth(event.nativeEvent.layout.width);

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {label}
        </Text>
        <Text variant="caption" color={theme.colors.text.primary}>
          {value}/{max}
        </Text>
      </View>
      <View
        onLayout={onLayout}
        style={{
          height: 6,
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: theme.colors.background.tertiary,
        }}
      >
        <Animated.View
          style={[
            { height: 6, borderRadius: 3, backgroundColor: color },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}
