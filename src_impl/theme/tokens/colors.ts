import type { ColorPalette } from '../types';

const primary = {
  50: 'theme.colors.primary[500]', 100: 'theme.colors.primary[500]', 200: 'theme.colors.primary[500]', 300: 'theme.colors.primary[500]', 400: 'theme.colors.primary[500]',
  500: 'theme.colors.primary[500]', 600: 'theme.colors.primary[500]', 700: 'theme.colors.primary[500]', 800: 'theme.colors.primary[500]', 900: 'theme.colors.primary[500]', 950: 'theme.colors.primary[500]',
};

export const lightColors: ColorPalette = {
  primary: { ...primary, 500: 'theme.colors.primary[500]' },
  success: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.primary[500]', light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.primary[500]', dark: 'theme.colors.primary[500]' },
  warning: { 50: 'theme.colors.error.DEFAULT', 500: 'theme.colors.primary[500]', light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.primary[500]', dark: 'theme.colors.primary[500]' },
  error: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.primary[500]', light: 'theme.colors.error.DEFAULT', DEFAULT: 'theme.colors.primary[500]', dark: 'theme.colors.primary[500]' },
  info: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.primary[500]', light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.primary[500]', dark: 'theme.colors.primary[500]' },
  background: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.background.primary', tertiary: 'theme.colors.primary[500]', elevated: 'theme.colors.background.primary', overlay: 'rgba(7,17,31,0.38)' },
  text: {
    primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', tertiary: 'theme.colors.primary[500]', muted: 'theme.colors.primary[500]',
    inverse: 'theme.colors.background.primary', disabled: 'theme.colors.primary[500]', placeholder: 'theme.colors.primary[500]', link: 'theme.colors.primary[500]',
  },
  border: { light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.primary[500]', strong: 'theme.colors.primary[500]', focus: 'theme.colors.primary[500]' },
  surface: { card: 'theme.colors.background.primary', input: 'theme.colors.background.primary', button: 'theme.colors.primary[500]', hover: 'theme.colors.primary[500]', pressed: 'theme.colors.primary[500]', selected: 'theme.colors.primary[500]' },
  accent: { purple: 'theme.colors.primary[500]', blue: 'theme.colors.primary[500]', green: 'theme.colors.primary[500]', orange: 'theme.colors.primary[500]', pink: 'theme.colors.primary[500]', teal: 'theme.colors.primary[500]' },
  semantic: {
    background: 'theme.colors.primary[500]', backgroundElevated: 'theme.colors.background.primary', backgroundMuted: 'theme.colors.primary[500]',
    surface: 'theme.colors.background.primary', surfaceElevated: 'theme.colors.background.primary', surfaceGlass: 'rgba(255,255,255,0.86)',
    border: 'theme.colors.primary[500]', borderStrong: 'theme.colors.primary[500]', textPrimary: 'theme.colors.primary[500]',
    textSecondary: 'theme.colors.primary[500]', textMuted: 'theme.colors.primary[500]', textDisabled: 'theme.colors.primary[500]',
    primary: 'theme.colors.primary[500]', primaryPressed: 'theme.colors.primary[500]', primarySoft: 'rgba(91,77,255,0.12)',
    secondary: 'theme.colors.primary[500]', accent: 'theme.colors.primary[500]', success: 'theme.colors.primary[500]', warning: 'theme.colors.primary[500]',
    danger: 'theme.colors.primary[500]', info: 'theme.colors.primary[500]', overlay: 'rgba(7,17,31,0.38)',
    shadow: 'rgba(15,23,42,0.16)', inputBackground: 'theme.colors.background.primary', inputBorder: 'theme.colors.primary[500]',
    tabActive: 'theme.colors.primary[500]', tabInactive: 'theme.colors.primary[500]',
  },
};

export const darkColors: ColorPalette = {
  primary,
  success: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.success.DEFAULT', light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.success.DEFAULT', dark: 'theme.colors.primary[500]' },
  warning: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.primary[500]', light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.primary[500]', dark: 'theme.colors.primary[500]' },
  error: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.error.DEFAULT', light: 'theme.colors.error.DEFAULT', DEFAULT: 'theme.colors.error.DEFAULT', dark: 'theme.colors.primary[500]' },
  info: { 50: 'theme.colors.primary[500]', 500: 'theme.colors.primary[500]', light: 'theme.colors.primary[500]', DEFAULT: 'theme.colors.primary[500]', dark: 'theme.colors.primary[500]' },
  background: { primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', tertiary: 'theme.colors.primary[500]', elevated: 'theme.colors.primary[500]', overlay: 'rgba(0, 0, 0, 0.62)' },
  text: {
    primary: 'theme.colors.primary[500]', secondary: 'theme.colors.primary[500]', tertiary: 'theme.colors.primary[500]', muted: 'theme.colors.primary[500]',
    inverse: 'theme.colors.primary[500]', disabled: 'theme.colors.primary[500]', placeholder: 'theme.colors.primary[500]', link: 'theme.colors.primary[500]',
  },
  border: { light: 'rgba(226,232,240,0.13)', DEFAULT: 'rgba(226,232,240,0.18)', strong: 'rgba(226,232,240,0.28)', focus: 'theme.colors.primary[500]' },
  surface: { card: 'theme.colors.primary[500]', input: 'rgba(255,255,255,0.07)', button: 'theme.colors.primary[500]', hover: 'theme.colors.primary[500]', pressed: 'theme.colors.primary[500]', selected: 'rgba(139,92,246,0.18)' },
  accent: { purple: 'theme.colors.primary[500]', blue: 'theme.colors.primary[500]', green: 'theme.colors.primary[500]', orange: 'theme.colors.primary[500]', pink: 'theme.colors.primary[500]', teal: 'theme.colors.primary[500]' },
  semantic: {
    background: 'theme.colors.primary[500]', backgroundElevated: 'theme.colors.primary[500]', backgroundMuted: 'theme.colors.primary[500]',
    surface: 'theme.colors.primary[500]', surfaceElevated: 'theme.colors.primary[500]', surfaceGlass: 'rgba(255,255,255,0.07)',
    border: 'rgba(226,232,240,0.13)', borderStrong: 'rgba(226,232,240,0.24)',
    textPrimary: 'theme.colors.primary[500]', textSecondary: 'theme.colors.primary[500]', textMuted: 'theme.colors.primary[500]',
    textDisabled: 'theme.colors.primary[500]', primary: 'theme.colors.primary[500]', primaryPressed: 'theme.colors.primary[500]',
    primarySoft: 'rgba(139,92,246,0.18)', secondary: 'theme.colors.primary[500]', accent: 'theme.colors.primary[500]',
    success: 'theme.colors.success.DEFAULT', warning: 'theme.colors.primary[500]', danger: 'theme.colors.primary[500]', info: 'theme.colors.primary[500]',
    overlay: 'rgba(0,0,0,0.62)', shadow: 'rgba(0,0,0,0.5)',
    inputBackground: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(226,232,240,0.18)',
    tabActive: 'theme.colors.primary[500]', tabInactive: 'theme.colors.primary[500]',
  },
};

export const highContrastLightColors: ColorPalette = {
  ...lightColors,
  text: { ...lightColors.text, primary: 'theme.colors.text.primary', secondary: 'theme.colors.primary[500]', muted: 'theme.colors.primary[500]' },
  border: { ...lightColors.border, DEFAULT: 'theme.colors.text.primary', strong: 'theme.colors.text.primary' },
};
export const highContrastDarkColors: ColorPalette = {
  ...darkColors,
  text: { ...darkColors.text, primary: 'theme.colors.background.primary', secondary: 'theme.colors.primary[500]', muted: 'theme.colors.primary[500]' },
  border: { ...darkColors.border, DEFAULT: 'theme.colors.background.primary', strong: 'theme.colors.background.primary' },
};

export function getColors(mode: 'light' | 'dark', highContrast = false): ColorPalette {
  if (mode === 'dark') {
    return highContrast ? highContrastDarkColors : darkColors;
  }
  return highContrast ? highContrastLightColors : lightColors;
}
