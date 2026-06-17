/**
 * Confetti Particle Shape Component
 *
 * Individual particle shape renderer extracted from Particle.tsx.
 */

import React from 'react';
import Animated from 'react-native-reanimated';

export type Shape = 'circle' | 'square' | 'triangle';

interface ParticleShapeProps {
  shape: Shape;
  size: number;
  color: string;
  animatedStyle: object;
  particleStyle: object;
  shapeStyle: object;
  triangleStyle: object;
}

export function ParticleShape({
  shape,
  size,
  color,
  animatedStyle,
  particleStyle,
  shapeStyle,
  triangleStyle,
}: ParticleShapeProps): React.ReactNode {
  const circleShape = (
    <Animated.View
      style={[
        particleStyle,
        shapeStyle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );

  switch (shape) {
    case 'circle':
      return circleShape;
    case 'square':
      return (
        <Animated.View
          style={[
            particleStyle,
            shapeStyle,
            { width: size, height: size, backgroundColor: color },
            animatedStyle,
          ]}
        />
      );
    case 'triangle':
      return (
        <Animated.View
          style={[
            triangleStyle,
            {
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size,
              borderBottomColor: color,
            },
            animatedStyle,
          ]}
        />
      );
    default:
      return circleShape;
  }
}
