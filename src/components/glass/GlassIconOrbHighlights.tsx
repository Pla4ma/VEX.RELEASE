import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassIconOrbHighlightsProps {
  size: number;
}

      
export function GlassIconOrbHighlights({
  size,
}: GlassIconOrbHighlightsProps): React.ReactNode {
  return (
    <>
      <LinearGradient
        colors={['rgba(255,255,255,0.78)', 'rgba(255,255,255,0)']}
        end={{ x: 0.85, y: 0.85 }}
        start={{ x: 0.18, y: 0.14 }}
        style={{
          borderRadius: size / 2,
          height: size * 0.84,
          position: 'absolute',
          transform: [{ rotate: '22deg' }],
          width: size * 0.84,
        }}
      />
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 0.7, y: 0.9 }}
        start={{ x: 0.2, y: 0.05 }}
        style={{
          borderRadius: size / 2,
          height: size * 0.72,
          left: size * 0.10,
          opacity: 0.72,
          position: 'absolute',
          top: size * 0.06,
          transform: [{ rotate: '-18deg' }],
          width: size * 0.42,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          borderColor: 'rgba(255,255,255,0.62)',
          borderRadius: size / 2,
          borderWidth: 1,
          height: size * 0.72,
          opacity: 0.82,
          position: 'absolute',
          transform: [{ rotate: '-24deg' }],
          width: size * 0.72,
        }}
      />
      <View
        pointerEvents="none"
        style={{}}
      />
    </>
  );
}

export default GlassIconOrbHighlights;
