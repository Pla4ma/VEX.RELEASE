import React from 'react';

import { LinearGradient } from 'expo-linear-gradient';

interface HighlightProps {
  color: string;
  radius?: number;
}

export function CardTopHighlight({ color, radius = 999 }: HighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={[color, 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.55, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={{
        borderRadius: radius,
        height: '50%',
        left: 0,
        opacity: 0.85,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 10,
      }}
    />
  );
}

export function CardInnerGlow({ color, radius = 999 }: HighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={[color, 'rgba(132, 228, 229, 0.04)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.45, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={{
        borderRadius: radius,
        height: '55%',
        left: 0,
        opacity: 0.65,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 9,
      }}
    />
  );
}

export function CardBottomShadow({ radius = 999 }: { radius?: number }): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.06)', 'rgba(10, 94, 77, 0.1)']}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.65, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={{
        borderRadius: radius,
        bottom: 0,
        height: '50%',
        left: 0,
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        zIndex: 9,
      }}
    />
  );
}

export function CardEdgeRefraction({ side }: { side: 'left' | 'right' }): JSX.Element {
  const colors = side === 'right'
    ? ['rgba(255, 255, 255, 0)', 'rgba(18, 184, 148, 0.06)', 'rgba(255, 255, 255, 0)'] as const
    : ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0)'] as const;
  const width = side === 'right' ? '12%' : '8%';
  const position: Record<string, string> = side === 'right' ? { right: '0' } : { left: '0' };

  return (
    <LinearGradient
      colors={colors}
      end={{ x: 1, y: 0.5 }}
      locations={[0, 0.5, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0.5 }}
      style={{
        borderRadius: 999,
        bottom: 0,
        opacity: side === 'right' ? 0.55 : 0.45,
        position: 'absolute',
        top: 0,
        width,
        zIndex: 8,
        ...position,
      }}
    />
  );
}

export function CardShineStreak({ radius = 999 }: { radius?: number }): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 0.85, y: 0.55 }}
      locations={[0, 0.45, 1]}
      pointerEvents="none"
      start={{ x: 0.15, y: 0.45 }}
      style={{
        borderRadius: radius,
        height: '25%',
        left: 0,
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        top: '15%',
        zIndex: 11,
      }}
    />
  );
}
