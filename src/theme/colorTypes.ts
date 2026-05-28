export type ThemeMode = "light" | "dark" | "system";

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

type SemanticColors = {
  background: string;
  backgroundElevated: string;
  backgroundMuted: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
  shadow: string;
  inputBackground: string;
  inputBorder: string;
  tabActive: string;
  tabInactive: string;
};

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
  };
  semantic: SemanticColors;
}
