/**
 * Color Blind Support
 *
 * Color-blind friendly palettes and utilities
 */

import { ColorBlindType, ColorBlindPalette } from './types';
import { COLOR_BLIND_PALETTES } from './constants';
import { checkContrast } from './contrast';

/**
 * Get accessible color for current color blind mode
 */
export function getAccessibleColor(
  colorType: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info',
  colorBlindMode: ColorBlindType
): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].colors[colorType];
}

/**
 * Get pattern indicator for status
 */
export function getStatusPattern(
  status: 'success' | 'warning' | 'error',
  colorBlindMode: ColorBlindType
): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].patterns[status];
}

/**
 * Get all available color blind palettes
 */
export function getColorBlindPalettes(): Record<ColorBlindType, ColorBlindPalette> {
  return COLOR_BLIND_PALETTES;
}

/**
 * Check if a color is accessible for a given color blind type
 */
export function isColorAccessibleForColorBlind(
  color: string,
  colorBlindMode: ColorBlindType,
  backgroundColor: string = '#FFFFFF'
): boolean {
  const palette = COLOR_BLIND_PALETTES[colorBlindMode];

  // Check if color is in the accessible palette
  const isAccessibleColor = Object.values(palette.colors).includes(color);

  if (isAccessibleColor) {
    return true;
  }

  // For non-palette colors, check contrast
  const { passesAA } = checkContrast(color, backgroundColor);
  return passesAA;
}

// Re-export checkContrast for convenience
export { checkContrast } from './contrast';
