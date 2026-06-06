/**
 * LightFlare — slow, large ambient light flare.
 * Static (motion stripped for performance).
 */
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Blur, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';

type LightFlareColor = [string, string, string];

type LightFlareProps = {
  anchorXPercent?: number;
  anchorYPercent?: number;
  size?: number;
  color?: LightFlareColor;
  periodMs?: number;
};

const DEFAULT_COLOR: LightFlareColor = [
  'rgba(255, 240, 200, 0.45)',
  'rgba(255, 220, 180, 0.18)',
  'rgba(255, 220, 180, 0)',
];

export function LightFlare({
  anchorXPercent = 50,
  anchorYPercent = 22,
  size = 260,
  color = DEFAULT_COLOR,
  periodMs: _periodMs = 9000,
}: LightFlareProps): React.JSX.Element {
  const { width, height } = useWindowDimensions();

  const centerX = (anchorXPercent / 100) * width;
  const centerY = (anchorYPercent / 100) * height;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Canvas
        style={{
          position: 'absolute',
          top: centerY - size,
          left: centerX - size,
          width: size * 2,
          height: size * 2,
        }}
      >
        <Group transform={[{ translateX: size }, { translateY: size }]}>
          <Circle cx={0} cy={0} r={size}>
            <RadialGradient c={vec(0, 0)} colors={color} r={size} />
            <Blur blur={40} />
          </Circle>
        </Group>
      </Canvas>
    </View>
  );
}
