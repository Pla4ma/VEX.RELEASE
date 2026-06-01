import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuroraField } from '../../../components/primitives/AuroraField';

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
  const auroraSize = Math.max(width, height) * 1.3;

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
        <AuroraField
          colors={[accentColor]}
          size={auroraSize}
          intensity={0.14}
          style={{
            top: height * 0.5 - auroraSize / 2,
            left: width * 0.5 - auroraSize / 2,
          }}
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
