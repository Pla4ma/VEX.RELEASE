/**
 * Color-blind palette data for WCAG compliance.
 * These are alternative palettes required for accessibility, not UI styling.
 */


import type { ColorBlindType, ColorBlindPalette } from './types';

export const COLOR_BLIND_PALETTES: Record<ColorBlindType, ColorBlindPalette> = {
  none: {
    type: 'none',
    name: 'Standard',
    description: 'Default color vision',
    colors: {
      primary: '#4299e1',
      secondary: '#9f7aea',
      success: '#48bb78',
      warning: '#ed8936',
      error: '#e53e3e',
      info: '#38b2ac',
    },
    patterns: { success: '✓', warning: '⚠', error: '✕' },
  },
  protanopia: {
    type: 'protanopia',
    name: 'Protanopia (Red-Blind)',
    description: 'Cannot perceive red light',
    colors: {
      primary: '#3182ce',
      secondary: '#805ad5',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#9b2c2c',
      info: '#2c7a7b',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  deuteranopia: {
    type: 'deuteranopia',
    name: 'Deuteranopia (Green-Blind)',
    description: 'Cannot perceive green light',
    colors: {
      primary: '#2b6cb0',
      secondary: '#6b46c1',
      success: '#276749',
      warning: '#b7791f',
      error: '#742a2a',
      info: '#234e52',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  tritanopia: {
    type: 'tritanopia',
    name: 'Tritanopia (Blue-Blind)',
    description: 'Cannot perceive blue light',
    colors: {
      primary: '#2c5282',
      secondary: '#553c9a',
      success: '#2f855a',
      warning: '#c05621',
      error: '#9b2c2c',
      info: '#2c7a7b',
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  achromatopsia: {
    type: 'achromatopsia',
    name: 'Achromatopsia (Total Color Blind)',
    description: 'Cannot perceive any color',
    colors: {
      primary: '#4a5568',
      secondary: '#718096',
      success: '#2d3748',
      warning: '#a0aec0',
      error: '#1a202c',
      info: '#718096',
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
