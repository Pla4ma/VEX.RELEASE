import type { ColorPalette, ThemeMode } from './colorTypes';
import type {
  TypographyScale,
  FontFamilies,
  FontWeights,
  SpacingScale,
  BorderRadiusScale,
  ShadowScale,
  ZIndexScale,
  Breakpoints,
  AnimationTiming,
  OpacityScale,
} from './scaleTypes';

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

export interface ThemeConfig {
  defaultMode: ThemeMode;
  supportDarkMode: boolean;
  persistThemePreference: boolean;
  respectSystemPreference: boolean;
  transitionOnChange: boolean;
  transitionDuration: number;
}

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
  isSystem: boolean;
}

export type ThemeOverride = DeepPartial<Theme>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
