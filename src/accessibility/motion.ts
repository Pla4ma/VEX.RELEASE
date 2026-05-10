/**
 * Motion and Animation Accessibility
 *
 * Reduced motion support and animation configurations
 */

import { AnimationConfig } from './types';

/**
 * Get animation configuration based on accessibility preferences
 */
export function getAnimationConfig(reducedMotion: boolean): AnimationConfig {
  return {
    duration: reducedMotion ? 0 : 300,
    easing: 'ease-in-out',
    reducedMotion: reducedMotion,
    useNativeDriver: true,
  };
}

/**
 * Get animation styles for reduced motion
 */
export function getAnimationStyles(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      // No animations for reduced motion preference
      animation: 'none',
      transition: 'none',
    };
  }

  return {
    // Default animation styles
    animationDuration: '300ms',
    animationTimingFunction: 'ease-in-out',
  };
}

/**
 * Calculate scaled font size based on text scale preference
 */
export function calculateScaledFontSize(baseSize: number, textScale: number): number {
  const scaled = baseSize * textScale;

  // Clamp to reasonable bounds (0.5x to 3x)
  return Math.max(baseSize * 0.5, Math.min(baseSize * 3, scaled));
}

/**
 * Get scaled typography configuration
 */
export function getScaledTypography(baseTypography: Record<string, unknown>, textScale: number) {
  return Object.keys(baseTypography).reduce((scaled, key) => {
    const original = baseTypography[key];

    if (typeof original === 'object' && original !== null && 'fontSize' in original && typeof (original as any).fontSize === 'number') {
      scaled[key] = {
        ...original,
        fontSize: calculateScaledFontSize((original as any).fontSize, textScale),
      };
    } else {
      scaled[key] = original;
    }

    return scaled;
  }, {} as Record<string, unknown>);
}
