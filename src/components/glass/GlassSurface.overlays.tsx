import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TopHighlightProps { color: string; stop: number; radius: number }

  const viewStyle_56 = {
  backgroundColor: color, borderRadius: radius,
  bottom: -10, left: -10, opacity: opacity * 1.4,
  position: 'absolute', right: -10, top: -10,
};
export function TopHighlight({ color, stop, radius }: TopHighlightProps): React.ReactNode {
  return (
    <LinearGradient
      colors={[color, 'rgba(255, 255, 255, 0)']} end={{ x: 0, y: 1 }}
      locations={[0, stop]} start={{ x: 0, y: 0 }}
      style={{
        borderTopLeftRadius: radius, borderTopRightRadius: radius,
        bottom: 0, left: 0, position: 'absolute', right: 0, top: 0,
      }}
    />
  );
}

interface BottomTintProps { color: string; stop: number }

export function BottomTint({ color, stop }: BottomTintProps): React.ReactNode {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', color]} end={{ x: 0, y: 1 }}
      locations={[stop, 1]} start={{ x: 0, y: 0 }}
      style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
    />
  );
}

interface TopAccentBarProps { color: string; radius: number }

export function TopAccentBar({ color, radius }: TopAccentBarProps): React.ReactNode {
  return (
    <>
      <LinearGradient
        colors={[color, `${color}CC`, 'rgba(66, 207, 174, 0.0)']}
        end={{ x: 1, y: 0 }} locations={[0, 0.5, 1]} start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: radius, borderTopRightRadius: radius,
          height: 7, left: 0, position: 'absolute', right: 0, top: 0,
        }}
      />
      <View pointerEvents="none" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)', height: 1.5,
        left: 20, position: 'absolute', right: 20, top: 7,
      }} />
    </>
  );
}

interface GlassGlowProps { color: string; opacity: number; radius: number }

export function GlassGlow({ color, opacity, radius }: GlassGlowProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={viewStyle_56} />
  );
}
