import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TopAccentBarProps {
  color: string;
  radius: number;
}

export function TopAccentBar({ color, radius }: TopAccentBarProps): React.ReactNode {
  return (
    <>
      <LinearGradient
        colors={[color, `${color}AA`, 'rgba(66, 207, 174, 0.0)']}
        end={{ x: 1, y: 0 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          height: 6,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          height: 1,
          left: 24,
          position: 'absolute',
          right: 24,
          top: 6,
        }}
      />
    </>
  );
}
