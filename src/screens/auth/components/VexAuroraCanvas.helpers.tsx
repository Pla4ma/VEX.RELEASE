import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { lightColors } from '@/theme/tokens/colors';

/**
 * Animation helpers for VexAuroraCanvas
 * Extracted orbital animation setup and noise grain rendering
 */

export function useOrbitalAnimation(isReducedMotion: boolean) {
  const orbital = useSharedValue(0);

  React.useEffect(() => {
    if (isReducedMotion) {return;}
    orbital.value = withRepeat(withTiming(1, { duration: 12000 }), -1, true);
  }, [isReducedMotion, orbital]);

  const ring1 = useAnimatedStyle(() => ({
    opacity: 0.07 + orbital.value * 0.03,
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: 0.05 + (1 - orbital.value) * 0.03,
  }));

  return { ring1, ring2 };
}

export function renderNoiseGrain(): React.JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03 }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            borderRadius: 1,
            backgroundColor: lightColors.text.inverse,
            opacity: Math.random() * 0.5,
          }}
        />
      ))}
    </View>
  );
}
