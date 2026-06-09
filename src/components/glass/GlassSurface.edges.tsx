import React from 'react';
import { View } from 'react-native';

interface EdgeHighlightProps {
  intensity: number;
  radius: number;
}

export function TopEdgeHighlight({ intensity, radius }: EdgeHighlightProps): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${intensity})`,
        borderTopLeftRadius: radius - 1,
        borderTopRightRadius: radius - 1,
        height: 1.5,
        left: 12,
        position: 'absolute',
        right: 12,
        top: 1.5,
      }}
    />
  );
}

export function SecondEdgeHighlight({ radius }: { radius: number }): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.52)',
        borderTopLeftRadius: radius - 2,
        borderTopRightRadius: radius - 2,
        height: 1,
        left: 18,
        position: 'absolute',
        right: 18,
        top: 3.5,
      }}
    />
  );
}

export function BottomEdgeShadow({ radius }: { radius: number }): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: 'rgba(13, 76, 65, 0.10)',
        borderBottomLeftRadius: radius - 1,
        borderBottomRightRadius: radius - 1,
        bottom: 1.5,
        height: 1.5,
        left: 14,
        position: 'absolute',
        right: 14,
      }}
    />
  );
}

interface GlowProps {
  color: string;
  opacity: number;
  radius: number;
}

export function GlassGlow({ color, opacity, radius }: GlowProps): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: color,
        borderRadius: radius,
        bottom: -8,
        left: -8,
        opacity,
        position: 'absolute',
        right: -8,
        top: -8,
      }}
    />
  );
}
