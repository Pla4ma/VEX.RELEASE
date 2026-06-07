import React from 'react';
import { BlurView } from 'expo-blur';

import type { GlassSurfaceVariant } from './GlassSurface.tokens';

interface GlassBlurLayerProps {
  radius: number;
  variant?: GlassSurfaceVariant;
  selected?: boolean;
}

function intensityForVariant(
  variant: GlassSurfaceVariant | undefined,
  selected: boolean,
): number {
  if (selected) {return 36;}
  if (variant === 'premium') {return 48;}
  if (variant === 'hero') {return 42;}
  if (variant === 'strong') {return 38;}
  if (variant === 'subtle') {return 24;}
  return 32;
}

export function GlassBlurLayer({
  radius,
  variant,
  selected = false,
}: GlassBlurLayerProps): JSX.Element {
  return (
    <BlurView
      intensity={intensityForVariant(variant, selected)}
      pointerEvents="none"
      tint="light"
      style={{
        borderRadius: radius,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    />
  );
}

export default GlassBlurLayer;
