import type { TextStyle } from 'react-native';

export interface TypographyScale {
  display: { large: TextStyle; medium: TextStyle; small: TextStyle };
  heading: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    h4: TextStyle;
    h5: TextStyle;
    h6: TextStyle;
  };
  body: { large: TextStyle; medium: TextStyle; small: TextStyle };
  ui: {
    button: TextStyle;
    label: TextStyle;
    caption: TextStyle;
    overline: TextStyle;
  };
}

export interface FontFamilies {
  primary: string;
  secondary?: string;
  mono?: string;
}

export interface FontWeights {
  light: TextStyle['fontWeight'];
  regular: TextStyle['fontWeight'];
  medium: TextStyle['fontWeight'];
  semibold: TextStyle['fontWeight'];
  bold: TextStyle['fontWeight'];
  heavy: TextStyle['fontWeight'];
}

export interface SpacingScale {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  8: number;
  10: number;
  12: number;
  16: number;
  20: number;
  24: number;
}

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

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export type TimingFunction =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'spring';

export interface AnimationTiming {
  instant: number;
  fast: number;
  normal: number;
  slow: number;
  verySlow: number;
}

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
