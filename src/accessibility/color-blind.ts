/**
 * Color Blind Support
 *
 * Color-blind friendly palettes and utilities
 */

import { ColorBlindType, ColorBlindPalette } from './types';
import { COLOR_BLIND_PALETTES } from './constants';
import { checkContrast } from './contrast';
import { lightColors } from '@/theme/tokens/colors';
const FALLBACK_COLOR = lightColors.text.primary;

const STATUS_PATTERNS: Record<
  ColorBlindType,
  Record<'success' | 'warning' | 'error', string>
> = {
  none: { success: 'solid', warning: 'solid', error: 'solid' },
  protanopia: {
    success: 'diagonal-stripes',
    warning: 'dots',
    error: 'cross-hatch',
  },
  deuteranopia: {
    success: 'diagonal-stripes',
    warning: 'dots',
    error: 'cross-hatch',
  },
  tritanopia: {
    success: 'horizontal-stripes',
    warning: 'dots',
    error: 'vertical-stripes',
  },
  achromatopsia: {
    success: 'diagonal-stripes',
    warning: 'dots',
    error: 'cross-hatch',
  },
};

/**
 * Get accessible color for current color blind mode
 */
export function getAccessibleColor(
  colorType: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info',
  colorBlindMode: ColorBlindType,
): string {
  const palette = COLOR_BLIND_PALETTES[colorBlindMode];
  if (!palette) {
    return FALLBACK_COLOR;
  }
  return palette.colors[colorType] ?? FALLBACK_COLOR;
}

/**
 * Get pattern indicator for status that works alongside color
 * encoding so users with color blindness can still distinguish state.
 */
export function getStatusPattern(
  status: 'success' | 'warning' | 'error',
  colorBlindMode: ColorBlindType,
): string {
  return STATUS_PATTERNS[colorBlindMode][status];
}

/**
 * Get all available color blind palettes
 */
export function getColorBlindPalettes(): Record<string, ColorBlindPalette> {
  return COLOR_BLIND_PALETTES;
}

/**
 * Check if a color is accessible for a given color blind type
 */
export function isColorAccessibleForColorBlind(
  color: string,
  colorBlindMode: ColorBlindType,
  backgroundColor: string = lightColors.text.inverse,
): boolean {
  const palette = COLOR_BLIND_PALETTES[colorBlindMode];

  if (palette) {
    const isAccessibleColor = Object.values(palette.colors).includes(color);
    if (isAccessibleColor) {
      return true;
    }
  }

  const { passesAA } = checkContrast(color, backgroundColor);
  return passesAA;
}

// Re-export checkContrast for convenience
export { checkContrast } from './contrast';
