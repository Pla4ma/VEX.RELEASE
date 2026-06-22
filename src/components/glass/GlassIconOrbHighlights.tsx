import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';

interface GlassIconOrbHighlightsProps {
  size: number;
}

const outerGradientStyle: LinearGradientProps = {
  colors: ['rgba(255,255,255,0.78)', 'rgba(255,255,255,0)'],
  end: { x: 0.85, y: 0.85 },
  start: { x: 0.18, y: 0.14 },
  style: {
    borderRadius: 0,
    height: 0,
    position: 'absolute',
    transform: [{ rotate: '22deg' }],
    width: 0,
  },
};

const innerGradientStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0)'],
  end: { x: 0.7, y: 0.9 },
  start: { x: 0.2, y: 0.05 },
  style: {
    borderRadius: 0,
    height: 0,
    left: 0,
    opacity: 0.72,
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '-18deg' }],
    width: 0,
  },
};

const borderViewStyle: ViewStyle = {
  borderColor: 'rgba(255,255,255,0.62)',
  borderRadius: 0,
  borderWidth: 1,
  height: 0,
  opacity: 0.82,
  position: 'absolute',
  transform: [{ rotate: '-24deg' }],
  width: 0,
};

export function GlassIconOrbHighlights({
  size,
}: GlassIconOrbHighlightsProps): React.ReactNode {
  const outerStyle: LinearGradientProps = {
    ...outerGradientStyle,
    style: { ...outerGradientStyle.style, borderRadius: size / 2, height: size * 0.84, width: size * 0.84 },
  };

  const innerStyle: LinearGradientProps = {
    ...innerGradientStyle,
    style: {
      ...innerGradientStyle.style,
      borderRadius: size / 2,
      height: size * 0.72,
      left: size * 0.10,
      top: size * 0.06,
      width: size * 0.42,
    },
  };

  const borderStyle: ViewStyle = {
    ...borderViewStyle,
    borderRadius: size / 2,
    height: size * 0.72,
    width: size * 0.72,
  };

  return (
    <>
      <LinearGradient {...outerStyle} />
      <LinearGradient {...innerStyle} />
      <View pointerEvents="none" style={borderStyle} />
      <View pointerEvents="none" style={{}} />
    </>
  );
}

export { GlassIconOrbHighlights }