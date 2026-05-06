/**
 * Theme Type Definitions
 *
 * TypeScript interfaces for the complete theme system.
 * Defines the structure for colors, typography, spacing, and more.
 */

import type { TextStyle } from 'react-native';

/**
 * Available theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Color palette structure
 */
export interface ColorPalette {
  // Primary brand colors
  primary: {
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

  // Semantic colors
  success: {
    50: string;
    500: string;
    light: string;
    DEFAULT: string;
    dark: string;
  };
  warning: {
    50: string;
    500: string;
    light: string;
    DEFAULT: string;
    dark: string;
  };
  error: {
    50: string;
    500: string;
    light: string;
    DEFAULT: string;
    dark: string;
  };
  info: {
    50: string;
    500: string;
    light: string;
    DEFAULT: string;
    dark: string;
  };

  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };

  // Text colors
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

  // Border colors
  border: {
    light: string;
    DEFAULT: string;
    strong: string;
    focus: string;
  };

  // UI element colors
  surface: {
    card: string;
    input: string;
    button: string;
    hover: string;
    pressed: string;
    selected: string;
  };

  // Accent colors for specific purposes
  accent: {
    purple: string;
    blue: string;
    green: string;
    orange: string;
    pink: string;
    teal: string;
  };
}

/**
 * Typography scale
 */
export interface TypographyScale {
  // Display text
  display: {
    large: TextStyle;
    medium: TextStyle;
    small: TextStyle;
  };

  // Headings
  heading: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    h4: TextStyle;
    h5: TextStyle;
    h6: TextStyle;
  };

  // Body text
  body: {
    large: TextStyle;
    medium: TextStyle;
    small: TextStyle;
  };

  // UI text
  ui: {
    button: TextStyle;
    label: TextStyle;
    caption: TextStyle;
    overline: TextStyle;
  };
}

/**
 * Font family configuration
 */
export interface FontFamilies {
  primary: string;
  secondary?: string;
  mono?: string;
}

/**
 * Font weight values
 */
export interface FontWeights {
  light: TextStyle['fontWeight'];
  regular: TextStyle['fontWeight'];
  medium: TextStyle['fontWeight'];
  semibold: TextStyle['fontWeight'];
  bold: TextStyle['fontWeight'];
  heavy: TextStyle['fontWeight'];
}

/**
 * Spacing scale (4px grid)
 */
export interface SpacingScale {
  0: number;
  1: number; // 4px
  2: number; // 8px
  3: number; // 12px
  4: number; // 16px
  5: number; // 20px
  6: number; // 24px
  8: number; // 32px
  10: number; // 40px
  12: number; // 48px
  16: number; // 64px
  20: number; // 80px
  24: number; // 96px
}

/**
 * Border radius scale
 */
export interface BorderRadiusScale {
  none: number;
  xs: number;
  sm: number;
  DEFAULT: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

/**
 * Shadow/Elevation scale
 */
export interface ShadowScale {
  none: string;
  xs: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

/**
 * Z-index scale
 */
export interface ZIndexScale {
  auto: 'auto';
  base: number;
  dropdown: number;
  sticky: number;
  fixed: number;
  modalBackdrop: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

/**
 * Breakpoint values (for responsive design)
 */
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

/**
 * Timing functions for animations
 */
export type TimingFunction =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring';

/**
 * Animation timing configuration
 */
export interface AnimationTiming {
  instant: number;
  fast: number;
  normal: number;
  slow: number;
  verySlow: number;
}

/**
 * Opacity values
 */
export interface OpacityScale {
  0: number;
  5: number;
  10: number;
  20: number;
  30: number;
  40: number;
  50: number;
  60: number;
  70: number;
  80: number;
  90: number;
  100: number;
}

/**
 * Complete theme object
 */
export interface Theme {
  name: string;
  mode: ThemeMode;
  colors: ColorPalette;
  typography: TypographyScale;
  fonts: FontFamilies;
  fontWeights: FontWeights;
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  zIndex: ZIndexScale;
  breakpoints: Breakpoints;
  animation: AnimationTiming;
  opacity: OpacityScale;
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  defaultMode: ThemeMode;
  supportDarkMode: boolean;
  persistThemePreference: boolean;
  respectSystemPreference: boolean;
  transitionOnChange: boolean;
  transitionDuration: number;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
  isSystem: boolean;
}

/**
 * Theme override/partial theme
 */
export type ThemeOverride = DeepPartial<Theme>;

/**
 * Deep partial type helper
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
