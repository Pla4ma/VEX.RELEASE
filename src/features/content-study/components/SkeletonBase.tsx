import React, { useEffect } from "react";
import {
  View,
  Dimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../../theme";
import { styles } from "./skeleton-styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 12,
  borderRadius = 6,
  style,
}) => {
  const { theme } = useTheme();
  const shimmerAnim = useSharedValue(-1);
  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false,
    );
  }, [shimmerAnim]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerAnim.value * SCREEN_WIDTH }],
  }));
  const widthStyle: ViewStyle = { width: width as ViewStyle["width"] };
  return (
    <View
      style={[
        styles.container,
        {
          height,
          borderRadius,
          backgroundColor: theme.colors.background.secondary,
        },
        widthStyle,
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
};

export { Skeleton };
export type { SkeletonProps };
export default Skeleton;
