import type { TextStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

type BrandScale = {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
};
type StateScale = { 50: string; 500: string; light: string; DEFAULT: string; dark: string };
type SemanticColors = {
  background: string; backgroundElevated: string; backgroundMuted: string;
  surface: string; surfaceElevated: string; surfaceGlass: string;
  border: string; borderStrong: string;
  textPrimary: string; textSecondary: string; textMuted: string; textDisabled: string;
  primary: string; primaryPressed: string; primarySoft: string; secondary: string; accent: string;
  success: string; warning: string; danger: string; info: string;
  overlay: string; shadow: string; inputBackground: string; inputBorder: string;
  tabActive: string; tabInactive: string;
};

export interface ColorPalette {
  primary: BrandScale;
  success: StateScale;
  warning: StateScale;
  error: StateScale;
  info: StateScale;
  background: { primary: string; secondary: string; tertiary: string; elevated: string; overlay: string };
  text: {
    primary: string; secondary: string; tertiary: string; muted: string;
    inverse: string; disabled: string; placeholder: string; link: string;
  };
  border: { light: string; DEFAULT: string; strong: string; focus: string };
  surface: { card: string; input: string; button: string; hover: string; pressed: string; selected: string };
  accent: { purple: string; blue: string; green: string; orange: string; pink: string; teal: string };
  semantic: SemanticColors;
}

export interface TypographyScale {
  display: { large: TextStyle; medium: TextStyle; small: TextStyle };
  heading: { h1: TextStyle; h2: TextStyle; h3: TextStyle; h4: TextStyle; h5: TextStyle; h6: TextStyle };
  body: { large: TextStyle; medium: TextStyle; small: TextStyle };
  ui: { button: TextStyle; label: TextStyle; caption: TextStyle; overline: TextStyle };
}

export interface FontFamilies { primary: string; secondary?: string; mono?: string }
export interface FontWeights {
  light: TextStyle['fontWeight']; regular: TextStyle['fontWeight'];
  medium: TextStyle['fontWeight']; semibold: TextStyle['fontWeight'];
  bold: TextStyle['fontWeight']; heavy: TextStyle['fontWeight'];
}
export interface SpacingScale {
  0: number; 1: number; 2: number; 3: number; 4: number; 5: number; 6: number;
  8: number; 10: number; 12: number; 16: number; 20: number; 24: number;
}
export interface BorderRadiusScale {
  none: number; xs: number; sm: number; DEFAULT: number; md: number; lg: number;
  xl: number; '2xl': number; '3xl': number; full: number;
}
export interface ShadowScale {
  none: string; xs: string; sm: string; DEFAULT: string; md: string;
  lg: string; xl: string; '2xl': string; inner: string;
}
export interface ZIndexScale {
  auto: 'auto'; base: number; dropdown: number; sticky: number; fixed: number;
  modalBackdrop: number; modal: number; popover: number; tooltip: number; toast: number;
}
export interface Breakpoints { xs: number; sm: number; md: number; lg: number; xl: number; '2xl': number }
export type TimingFunction = 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
export interface AnimationTiming { instant: number; fast: number; normal: number; slow: number; verySlow: number }
export interface OpacityScale {
  0: number; 5: number; 10: number; 20: number; 30: number; 40: number;
  50: number; 60: number; 70: number; 80: number; 90: number; 100: number;
}

export interface Theme {
  name: string; mode: ThemeMode; colors: ColorPalette; typography: TypographyScale;
  fonts: FontFamilies; fontWeights: FontWeights; spacing: SpacingScale;
  borderRadius: BorderRadiusScale; shadows: ShadowScale; zIndex: ZIndexScale;
  breakpoints: Breakpoints; animation: AnimationTiming; opacity: OpacityScale;
}
export interface ThemeConfig {
  defaultMode: ThemeMode; supportDarkMode: boolean; persistThemePreference: boolean;
  respectSystemPreference: boolean; transitionOnChange: boolean; transitionDuration: number;
}
export interface ThemeContextValue {
  theme: Theme; mode: ThemeMode; setMode: (mode: ThemeMode) => void;
  toggleMode: () => void; isDark: boolean; isSystem: boolean;
}
export type ThemeOverride = DeepPartial<Theme>;
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
