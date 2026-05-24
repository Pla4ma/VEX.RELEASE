import type { ComponentSpacing, ContainerGap, ContainerMargin, ContainerPadding, FlexSpacing, GridSpacing, SectionSpacing } from './types';

export interface TypographyTheme {
  font_families: FontFamily[];
  font_sizes: FontSizes;
  font_weights: FontWeights;
  line_heights: LineHeights;
  letter_spacing: LetterSpacing;
  text_styles: TextStyle[];
}

export interface FontFamily {
  name: string;
  stack: string[];
  category: FontCategory;
  fallback: string;
  loading: FontLoading;
}

export type FontCategory =
  | 'serif'
  | 'sans_serif'
  | 'monospace'
  | 'cursive'
  | 'fantasy'
  | 'display';

export interface FontLoading {
  strategy: LoadingStrategy;
  preload: boolean;
  fallback_display: FallbackDisplay;
}

export type LoadingStrategy =
  | 'block'
  | 'swap'
  | 'fallback'
  | 'optional';

export type FallbackDisplay =
  | 'block'
  | 'swap'
  | 'fallback'
  | 'optional';

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface FontWeights {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

export interface LineHeights {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface TextStyle {
  name: string;
  font_family: string;
  font_size: string;
  font_weight: number;
  line_height: number;
  letter_spacing: string;
  color: string;
  text_transform: TextTransform;
  text_decoration: TextDecoration;
  usage: string[];
}

export type TextTransform =
  | 'none'
  | 'capitalize'
  | 'uppercase'
  | 'lowercase';

export type TextDecoration =
  | 'none'
  | 'underline'
  | 'overline'
  | 'line_through';

export interface SpacingTheme {
  scale: SpacingScale;
  spacing: SpacingValues;
  layout: LayoutSpacing;
  components: ComponentSpacing;
}

export interface SpacingScale {
  base: number; // in pixels
  ratio: number;
  unit: string;
}

export interface SpacingValues {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
  80: string;
  96: string;
}

export interface LayoutSpacing {
  container: ContainerSpacing;
  section: SectionSpacing;
  grid: GridSpacing;
  flex: FlexSpacing;
}

export interface ContainerSpacing {
  padding: ContainerPadding;
  margin: ContainerMargin;
  gap: ContainerGap;
}

