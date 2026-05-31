/**
 * Color-blind palette data for WCAG compliance.
 * These are alternative palettes required for accessibility, not UI styling.
 */

import { launchColors } from '@theme/tokens/launch-colors';
import type { ColorBlindType, ColorBlindPalette } from './types';

export const COLOR_BLIND_PALETTES: Record<ColorBlindType, ColorBlindPalette> = {
  none: {
    type: 'none',
    name: 'Standard',
    description: 'Default color vision',
    colors: {
      primary: launchColors.hex_4299e1,
      secondary: launchColors.hex_9f7aea,
      success: launchColors.hex_48bb78,
      warning: launchColors.hex_ed8936,
      error: launchColors.hex_e53e3e,
      info: launchColors.hex_38b2ac,
    },
    patterns: { success: '✓', warning: '⚠', error: '✕' },
  },
  protanopia: {
    type: 'protanopia',
    name: 'Protanopia (Red-Blind)',
    description: 'Cannot perceive red light',
    colors: {
      primary: launchColors.hex_3182ce,
      secondary: launchColors.hex_805ad5,
      success: launchColors.hex_38a169,
      warning: launchColors.hex_d69e2e,
      error: launchColors.hex_9b2c2c,
      info: launchColors.hex_2c7a7b,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  deuteranopia: {
    type: 'deuteranopia',
    name: 'Deuteranopia (Green-Blind)',
    description: 'Cannot perceive green light',
    colors: {
      primary: launchColors.hex_2b6cb0,
      secondary: launchColors.hex_6b46c1,
      success: launchColors.hex_276749,
      warning: launchColors.hex_b7791f,
      error: launchColors.hex_742a2a,
      info: launchColors.hex_234e52,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  tritanopia: {
    type: 'tritanopia',
    name: 'Tritanopia (Blue-Blind)',
    description: 'Cannot perceive blue light',
    colors: {
      primary: launchColors.hex_2c5282,
      secondary: launchColors.hex_553c9a,
      success: launchColors.hex_2f855a,
      warning: launchColors.hex_c05621,
      error: launchColors.hex_9b2c2c,
      info: launchColors.hex_2c7a7b,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  achromatopsia: {
    type: 'achromatopsia',
    name: 'Achromatopsia (Total Color Blind)',
    description: 'Cannot perceive any color',
    colors: {
      primary: launchColors.hex_4a5568,
      secondary: launchColors.hex_718096,
      success: launchColors.hex_2d3748,
      warning: launchColors.hex_a0aec0,
      error: launchColors.hex_1a202c,
      info: launchColors.hex_718096,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
};

export function getAccessibleColor(
  colorType: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info',
  colorBlindMode: ColorBlindType,
): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].colors[colorType];
}

export function getStatusPattern(
  status: 'success' | 'warning' | 'error',
  colorBlindMode: ColorBlindType,
): string {
  return COLOR_BLIND_PALETTES[colorBlindMode].patterns[status];
}
