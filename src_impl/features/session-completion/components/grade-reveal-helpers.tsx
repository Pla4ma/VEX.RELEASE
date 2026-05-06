import React from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

export const PARTICLE_COUNT = 12;

export const GRADE_REVEAL_COLORS: Record<string, string> = {
  A: '#22C55E',
  B: '#3B82F6',
  C: '#94A3B8',
  D: '#EF4444',
  S: '#FFD700',
};

export function hexToRgba(color: string, alpha: number): string {
  if (!color.startsWith('#')) {return color;}
  const raw = color.length === 4
    ? color.slice(1).split('').map((part) => `${part}${part}`).join('')
    : color.slice(1);
  const red = parseInt(raw.slice(0, 2), 16);
  const green = parseInt(raw.slice(2, 4), 16);
  const blue = parseInt(raw.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function BurstParticle({
  color,
  index,
  progress,
}: {
  color: string;
  index: number;
  progress: SharedValue<number>;
}): JSX.Element {
  const angle = (Math.PI * 2 * index) / PARTICLE_COUNT;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(angle) * 130 * progress.value },
      { translateY: Math.sin(angle) * 130 * progress.value },
      { scale: 0.4 + progress.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: color,
          borderRadius: 9999,
          height: 10,
          position: 'absolute',
          width: 10,
        },
        style,
      ]}
    />
  );
}
