import React from 'react';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';

interface HighlightProps {
  color: string;
  radius?: number;
}

const topHighlightStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 1 },
  locations: [0, 0.55, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0 },
  style: {
    borderRadius: 0,
    height: '50%',
    left: 0,
    opacity: 0.85,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
};

const innerGlowStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0)', 'rgba(132, 228, 229, 0.04)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 1 },
  locations: [0, 0.45, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0 },
  style: {
    borderRadius: 0,
    height: '55%',
    left: 0,
    opacity: 0.65,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9,
  },
};

const bottomShadowStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.06)', 'rgba(10, 94, 77, 0.1)'],
  end: { x: 1, y: 1 },
  locations: [0, 0.65, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0 },
  style: {
    borderRadius: 0,
    bottom: 0,
    height: '50%',
    left: 0,
    opacity: 0.7,
    position: 'absolute',
    right: 0,
    zIndex: 9,
  },
};

const edgeRefractionRightStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0)', 'rgba(18, 184, 148, 0.06)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 0.5 },
  locations: [0, 0.5, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0.5 },
  style: {
    borderRadius: 0,
    bottom: 0,
    opacity: 0.55,
    position: 'absolute',
    top: 0,
    width: '12%',
    zIndex: 8,
    right: 0,
  },
};

const edgeRefractionLeftStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 0.5 },
  locations: [0, 0.5, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0.5 },
  style: {
    borderRadius: 0,
    bottom: 0,
    opacity: 0.45,
    position: 'absolute',
    top: 0,
    width: '8%',
    zIndex: 8,
    left: 0,
  },
};

const shineStreakStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)'],
  end: { x: 0.85, y: 0.55 },
  locations: [0, 0.45, 1],
  pointerEvents: 'none',
  start: { x: 0.15, y: 0.45 },
  style: {
    borderRadius: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.38,
  },
};

export function CardTopHighlight({ color, radius = 999 }: HighlightProps): React.ReactNode {
  const style = { ...topHighlightStyle.style, borderRadius: radius };
  return (
    <LinearGradient
      colors={[color, 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.55, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={style}
    />
  );
}

export function CardInnerGlow({ color, radius = 999 }: HighlightProps): React.ReactNode {
  const style = { ...innerGlowStyle.style, borderRadius: radius };
  return (
    <LinearGradient
      colors={[color, 'rgba(132, 228, 229, 0.04)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.45, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={style}
    />
  );
}

export function CardBottomShadow({ radius = 999 }: { radius?: number }): React.ReactNode {
  const style = { ...bottomShadowStyle.style, borderRadius: radius };
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.06)', 'rgba(10, 94, 77, 0.1)']}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.65, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0 }}
      style={style}
    />
  );
}

export function CardEdgeRefraction({ side }: { side: 'left' | 'right' }): React.ReactNode {
  const style = side === 'right'
    ? { ...edgeRefractionRightStyle.style, borderRadius: 999 }
    : { ...edgeRefractionLeftStyle.style, borderRadius: 999 };

  return (
    <LinearGradient
      colors={side === 'right' ? edgeRefractionRightStyle.colors : edgeRefractionLeftStyle.colors}
      end={{ x: 1, y: 0.5 }}
      locations={[0, 0.5, 1]}
      pointerEvents="none"
      start={{ x: 0, y: 0.5 }}
      style={style}
    />
  );
}

export function CardShineStreak({ radius = 999 }: { radius?: number }): React.ReactNode {
  const style = { ...shineStreakStyle.style, borderRadius: radius };
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 0.85, y: 0.55 }}
      locations={[0, 0.45, 1]}
      pointerEvents="none"
      start={{ x: 0.15, y: 0.45 }}
      style={style}
    />
  );
}
