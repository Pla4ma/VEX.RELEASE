import React from 'react';
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
  const droplets = Array.from({ length: count }).map((_, i) => {
    const size = 4 + (i % 2) * 3 + Math.random() * 2;
    const xOffset = Math.sin(i * 1.7) * spread;
    const yOffset = Math.cos(i * 2.3) * spread * 0.6;
    return { size, xOffset, yOffset, key: i };
  });

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: spread * 2,
        height: spread * 1.2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {droplets.map((d) => (
        <View
          key={d.key}
          style={{
            position: 'absolute',
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: `rgba(255, 255, 255, ${opacity * 0.85})`,
            left: spread + d.xOffset - d.size / 2,
            top: spread * 0.5 + d.yOffset - d.size / 2,
            boxShadow: `0px 1px 3px rgba(136, 213, 197, NaN)`,
          }}
        />
      ))}
    </View>
  );
};

export default FloatingDroplets;
