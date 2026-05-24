export interface PlatformSupport {
  platform: PlatformType;
  supported: boolean;
  limitations: string[];
  alternatives: string[];
}

export type PlatformType =
  | 'ios'
  | 'android'
  | 'web'
  | 'desktop'
  | 'console';

export interface VersionSupport {
  component: string;
  min_version: string;
  max_version?: string;
  breaking_changes: string[];
}

export interface ThemeFallback {
  condition: string;
  fallback_theme: string;
  reason: string;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  system: SystemColors;
  custom: CustomColor[];
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  background: BackgroundColors;
  text: TextColors;
  border: BorderColors;
  interactive: InteractiveColors;
}

export interface BackgroundColors {
  default: string;
  paper: string;
  elevated: string;
  overlay: string;
  modal: string;
  tooltip: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
  disabled: string;
  link: string;
  visited: string;
}

export interface BorderColors {
  default: string;
  focus: string;
  hover: string;
  active: string;
  disabled: string;
  error: string;
  success: string;
}

export interface InteractiveColors {
  button: ButtonColors;
  input: InputColors;
  link: LinkColors;
  selection: SelectionColors;
}

export interface ButtonColors {
  primary: ButtonStateColors;
  secondary: ButtonStateColors;
  tertiary: ButtonStateColors;
  danger: ButtonStateColors;
  ghost: ButtonStateColors;
}

export interface ButtonStateColors {
  default: string;
  hover: string;
  active: string;
  disabled: string;
  focus: string;
}

export interface InputColors {
  default: InputStateColors;
  error: InputStateColors;
  success: InputStateColors;
}

export interface InputStateColors {
  background: string;
  border: string;
  text: string;
  placeholder: string;
  focus: string;
}

export interface LinkColors {
  default: string;
  hover: string;
  active: string;
  visited: string;
  focus: string;
}

export interface SelectionColors {
  background: string;
  text: string;
  border: string;
}

export interface SystemColors {
  statusBar: string;
  navigationBar: string;
  tabBar: string;
  splash: string;
  loading: string;
  overlay: string;
}

export interface CustomColor {
  name: string;
  value: string;
  type: 'hex' | 'rgb' | 'hsl' | 'named';
  usage: string[];
  importance: 'low' | 'medium' | 'high';
}

