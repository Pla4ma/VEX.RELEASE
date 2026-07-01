import React, { useEffect } from 'react';
import { ImageBackground, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../../hooks/useReducedMotion';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

// SAFETY: require() needed for Metro asset bundling. Assets are resolved at build time.
const ENTRY_BACKGROUND = require('../../../../../assets/auth/vex-liquid-glass-entry-clean.png');

export const EtherealSkyBackground = React.memo(function EtherealSkyBackground(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      pulse.value = 0.35;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );
  }, [isReducedMotion, pulse]);

  const focusGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pulse.value * 0.14,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <ImageBackground
        resizeMode="cover"
        source={ENTRY_BACKGROUND}
        style={{
          position: 'absolute',
          top: -44,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: '8%',
            right: '8%',
            bottom: '10%',
            height: 260,
            borderRadius: 130,
            backgroundColor: vexLightGlass.mint[200],
          },
          focusGlowStyle,
        ]}
      />
    </View>
  );
});
