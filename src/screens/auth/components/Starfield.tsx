import { lightColors } from '@/theme/tokens/colors';
﻿import React, { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface ParticleSpec {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const PARTICLE_COUNT = 48;
const PARTICLES: ParticleSpec[] = Array.from({ length: PARTICLE_COUNT }).map(
  () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.2 + 0.4,
    delay: Math.random() * 5000,
    duration: Math.random() * 3000 + 2500,
  }),
);

function Star({ spec }: { spec: ParticleSpec }): React.ReactNode {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, { duration: spec.duration }),
        -1,
        true,
      ),
    );
  }, [opacity, spec.delay, spec.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${spec.x}%`,
          top: `${spec.y}%`,
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          backgroundColor: lightColors.text.inverse,
        },
        animatedStyle,
      ]}
    />
  );
}

export const Starfield = memo(function Starfield(): React.ReactNode {
  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
      pointerEvents="none"
    >
      {PARTICLES.map((p) => (
        <Star key={`star-${p.x.toFixed(4)}-${p.y.toFixed(4)}`} spec={p} />
      ))}
    </View>
  );
});
