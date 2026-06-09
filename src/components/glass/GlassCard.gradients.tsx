import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardHighlightProps { resolvedRadius: number }

export function GlassCardTopLight({ resolvedRadius }: GlassCardHighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.52)', 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 1 }} locations={[0, 0.45, 1]} pointerEvents="none" start={{ x: 0, y: 0 }}
      style={{
        borderRadius: resolvedRadius, height: '50%', left: 0, opacity: 0.88,
        position: 'absolute', right: 0, top: 0, zIndex: 10,
      }}
    />
  );
}

export function GlassCardMintGlow({ resolvedRadius }: GlassCardHighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(132, 228, 229, 0.14)', 'rgba(132, 228, 229, 0.04)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 1 }} locations={[0, 0.42, 1]} pointerEvents="none" start={{ x: 0, y: 0 }}
      style={{
        borderRadius: resolvedRadius, height: '55%', left: 0, opacity: 0.72,
        position: 'absolute', right: 0, top: 0, zIndex: 9,
      }}
    />
  );
}

export function GlassCardBottomShadow({ resolvedRadius }: GlassCardHighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.08)', 'rgba(10, 94, 77, 0.16)']}
      end={{ x: 1, y: 1 }} locations={[0, 0.65, 1]} pointerEvents="none" start={{ x: 0, y: 0 }}
      style={{
        borderRadius: resolvedRadius, bottom: 0, height: '50%', left: 0, opacity: 0.88,
        position: 'absolute', right: 0, zIndex: 9,
      }}
    />
  );
}

export function GlassCardRightEdge({ resolvedRadius }: GlassCardHighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', 'rgba(18, 184, 148, 0.08)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 0.5 }} locations={[0, 0.5, 1]} pointerEvents="none" start={{ x: 0, y: 0.5 }}
      style={{
        borderRadius: resolvedRadius, bottom: 0, opacity: 0.62,
        position: 'absolute', right: 0, top: 0, width: '10%', zIndex: 8,
      }}
    />
  );
}

export function GlassCardLeftEdge({ resolvedRadius }: GlassCardHighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 1, y: 0.5 }} locations={[0, 0.5, 1]} pointerEvents="none" start={{ x: 0, y: 0.5 }}
      style={{
        borderRadius: resolvedRadius, bottom: 0, left: 0, opacity: 0.55,
        position: 'absolute', top: 0, width: '8%', zIndex: 8,
      }}
    />
  );
}

export function GlassCardShineStreak({ resolvedRadius }: GlassCardHighlightProps): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
      end={{ x: 0.85, y: 0.55 }} locations={[0, 0.45, 1]} pointerEvents="none" start={{ x: 0.15, y: 0.45 }}
      style={{
        borderRadius: resolvedRadius, height: '22%', left: 0, opacity: 0.78,
        position: 'absolute', right: 0, top: '10%', zIndex: 11,
      }}
    />
  );
}
