import React, { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View } from 'react-native';

interface FloatingDropletsProps {
  count?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
  spread?: number;
  size?: number;
}

export const FloatingDroplets: React.FC<FloatingDropletsProps> = ({
  count = 3,
  top,
  left,
  right,
  bottom,
  opacity = 0.45,
  spread = 40,
}) => {
  const containerStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width: spread * 2,
      height: spread * 1.2,
      alignItems: 'center',
      justifyContent: 'center',
    }),
    [spread, top, left, right, bottom],
  );

  const droplets = Array.from({ length: count }).map((_, i) => {
    const size = 4 + (i % 2) * 3 + Math.random() * 2;
    const xOffset = Math.sin(i * 1.7) * spread;
    const yOffset = Math.cos(i * 2.3) * spread * 0.6;
    const dropletStyle: ViewStyle = {
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: `rgba(255, 255, 255, ${opacity * 0.85})`,
      left: spread + xOffset - size / 2,
      top: spread * 0.5 + yOffset - size / 2,
      boxShadow: '0px 1px 3px rgba(136, 213, 197, 0.3)',
    };
    return { size, xOffset, yOffset, key: i, style: dropletStyle };
  });

  return (
    <View pointerEvents="none" style={containerStyle}>
      {droplets.map((d) => (
        <View key={d.key} style={d.style} />
      ))}
    </View>
  );
};
