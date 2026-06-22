/**
 * GodRays — soft volumetric light beams descending from the
 * top of the screen, driving the "cathedral glow" effect.
 * Static (motion stripped for performance).
 */
import React, { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Blur, Canvas, Group, RoundedRect } from '@shopify/react-native-skia';

const RAY_COUNT = 6;

type RaySpec = {
  xOffset: number;
  width: number;
  opacity: number;
};

function buildRays(): RaySpec[] {
  const rays: RaySpec[] = [];
  for (let i = 0; i < RAY_COUNT; i += 1) {
    const span = 100 / RAY_COUNT;
    const xOffset = span * i + span * 0.5;
    const width = 60 + ((i * 37) % 40);
    const opacity = 0.08 + ((i * 13) % 10) / 100;
    rays.push({ xOffset, width, opacity });
  }
  return rays;
}

type RayBeamProps = {
  width: number;
  height: number;
  xOffset: number;
  xWidth: number;
  opacity: number;
};

function RayBeam({
  width,
  height,
  xOffset,
  xWidth,
  opacity,
}: RayBeamProps): React.JSX.Element {
  const centerX = (xOffset / 100) * width;
  return (
    <Group opacity={opacity} transform={[{ translateX: centerX }, { translateY: 0 }]}>
      <RoundedRect
        color="#FFFBEF"
        height={height}
        r={xWidth}
        width={xWidth}
        x={-xWidth / 2}
        y={0}
      >
        <Blur blur={28} />
      </RoundedRect>
    </Group>
  );
}

export function GodRays(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const rays = useMemo(buildRays, []);

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
      <Canvas style={{ width, height }}>
        {rays.map((ray, i) => (
          <RayBeam
            key={`ray-${ray.xOffset}`}
            height={height * 0.9}
            opacity={ray.opacity}
            width={width}
            xOffset={ray.xOffset}
            xWidth={ray.width}
          />
        ))}
      </Canvas>
    </View>
  );
}
