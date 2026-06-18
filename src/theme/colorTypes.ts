export type ThemeMode = 'light' | 'dark' | 'system';

type BrandScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

type StateScale = {
  50: string;
  500: string;
  light: string;
  DEFAULT: string;
  dark: string;
};

export type { SemanticColors } from './semanticColors';

import type { SemanticColors } from './semanticColors';

export interface ColorPalette {
  primary: BrandScale;
  success: StateScale;
  warning: StateScale;
  error: StateScale;
  info: StateScale;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
    disabled: string;
    placeholder: string;
    link: string;
  };
  border: { light: string; DEFAULT: string; strong: string; focus: string };
  surface: {
    card: string;
    input: string;
    button: string;
    hover: string;
    pressed: string;
    selected: string;
  };
  accent: {
    purple: string;
    blue: string;
    green: string;
    orange: string;
    pink: string;
    teal: string;
    active: string;
    settled: string;
    rescue: string;
    editorial: string;
    premium: string;
    reflection: string;
  };
  semantic: SemanticColors;
}
