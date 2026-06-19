import React from 'react';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';

interface GlassCardHighlightProps { resolvedRadius: number }

const topLightStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0.78)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 1 },
  locations: [0, 0.45, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0 },
  style: {
    borderRadius: 0,
    height: '56%',
    left: 0,
    opacity: 0.94,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
};

const mintGlowStyle: LinearGradientProps = {
  colors: ['rgba(66, 207, 174, 0.18)', 'rgba(132, 228, 229, 0.06)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 1 },
  locations: [0, 0.42, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0 },
  style: {
    borderRadius: 0,
    height: '55%',
    left: 0,
    opacity: 0.72,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9,
  },
};

const bottomShadowStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.03)', 'rgba(10, 94, 77, 0.06)'],
  end: { x: 1, y: 1 },
  locations: [0, 0.65, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0 },
  style: {
    borderRadius: 0,
    bottom: 0,
    height: '36%',
    left: 0,
    opacity: 0.56,
    position: 'absolute',
    right: 0,
    zIndex: 9,
  },
};

const rightEdgeStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0)', 'rgba(18, 184, 148, 0.13)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 0.5 },
  locations: [0, 0.5, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0.5 },
  style: {
    borderRadius: 0,
    bottom: 0,
    opacity: 0.62,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '10%',
    zIndex: 8,
  },
};

const leftEdgeStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0)'],
  end: { x: 1, y: 0.5 },
  locations: [0, 0.5, 1],
  pointerEvents: 'none',
  start: { x: 0, y: 0.5 },
  style: {
    borderRadius: 0,
    bottom: 0,
    left: 0,
    opacity: 0.55,
    position: 'absolute',
    top: 0,
    width: '8%',
    zIndex: 8,
  },
};

const shineStreakStyle: LinearGradientProps = {
  colors: ['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)'],
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

export function GlassCardTopLight({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  return (
    <LinearGradient
      {...topLightStyle}
      style={{ ...topLightStyle.style, borderRadius: resolvedRadius }}
    />
  );
}

export function GlassCardMintGlow({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  const style = React.useMemo(() => ({ ...mintGlowStyle.style, borderRadius: resolvedRadius }), [resolvedRadius]);
  return (
    <LinearGradient
      {...mintGlowStyle}
      style={style}
    />
  );
}

export function GlassCardBottomShadow({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  const style = React.useMemo(() => ({ ...bottomShadowStyle.style, borderRadius: resolvedRadius }), [resolvedRadius]);
  return (
    <LinearGradient
      {...bottomShadowStyle}
      style={style}
    />
  );
}

export function GlassCardRightEdge({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  const style = React.useMemo(() => ({ ...rightEdgeStyle.style, borderRadius: resolvedRadius }), [resolvedRadius]);
  return (
    <LinearGradient
      {...rightEdgeStyle}
      style={style}
    />
  );
}

export function GlassCardLeftEdge({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  const style = React.useMemo(() => ({ ...leftEdgeStyle.style, borderRadius: resolvedRadius }), [resolvedRadius]);
  return (
    <LinearGradient
      {...leftEdgeStyle}
      style={style}
    />
  );
}

export function GlassCardShineStreak({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  const style = React.useMemo(() => ({ ...shineStreakStyle.style, borderRadius: resolvedRadius }), [resolvedRadius]);
  return (
    <LinearGradient
      {...shineStreakStyle}
      style={style}
    />
  );
}
