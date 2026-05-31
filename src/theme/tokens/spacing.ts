/**
 * Spacing Tokens
 *
 * 4px grid-based spacing system for consistent layout throughout the app.
 */

import type { SpacingScale } from '../types';

/**
 * Base spacing unit in pixels
 */
export const SPACING_UNIT = 4;

/**
 * Complete spacing scale following 4px grid
 */
export const spacing: SpacingScale = {
  0: 0,
  1: SPACING_UNIT * 1, // 4px
  2: SPACING_UNIT * 2, // 8px
  3: SPACING_UNIT * 3, // 12px
  4: SPACING_UNIT * 4, // 16px
  5: SPACING_UNIT * 5, // 20px
  6: SPACING_UNIT * 6, // 24px
  8: SPACING_UNIT * 8, // 32px
  10: SPACING_UNIT * 10, // 40px
  12: SPACING_UNIT * 12, // 48px
  16: SPACING_UNIT * 16, // 64px
  20: SPACING_UNIT * 20, // 80px
  24: SPACING_UNIT * 24, // 96px
};

/**
 * Spacing scale for specific use cases
 */
export const layoutSpacing = {
  // Screen padding
  screen: {
    horizontal: spacing[4],
    vertical: spacing[4],
    top: spacing[6],
    bottom: spacing[6],
  },

  // Section spacing
  section: {
    small: spacing[4],
    medium: spacing[6],
    large: spacing[8],
    xlarge: spacing[12],
  },

  // Element spacing
  element: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
  },

  // Component padding
  padding: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
  },

  // Gap between items
  gap: {
    xs: spacing[1],
    sm: spacing[2],
    md: spacing[3],
    lg: spacing[4],
    xl: spacing[6],
  },
};

/**
 * Get spacing value
 */
export function getSpacing(key: keyof SpacingScale): number {
  return spacing[key] ?? 0;
}

/**
 * Calculate spacing for multiple values
 */
export function calculateSpacing(
  top: keyof SpacingScale,
  right?: keyof SpacingScale,
  bottom?: keyof SpacingScale,
  left?: keyof SpacingScale,
): { top: number; right: number; bottom: number; left: number } {
  return {
    top: getSpacing(top),
    right: getSpacing(right ?? top),
    bottom: getSpacing(bottom ?? top),
    left: getSpacing(left ?? right ?? top),
  };
}
