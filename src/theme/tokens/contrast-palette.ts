import type { ColorPalette } from '../types';
import { lightColors } from './primary-palette';
import { darkColors } from './dark-palette';

export const highContrastLightColors: ColorPalette = {
  ...lightColors,
  text: {
    ...lightColors.text,
    primary: '#000000',
    secondary: '#1A1A1A',
    muted: '#1A1A1A',
  },
  border: { ...lightColors.border, DEFAULT: '#000000', strong: '#000000' },
};
export const highContrastDarkColors: ColorPalette = {
  ...darkColors,
  text: {
    ...darkColors.text,
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    muted: '#E0E0E0',
  },
  border: { ...darkColors.border, DEFAULT: '#FFFFFF', strong: '#FFFFFF' },
};

export function getColors(
  mode: 'light' | 'dark',
  highContrast = false,
): ColorPalette {
  if (mode === 'dark') {
    return highContrast ? highContrastDarkColors : darkColors;
  }
  return highContrast ? highContrastLightColors : lightColors;
}

export const accessibilityPalette = {
  neutral: {
    primary: '#0066CC',
    secondary: '#00AA66',
    success: '#00AA66',
    warning: '#FF6600',
    error: '#CC0033',
    info: '#0066CC',
    accent: '#FF6600',
    background: '#FFFFFF',
    text: '#000000',
  },
  deuteranopia: {
    primary: '#0066CC',
    secondary: '#FF6600',
    success: '#0066CC',
    warning: '#FF6600',
    error: '#AA00AA',
    info: '#0066CC',
    accent: '#AA00AA',
    background: '#FFFFFF',
    text: '#000000',
  },
  tritanopia: {
    primary: '#CC0066',
    secondary: '#FF6600',
    success: '#00AA66',
    warning: '#FF6600',
    error: '#CC0066',
    info: '#CC0066',
    accent: '#00AA66',
    background: '#FFFFFF',
    text: '#000000',
  },
  achromatopsia: {
    primary: '#333333',
    secondary: '#666666',
    success: '#333333',
    warning: '#666666',
    error: '#000000',
    info: '#333333',
    accent: '#999999',
    background: '#FFFFFF',
    text: '#000000',
  },
} as const;

export type AccessibilityPaletteName = keyof typeof accessibilityPalette;
