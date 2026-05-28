import React from "react";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { PERFECT_PARTICLE_COUNT } from "../utils/active-session";

export const PerfectFocusBurstParticle: React.FC<{
  color: string;
  index: number;
  progress: SharedValue<number>;
}> = ({ color, index, progress }) => {
  const angle = (Math.PI * 2 * index) / PERFECT_PARTICLE_COUNT;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(angle) * 54 * progress.value },
      { translateY: Math.sin(angle) * 54 * progress.value },
      { scale: progress.value },
    ],
  }));
  return (
    <Animated.View
      style={[
        { position: "absolute", width: 10, height: 10, borderRadius: 999 },
        { backgroundColor: color },
        style,
      ]}
    />
  );
};
