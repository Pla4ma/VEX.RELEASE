/**
 * Color Tokens
 *
 * Complete color palette for the VEX application.
 * Defines all colors used throughout the app with support for light and dark modes.
 */

import type { ColorPalette } from '../types';

/**
 * Light mode color palette
 */
export const lightColors: ColorPalette = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#4F46E5',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },

  success: {
    50: '#ECFDF5',
    500: '#15803D',
    light: '#86EFAC',
    DEFAULT: '#15803D',
    dark: '#15803D',
  },

  warning: {
    50: '#FFFBEB',
    500: '#92400E',
    light: '#FDE047',
    DEFAULT: '#92400E',
    dark: '#A16207',
  },

  error: {
    50: '#FEF2F2',
    500: '#B91C1C',
    light: '#FCA5A5',
    DEFAULT: '#B91C1C',
    dark: '#B91C1C',
  },

  info: {
    50: '#EFF6FF',
    500: '#1D4ED8',
    light: '#93C5FD',
    DEFAULT: '#1D4ED8',
    dark: '#1D4ED8',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#475569',
    muted: '#475569',
    inverse: '#FFFFFF',
    disabled: '#64748B',
    placeholder: '#64748B',
    link: '#4F46E5',
  },

  border: {
    light: '#E2E8F0',
    DEFAULT: '#CBD5E1',
    strong: '#94A3B8',
    focus: '#6366F1',
  },

  surface: {
    card: '#FFFFFF',
    input: '#FFFFFF',
    button: '#F1F5F9',
    hover: '#F1F5F9',
    pressed: '#E2E8F0',
    selected: '#EEF2FF',
  },

  accent: {
    purple: '#A855F7',
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F97316',
    pink: '#EC4899',
    teal: '#14B8A6',
  },
};

/**
 * Dark mode color palette
 */
export const darkColors: ColorPalette = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },

  success: {
    50: '#052E16',
    500: '#4ADE80',
    light: '#86EFAC',
    DEFAULT: '#4ADE80',
    dark: '#22C55E',
  },

  warning: {
    50: '#422006',
    500: '#FACC15',
    light: '#FDE047',
    DEFAULT: '#FACC15',
    dark: '#EAB308',
  },

  error: {
    50: '#450A0A',
    500: '#FCA5A5',
    light: '#FCA5A5',
    DEFAULT: '#FCA5A5',
    dark: '#EF4444',
  },

  info: {
    50: '#172554',
    500: '#93C5FD',
    light: '#93C5FD',
    DEFAULT: '#93C5FD',
    dark: '#3B82F6',
  },

  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
    elevated: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#CBD5E1',
    muted: '#CBD5E1',
    inverse: '#0F172A',
    disabled: '#94A3B8',
    placeholder: '#94A3B8',
    link: '#C7D2FE',
  },

  border: {
    light: '#334155',
    DEFAULT: '#475569',
    strong: '#64748B',
    focus: '#818CF8',
  },

  surface: {
    card: '#1E293B',
    input: '#334155',
    button: '#334155',
    hover: '#334155',
    pressed: '#475569',
    selected: '#312E81',
  },

  accent: {
    purple: '#C084FC',
    blue: '#60A5FA',
    green: '#34D399',
    orange: '#FB923C',
    pink: '#F472B6',
    teal: '#2DD4BF',
  },
};

/**
 * High contrast light mode for accessibility
 */
export const highContrastLightColors: ColorPalette = {
  ...lightColors,
  text: {
    ...lightColors.text,
    primary: '#000000',
    secondary: '#1A1A1A',
    muted: '#1A1A1A',
  },
  border: {
    ...lightColors.border,
    DEFAULT: '#000000',
    strong: '#000000',
  },
};

/**
 * High contrast dark mode for accessibility
 */
export const highContrastDarkColors: ColorPalette = {
  ...darkColors,
  text: {
    ...darkColors.text,
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    muted: '#E0E0E0',
  },
  border: {
    ...darkColors.border,
    DEFAULT: '#FFFFFF',
    strong: '#FFFFFF',
  },
};

/**
 * Get colors for a specific theme mode
 */
export function getColors(mode: 'light' | 'dark', highContrast = false): ColorPalette {
  if (mode === 'dark') {
    return highContrast ? highContrastDarkColors : darkColors;
  }
  return highContrast ? highContrastLightColors : lightColors;
}
