/**
 * Animation configuration and typography scaling utilities.
 */

import type { AnimationConfig } from './types';

export function getAnimationConfig(
  baseDuration: number,
  reducedMotion: boolean,
): AnimationConfig {
  if (reducedMotion) {
    return { duration: 0, easing: 'linear', useReducedMotion: true };
  }
  return {
    duration: baseDuration,
    easing: 'ease-in-out',
    useReducedMotion: false,
  };
}

export function getAnimationStyles(
  animation: 'fade' | 'slide' | 'scale' | 'none',
  reducedMotion: boolean,
): Record<string, string | number> {
  if (reducedMotion || animation === 'none') {
    return { transition: 'none', animation: 'none' };
  }
  const configs = {
    fade: { transition: 'opacity 300ms ease-in-out' },
    slide: { transition: 'transform 300ms ease-in-out' },
    scale: {
      transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
    },
  } satisfies Record<string, Record<string, string | number>>;
  return configs[animation] ?? configs.fade;
}

export function calculateScaledFontSize(
  baseSize: number,
  scale: number,
): number {
  const cappedScale = Math.min(scale, 2.0);
  return Math.round(baseSize * cappedScale);
}

export function getScaledTypography(
  scale: number,
): Record<string, { fontSize: number; lineHeight: number }> {
  const baseSizes = {
    h1: { fontSize: 32, lineHeight: 40 },
    h2: { fontSize: 24, lineHeight: 32 },
    h3: { fontSize: 20, lineHeight: 28 },
    body: { fontSize: 16, lineHeight: 24 },
    small: { fontSize: 14, lineHeight: 20 },
    caption: { fontSize: 12, lineHeight: 16 },
  };
  const scaled: Record<string, { fontSize: number; lineHeight: number }> = {};
  for (const [key, value] of Object.entries(baseSizes)) {
    scaled[key] = {
      fontSize: calculateScaledFontSize(value.fontSize, scale),
      lineHeight: calculateScaledFontSize(value.lineHeight, scale),
    };
  }
  return scaled;
}
