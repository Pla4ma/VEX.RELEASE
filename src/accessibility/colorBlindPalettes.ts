/**
 * Color-blind palette data for WCAG compliance.
 * These are alternative palettes required for accessibility, not UI styling.
 */


import type { ColorBlindType, ColorBlindPalette } from './types';
import { lightColors } from '@/theme/tokens/colors';

export const COLOR_BLIND_PALETTES: Record<ColorBlindType, ColorBlindPalette> = {
  none: {
    type: 'none',
    name: 'Standard',
    description: 'Default color vision',
    colors: {
      primary: lightColors.accent.blue,
      secondary: lightColors.accent.purple,
      success: lightColors.semantic.success,
      warning: lightColors.accent.orange,
      error: lightColors.semantic.danger,
      info: lightColors.accent.teal,
    },
    patterns: { success: '✓', warning: '⚠', error: '✕' },
  },
  protanopia: {
    type: 'protanopia',
    name: 'Protanopia (Red-Blind)',
    description: 'Cannot perceive red light',
    colors: {
      primary: lightColors.accent.blue,
      secondary: lightColors.accent.purple,
      success: lightColors.semantic.success,
      warning: lightColors.semantic.warning,
      error: lightColors.semantic.danger,
      info: lightColors.accent.teal,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  deuteranopia: {
    type: 'deuteranopia',
    name: 'Deuteranopia (Green-Blind)',
    description: 'Cannot perceive green light',
    colors: {
      primary: lightColors.accent.blue,
      secondary: lightColors.accent.purple,
      success: lightColors.semantic.success,
      warning: lightColors.semantic.warning,
      error: lightColors.semantic.danger,
      info: lightColors.accent.teal,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  tritanopia: {
    type: 'tritanopia',
    name: 'Tritanopia (Blue-Blind)',
    description: 'Cannot perceive blue light',
    colors: {
      primary: lightColors.accent.blue,
      secondary: lightColors.accent.purple,
      success: lightColors.semantic.success,
      warning: lightColors.accent.orange,
      error: lightColors.semantic.danger,
      info: lightColors.accent.teal,
    },
    patterns: { success: '●', warning: '◐', error: '○' },
  },
  achromatopsia: {
    type: 'achromatopsia',
    name: 'Achromatopsia (Total Color Blind)',
    description: 'Cannot perceive any color',
    colors: {
      primary: lightColors.text.tertiary,
      secondary: lightColors.text.muted,
      success: lightColors.semantic.backgroundMuted,
      warning: lightColors.text.disabled,
      error: lightColors.semantic.backgroundMuted,
      info: lightColors.text.muted,
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
