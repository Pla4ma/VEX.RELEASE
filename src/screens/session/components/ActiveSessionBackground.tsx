import React, { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { lightColors } from '@/theme/tokens/colors';

type ActiveSessionBackgroundProps = {
  accentOverlay: string;
  colors: [string, string, string];
  accentColor?: string;
};

export function ActiveSessionBackground({
  accentOverlay,
  colors,
  accentColor,
}: ActiveSessionBackgroundProps): JSX.Element {
  const { width, height } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: 20000 }),
      -1,
      true,
    );
  }, [isReducedMotion, drift]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: isReducedMotion ? 0 : (drift.value - 0.5) * 16,
      },
      {
        translateY: isReducedMotion ? 0 : (drift.value - 0.5) * 12,
      },
    ],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <ExpoLinearGradient
        colors={colors}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {accentColor ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: width * 0.8,
              height: width * 0.8,
              borderRadius: (width * 0.8) / 2,
              backgroundColor: `${accentColor || lightColors.semantic.vexCyan}10`,
              top: height * 0.15,
              left: width * 0.1,
            },
            orbStyle,
          ]}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: accentOverlay,
        }}
      />
    </Animated.View>
  );
}

export default ActiveSessionBackground;
