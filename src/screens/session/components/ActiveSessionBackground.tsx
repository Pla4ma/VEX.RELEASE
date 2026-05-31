import React from 'react';
import { View } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

type ActiveSessionBackgroundProps = {
  accentOverlay: string;
  colors: [string, string, string];
};

export function ActiveSessionBackground({
  accentOverlay,
  colors,
}: ActiveSessionBackgroundProps): JSX.Element {
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
